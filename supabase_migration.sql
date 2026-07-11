-- Out & About Schema Migration v2
-- Run this via Supabase SQL editor or management API
-- Adds: pricing, social, geolocation indexes, RLS policies

-- Step 1: Add new columns to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS referral_reward TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS referral_reward_type TEXT DEFAULT 'none';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS daily_limit INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS redeemed_count INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS was_repeat_of UUID REFERENCES deals(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS ghl_post_id TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS social_posted_at TIMESTAMPTZ;

-- Step 2: Add social accounts + GHL sub to stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS instagram_business_id TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS instagram_page_id TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS facebook_page_id TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS facebook_page_name TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS facebook_access_token TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS instagram_access_token TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS social_token_expires_at TIMESTAMPTZ;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS ghl_subaccount_id TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS deal_count INTEGER DEFAULT 0;

-- Step 3: Expand social_posts
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS platform_post_id TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Step 4: Modify favourites to support user-based system
ALTER TABLE favourites ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE favourites ALTER COLUMN device_id DROP NOT NULL;

-- Step 5: Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_location ON stores(lat, lng);
CREATE INDEX IF NOT EXISTS idx_deals_store_end ON deals(store_id, end_time);
CREATE INDEX IF NOT EXISTS idx_deals_active ON deals(is_published, end_time);
CREATE INDEX IF NOT EXISTS idx_deal_views_deal ON deal_views(deal_id);
CREATE INDEX IF NOT EXISTS idx_favourites_user ON favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_geo_time ON deals(store_id, end_time DESC);

-- Step 6: Auto-increment deal count on store
CREATE OR REPLACE FUNCTION increment_deal_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stores SET deal_count = deal_count + 1 WHERE id = NEW.store_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_deal_created ON deals;
CREATE TRIGGER on_deal_created
  AFTER INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION increment_deal_count();

-- Step 7: RLS Policies
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Public read stores
DROP POLICY IF EXISTS public_read_stores ON stores;
CREATE POLICY public_read_stores ON stores
  FOR SELECT USING (true);

-- Public read active deals, store members can see all
DROP POLICY IF EXISTS public_read_active_deals ON deals;
CREATE POLICY public_read_active_deals ON deals
  FOR SELECT
  USING (
    is_published = true 
    OR auth.uid() IN (
      SELECT user_id FROM store_memberships WHERE store_id = deals.store_id AND is_active = true
    )
  );

-- Store staff can manage deals
DROP POLICY IF EXISTS store_admin_manage_deals ON deals;
CREATE POLICY store_admin_manage_deals ON deals
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM store_memberships WHERE store_id = deals.store_id AND is_active = true
    )
  );

-- Store staff can update their store
DROP POLICY IF EXISTS store_members_manage_stores ON stores;
CREATE POLICY store_members_manage_stores ON stores
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM store_memberships WHERE store_id = stores.id AND is_active = true
    )
  );

-- Users manage their own favourites
DROP POLICY IF EXISTS user_manage_favourites ON favourites;
CREATE POLICY user_manage_favourites ON favourites
  FOR ALL
  USING (auth.uid() = user_id);

-- Public can insert deal views
DROP POLICY IF EXISTS public_insert_views ON deal_views;
CREATE POLICY public_insert_views ON deal_views
  FOR INSERT WITH CHECK (true);

-- Public read social posts
DROP POLICY IF EXISTS public_read_social_posts ON social_posts;
CREATE POLICY public_read_social_posts ON social_posts
  FOR SELECT USING (true);
