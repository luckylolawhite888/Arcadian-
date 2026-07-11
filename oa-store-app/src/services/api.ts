import { supabase } from './supabase';
import { Deal, Store, StoreMembership, DealView, DealFormData, DEAL_TYPE_LABELS } from '../types';

// ─── AUTH ────────────────────────────────────────────────

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signUpStoreOwner(email: string, password: string, storeId: string) {
  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return { error: authError };

  // Create membership link
  if (authData.user) {
    const membershipNumber = `MEM-${storeId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const { error: memError } = await supabase.from('store_memberships').insert({
      store_id: storeId,
      user_id: authData.user.id,
      role: 'owner',
      membership_number: membershipNumber,
    });
    return { data: authData, membership_number: membershipNumber, error: memError };
  }
  return { error: new Error('User creation failed') };
}

export async function logout() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─── STORE ────────────────────────────────────────────────

export async function getMyStore(userId: string): Promise<{ store: Store | null; membership: StoreMembership | null; error: any }> {
  // Get memberships for this user
  const { data: memberships, error: memError } = await supabase
    .from('store_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (memError || !memberships) return { store: null, membership: null, error: memError };

  // Get the store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('id', memberships.store_id)
    .single();

  return { store, membership: memberships, error: storeError };
}

export async function updateStore(storeId: string, updates: Partial<Store>) {
  const { data, error } = await supabase
    .from('stores')
    .update(updates)
    .eq('id', storeId)
    .select()
    .single();
  return { data, error };
}

// ─── DEALS ────────────────────────────────────────────────

export async function getMyDeals(storeId: string): Promise<{ active: Deal[]; drafts: Deal[]; expired: Deal[] }> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error || !data) return { active: [], drafts: [], expired: [] };

  const now = new Date().toISOString();
  const active = data.filter(d => d.is_published && d.end_time > now && !d.is_auto_removed);
  const drafts = data.filter(d => !d.is_published);
  const expired = data.filter(d => d.is_published && (d.end_time <= now || d.is_auto_removed));

  return { active, drafts, expired };
}

export async function createDeal(storeId: string, formData: DealFormData, published: boolean, imageUrls: string[] = []) {
  const { data, error } = await supabase
    .from('deals')
    .insert({
      store_id: storeId,
      title: formData.title,
      description: formData.description,
      image_urls: imageUrls.length > 0 ? imageUrls : formData.images.map(i => i.uri).filter(u => u.startsWith('http')),
      deal_type: formData.deal_type,
      start_time: formData.start_time.toISOString(),
      end_time: formData.end_time.toISOString(),
      is_published: published,
      ai_generated: false,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateDeal(dealId: string, updates: Partial<Deal>) {
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .select()
    .single();
  return { data, error };
}

export async function endDealEarly(dealId: string) {
  return updateDeal(dealId, { is_published: false, is_auto_removed: true });
}

export async function deleteDeal(dealId: string) {
  const { error } = await supabase.from('deals').delete().eq('id', dealId);
  return { error };
}

export async function repeatDeal(originalDeal: Deal): Promise<{ data: Deal | null; error: any }> {
  // Copy the deal with new timestamps
  const now = new Date();
  const end = new Date(now.getTime() + 5 * 60 * 60 * 1000); // +5 hours default

  const { data: newDeal, error } = await supabase
    .from('deals')
    .insert({
      store_id: originalDeal.store_id,
      title: originalDeal.title,
      description: originalDeal.description,
      image_urls: originalDeal.image_urls,
      deal_type: originalDeal.deal_type,
      start_time: now.toISOString(),
      end_time: end.toISOString(),
      is_published: false,
      ai_generated: originalDeal.ai_generated,
    })
    .select()
    .single();

  if (!error && newDeal) {
    // Log the repeat
    await supabase.from('deal_repeats').insert({
      original_deal_id: originalDeal.id,
      new_deal_id: newDeal.id,
    });
  }

  return { data: newDeal, error };
}

// ─── ANALYTICS ────────────────────────────────────────────

export async function getDealStats(dealId: string): Promise<{ views: number; redemptions: number }> {
  const { count: views } = await supabase
    .from('deal_views')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId);

  const { count: redemptions } = await supabase
    .from('deal_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('deal_id', dealId);

  return { views: views || 0, redemptions: redemptions || 0 };
}

export async function getStoreStats(storeId: string): Promise<{ activeDeals: number; totalViews: number; totalRedemptions: number }> {
  const { data: deals } = await supabase
    .from('deals')
    .select('id')
    .eq('store_id', storeId)
    .eq('is_published', true);

  const dealIds = (deals || []).map(d => d.id);
  const now = new Date().toISOString();

  // Active deals count
  const { data: activeDeals } = await supabase
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('is_published', true)
    .gt('end_time', now);

  // Total views across all deals
  let totalViews = 0;
  let totalRedemptions = 0;
  if (dealIds.length > 0) {
    const { count: views } = await supabase
      .from('deal_views')
      .select('*', { count: 'exact', head: true })
      .in('deal_id', dealIds);

    const { count: redemptions } = await supabase
      .from('deal_redemptions')
      .select('*', { count: 'exact', head: true })
      .in('deal_id', dealIds);

    totalViews = views || 0;
    totalRedemptions = redemptions || 0;
  }

  return {
    activeDeals: activeDeals?.length || 0,
    totalViews,
    totalRedemptions,
  };
}

// ─── STORAGE ──────────────────────────────────────────────

export async function uploadImage(bucket: 'deal-images' | 'store-logos', uri: string): Promise<string | null> {
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

  // For React Native, we need to fetch the image as blob first
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}
