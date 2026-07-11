// Out & About - Type definitions v2 (expanded)

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  address: string;
  postcode: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // v2 additions
  instagram_business_id?: string | null;
  instagram_page_id?: string | null;
  facebook_page_id?: string | null;
  facebook_page_name?: string | null;
  facebook_access_token?: string | null;
  instagram_access_token?: string | null;
  social_token_expires_at?: string | null;
  ghl_subaccount_id?: string | null;
  deal_count?: number;
}

export type DealType = 'end_of_day' | 'flash_sale' | 'ongoing' | 'seasonal';
export type DealStatus = 'active' | 'draft' | 'expired';
export type ReferralType = 'none' | 'item' | 'discount';

export interface Deal {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  image_urls: string[];
  deal_type: DealType;
  start_time: string;
  end_time: string;
  is_published: boolean;
  is_auto_removed: boolean;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
  // v2 additions
  original_price?: number | null;
  discount_percent?: number;
  discount_price?: number | null;
  currency?: string;
  referral_reward?: string | null;
  referral_reward_type?: ReferralType;
  daily_limit?: number;
  redeemed_count?: number;
  was_repeat_of?: string | null;
  ghl_post_id?: string | null;
  social_posted_at?: string | null;
  // Joined fields
  store?: Store;
}

export interface StoreMembership {
  id: string;
  store_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'staff';
  membership_number: string;
  is_active: boolean;
  created_at: string;
}

export interface DealFormData {
  title: string;
  description: string;
  images: { uri: string; base64?: string }[];
  deal_type: DealType;
  start_time: Date;
  end_time: Date;
  original_price?: string;
  discount_percent?: string;
  discount_price?: string;
  currency: string;
  referral_reward: string;
  referral_reward_type: ReferralType;
  daily_limit: string;
  post_to_oa: boolean;
  post_to_instagram: boolean;
  post_to_facebook: boolean;
  post_to_whatsapp: boolean;
}

export interface SocialConnection {
  platform: 'instagram' | 'facebook';
  connected: boolean;
  page_name?: string;
  page_id?: string;
  token_expires_at?: string;
}

export interface StoreStats {
  activeDeals: number;
  totalViews: number;
  totalRedemptions: number;
  totalFavourites: number;
  conversionRate: number;
}

export const DEAL_TYPE_LABELS: Record<DealType, { label: string; emoji: string; color: string; desc: string }> = {
  end_of_day: { label: 'End of Day', emoji: '🔴', color: '#E74C3C', desc: 'Ends at close of business today' },
  flash_sale: { label: 'Flash Sale', emoji: '🟡', color: '#F39C12', desc: 'Urgent, time-limited offer' },
  ongoing: { label: 'Ongoing', emoji: '🟢', color: '#27AE60', desc: 'Lasts for multiple days or more' },
  seasonal: { label: 'Seasonal', emoji: '🔵', color: '#2980B9', desc: 'Seasonal or event-based offer' },
};

export const DEAL_DURATIONS = [
  { label: '1 Hour', hours: 1 },
  { label: '2 Hours', hours: 2 },
  { label: '4 Hours', hours: 4 },
  { label: 'Today Only', hours: 8 },
  { label: 'This Weekend', hours: 48 },
  { label: 'All Week', hours: 168 },
  { label: 'Custom', hours: 0 },
];

export const CATEGORIES = [
  'cafe', 'restaurant', 'barber', 'retail', 'bakery',
  'gym', 'beauty', 'pizza', 'takeaway', 'other', 'grocery',
  'fashion', 'electronics', 'services', 'entertainment',
];

export const DEFAULT_CURRENCY = 'GBP';
export const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};
