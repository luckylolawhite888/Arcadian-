// Out & About - Store App API Service v2
import { supabase } from './supabase';
import { Store, Deal, DealFormData, StoreMembership, StoreStats } from '../types';

// ─── Auth ───

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata || {} },
  });
  return { data, error };
};

export const signInWithMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({ email });
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const logout = async () => {
  await supabase.auth.signOut();
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};

// ─── Stores ───

export const getMyStore = async (userId: string) => {
  const { data: membership, error: me } = await supabase
    .from('store_memberships')
    .select('*, store:stores(*)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (me || !membership) return { store: null, membership: null };
  
  return {
    store: membership.store as unknown as Store,
    membership: membership as unknown as StoreMembership,
  };
};

export const updateStore = async (storeId: string, updates: Partial<Store>) => {
  const { data, error } = await supabase
    .from('stores')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', storeId)
    .select()
    .single();

  return { data, error };
};

export const getStore = async (storeId: string) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();

  return { data, error };
};

// ─── Deals ───

export const createDeal = async (
  storeId: string,
  formData: Partial<DealFormData>,
  publishNow: boolean,
  imageUrls: string[] = []
) => {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      store_id: storeId,
      title: formData.title,
      description: formData.description || null,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
      deal_type: formData.deal_type || 'end_of_day',
      start_time: formData.start_time?.toISOString() || new Date().toISOString(),
      end_time: formData.end_time?.toISOString() || new Date(Date.now() + 3600000).toISOString(),
      is_published: publishNow,
      is_auto_removed: false,
      ai_generated: false,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      currency: formData.currency || 'GBP',
      referral_reward: formData.referral_reward || null,
      referral_reward_type: formData.referral_reward_type || 'none',
      daily_limit: formData.daily_limit ? parseInt(formData.daily_limit) : 0,
      redeemed_count: 0,
    })
    .select()
    .single();

  return { data, error };
};

export const getMyDeals = async (storeId: string) => {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error || !data) return { active: [], drafts: [], expired: [] };

  const now = new Date().toISOString();
  const active: Deal[] = [];
  const drafts: Deal[] = [];
  const expired: Deal[] = [];

  for (const deal of data) {
    if (!deal.is_published) {
      drafts.push(deal);
    } else if (deal.end_time && deal.end_time < now) {
      expired.push(deal);
    } else {
      active.push(deal);
    }
  }

  return { active, drafts, expired };
};

export const getDeal = async (dealId: string) => {
  const { data, error } = await supabase
    .from('deals')
    .select('*, store:stores(*)')
    .eq('id', dealId)
    .single();

  return { data, error };
};

export const endDealEarly = async (dealId: string) => {
  const { data, error } = await supabase
    .from('deals')
    .update({ end_time: new Date().toISOString(), is_published: false })
    .eq('id', dealId)
    .select()
    .single();

  return { data, error };
};

export const deleteDeal = async (dealId: string) => {
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', dealId);

  return { error };
};

export const repeatDeal = async (deal: Deal) => {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      store_id: deal.store_id,
      title: deal.title,
      description: deal.description,
      image_urls: deal.image_urls,
      deal_type: deal.deal_type,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000 * 5).toISOString(),
      is_published: false,
      is_auto_removed: false,
      ai_generated: false,
      original_price: deal.original_price,
      discount_percent: deal.discount_percent,
      discount_price: deal.discount_price,
      currency: deal.currency || 'GBP',
      referral_reward: deal.referral_reward,
      referral_reward_type: deal.referral_reward_type,
      daily_limit: deal.daily_limit,
      was_repeat_of: deal.id,
    })
    .select()
    .single();

  return { data, error };
};

// ─── Stats ───

export const getDealStats = async (dealId: string): Promise<{ views: number; redemptions: number }> => {
  const { count: views } = await supabase
    .from('deal_views')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId);

  const { count: redemptions } = await supabase
    .from('deal_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId);

  return { views: views || 0, redemptions: redemptions || 0 };
};

export const getStoreStats = async (storeId: string): Promise<StoreStats> => {
  const now = new Date().toISOString();

  const { data: deals } = await supabase
    .from('deals')
    .select('id')
    .eq('store_id', storeId)
    .eq('is_published', true)
    .gt('end_time', now);

  const activeDeals = deals?.length || 0;

  // Get all deal IDs for this store
  const { data: allDeals } = await supabase
    .from('deals')
    .select('id')
    .eq('store_id', storeId);

  const dealIds = allDeals?.map(d => d.id) || [];

  let totalViews = 0;
  let totalRedemptions = 0;
  let totalFavourites = 0;

  if (dealIds.length > 0) {
    // Batch query views
    for (const id of dealIds) {
      const v = await getDealStats(id);
      totalViews += v.views;
      totalRedemptions += v.redemptions;
    }

    const { count: favCount } = await supabase
      .from('favourites')
      .select('*', { count: 'exact', head: true })
      .in('deal_id', dealIds);

    totalFavourites = favCount || 0;
  }

  return {
    activeDeals,
    totalViews,
    totalRedemptions,
    totalFavourites,
    conversionRate: totalViews > 0 ? Math.round((totalRedemptions / totalViews) * 100) : 0,
  };
};

// ─── Image Upload ───

export const uploadImage = async (bucket: string, uri: string): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
};

// ─── Social Posting ───

export const postToSocial = async (
  dealId: string,
  platform: 'instagram' | 'facebook',
  content: string,
  imageUrl?: string
) => {
  // Store the social post attempt in Supabase
  const { data, error } = await supabase
    .from('social_posts')
    .insert({
      deal_id: dealId,
      platform: platform,
      posted_at: new Date().toISOString(),
      status: 'pending',
    })
    .select()
    .single();

  // In production, this would POST to Meta Graph API
  // For now, we track the intent and the server will process it
  // The server endpoint at /sync-deal will handle actual posting

  return { data, error };
};

// ─── Translation ───

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  try {
    // Try LibreTranslate if available locally
    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang,
        format: 'text',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.translatedText;
    }
  } catch {
    // Fallback: no translation service available
    console.log('Translation service unavailable, returning original text');
  }

  return text; // Return original if translation fails
};

// ─── GHL Sync (optional) ───

export const syncDealToGHL = async (dealId: string) => {
  try {
    await fetch('http://localhost:8790/sync-deal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deal_id: dealId }),
    });
  } catch (err) {
    console.error('GHL sync failed:', err);
  }
};
