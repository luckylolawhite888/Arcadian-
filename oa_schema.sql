-- ============================================================
-- Out & About - Full Database Schema
-- Two apps: Consumer App + Store Owner App
-- ============================================================

-- 1. STORES (signed up businesses)
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT, -- cafe, restaurant, barber, retail, etc
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  cover_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. STORE MEMBERSHIPS (auth users who manage stores)
CREATE TABLE store_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'owner', -- owner, manager, staff
  membership_number TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- 3. DEALS
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_urls TEXT[], -- array of up to 3 images
  deal_type TEXT NOT NULL CHECK (deal_type IN ('end_of_day', 'flash_sale', 'ongoing', 'seasonal')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN DEFAULT false,
  is_auto_removed BOOLEAN DEFAULT false, -- true when timer ends
  ai_generated BOOLEAN DEFAULT false, -- true if written by AI
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. DEAL VIEWS (analytics - anonymous)
CREATE TABLE deal_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  device_id TEXT -- anonymous device identifier
);

-- 5. DEAL REDEMPTIONS (tracked by device ID for MVP)
CREATE TABLE deal_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  device_id TEXT -- anonymous device identifier
);

-- 6. FAVOURITES (consumer follows a store - by device)
CREATE TABLE favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, device_id)
);

-- 7. SOCIAL POSTS LOG (track what was posted where)
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'instagram', 'facebook', 'whatsapp', 'oa'
  posted_at TIMESTAMPTZ DEFAULT now(),
  post_url TEXT,
  status TEXT DEFAULT 'pending' -- pending, posted, failed
);

-- 8. DEAL REPEATS (for the repeat deal feature)
CREATE TABLE deal_repeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_deal_id UUID REFERENCES deals(id),
  new_deal_id UUID REFERENCES deals(id),
  repeated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_deals_store_id ON deals(store_id);
CREATE INDEX idx_deals_timing ON deals(start_time, end_time);
CREATE INDEX idx_deals_published ON deals(is_published) WHERE is_published = true;
CREATE INDEX idx_deal_views_deal_id ON deal_views(deal_id);
CREATE INDEX idx_favourites_device ON favourites(device_id);
CREATE INDEX idx_favourites_store ON favourites(store_id);
CREATE INDEX idx_stores_postcode ON stores(postcode);
CREATE INDEX idx_stores_location ON stores(lat, lng);

-- Functions

-- Auto-remove expired deals
CREATE OR REPLACE FUNCTION auto_remove_expired_deals()
RETURNS void AS $$
BEGIN
  UPDATE deals
  SET is_published = false, is_auto_removed = true
  WHERE is_published = true AND end_time < now();
END;
$$ LANGUAGE plpgsql;

-- Get active deals near a location
CREATE OR REPLACE FUNCTION get_nearby_deals(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_km DOUBLE PRECISION DEFAULT 5,
  p_device_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  deal_id UUID,
  title TEXT,
  description TEXT,
  image_urls TEXT[],
  deal_type TEXT,
  end_time TIMESTAMPTZ,
  store_id UUID,
  store_name TEXT,
  store_slug TEXT,
  store_logo TEXT,
  distance_km DOUBLE PRECISION,
  is_favourite BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.description,
    d.image_urls,
    d.deal_type,
    d.end_time,
    s.id,
    s.name,
    s.slug,
    s.logo_url,
    (6371 * acos(cos(radians(p_lat)) * cos(radians(s.lat)) * cos(radians(s.lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(s.lat))))::numeric(10,2),
    CASE WHEN f.id IS NOT NULL THEN true ELSE false END
  FROM deals d
  JOIN stores s ON s.id = d.store_id AND s.is_active = true
  LEFT JOIN favourites f ON f.store_id = s.id AND f.device_id = p_device_id
  WHERE d.is_published = true
    AND d.end_time > now()
    AND s.lat IS NOT NULL
    AND s.lng IS NOT NULL
    AND (6371 * acos(cos(radians(p_lat)) * cos(radians(s.lat)) * cos(radians(s.lng) - radians(p_lng)) + sin(radians(p_lat)) * sin(radians(s.lat)))) <= p_radius_km
  ORDER BY distance_km ASC, d.end_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Consumer: anyone can read published deals
CREATE POLICY "Anyone can view published deals" ON deals
  FOR SELECT USING (is_published = true);

-- Consumers: anyone can read active stores
CREATE POLICY "Anyone can view active stores" ON stores
  FOR SELECT USING (is_active = true);

-- Consumers: anyone can log a deal view (anonymous)
CREATE POLICY "Anyone can log deal views" ON deal_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own views" ON deal_views
  FOR SELECT USING (true);

-- Consumers: anyone can log a redemption
CREATE POLICY "Anyone can log redemptions" ON deal_redemptions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read redemptions" ON deal_redemptions
  FOR SELECT USING (true);

-- Consumers: manage their own favourites by device_id
CREATE POLICY "Anyone can manage their favourites" ON favourites
  FOR ALL USING (true)
  WITH CHECK (true);

-- Store owners: manage their own deals
CREATE POLICY "Store owners manage their deals" ON deals
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM store_memberships
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Store owners: manage their own store
CREATE POLICY "Store owners manage their store" ON stores
  FOR ALL USING (
    id IN (
      SELECT store_id FROM store_memberships
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Store owners: see their own memberships
CREATE POLICY "Users see own memberships" ON store_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Store owners: see their own social posts
CREATE POLICY "Store owners see own social posts" ON social_posts
  FOR ALL USING (
    deal_id IN (
      SELECT id FROM deals WHERE store_id IN (
        SELECT store_id FROM store_memberships WHERE user_id = auth.uid()
      )
    )
  );

-- Storage buckets
-- bucket: 'deal-images' (public)
-- bucket: 'store-logos' (public)
