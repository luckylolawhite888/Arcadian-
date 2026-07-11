// Out & About - Type definitions

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
}

export type DealType = 'end_of_day' | 'flash_sale' | 'ongoing' | 'seasonal';
export type DealStatus = 'active' | 'draft' | 'expired';

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

export interface DealView {
  id: string;
  deal_id: string;
  viewed_at: string;
  device_id: string | null;
}

export interface SocialPost {
  id: string;
  deal_id: string;
  platform: string;
  posted_at: string;
  post_url: string | null;
  status: 'pending' | 'posted' | 'failed';
}

export interface DealFormData {
  title: string;
  description: string;
  images: { uri: string; base64?: string }[];
  deal_type: DealType;
  start_time: Date;
  end_time: Date;
  post_to_oa: boolean;
  post_to_instagram: boolean;
  post_to_facebook: boolean;
  post_to_whatsapp: boolean;
}

export const DEAL_TYPE_LABELS: Record<DealType, { label: string; emoji: string; color: string }> = {
  end_of_day: { label: 'End of Day', emoji: '🔴', color: '#E74C3C' },
  flash_sale: { label: 'Flash Sale', emoji: '🟡', color: '#F39C12' },
  ongoing: { label: 'Ongoing', emoji: '🟢', color: '#27AE60' },
  seasonal: { label: 'Seasonal', emoji: '🔵', color: '#2980B9' },
};

export const CATEGORIES = [
  'cafe', 'restaurant', 'barber', 'retail', 'bakery',
  'gym', 'beauty', 'pizza', 'takeaway', 'other'
];
