import { supabase } from './supabase';

async function getAuthHeaders(): Promise<HeadersInit | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

async function callAdminAction<T>(body: Record<string, unknown>): Promise<T> {
  const headers = await getAuthHeaders();
  if (!headers) throw new Error('Non authentifié.');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/admin-action`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data as T;
}

export interface AdminStats {
  totalListings: number;
  activeListings: number;
  totalUsers: number;
  totalUnlocks: number;
}

export interface AdminListing {
  id: string;
  user_id: string;
  departure: string;
  destination: string;
  flight_date: string;
  kilos_available: number;
  price_per_kilo: number;
  is_active: boolean;
  is_published: boolean;
  created_at: string;
  expires_at: string | null;
  profiles?: { full_name: string; email?: string };
}

export interface AdminUser {
  id: string;
  full_name: string;
  is_admin: boolean;
  is_suspended: boolean;
  identity_verified: boolean;
  flight_verified: boolean;
  trust_score: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export const adminApi = {
  getStats: () => callAdminAction<AdminStats>({ action: 'get_stats' }),

  getListings: () =>
    callAdminAction<{ listings: AdminListing[] }>({ action: 'get_listings' }).then((r) => r.listings),

  getUsers: () =>
    callAdminAction<{ users: AdminUser[] }>({ action: 'get_users' }).then((r) => r.users),

  toggleListingPublished: (listing_id: string, is_published: boolean) =>
    callAdminAction<{ success: boolean }>({ action: 'toggle_listing_published', listing_id, is_published }),

  deleteListing: (listing_id: string) =>
    callAdminAction<{ success: boolean }>({ action: 'delete_listing', listing_id }),

  toggleAdmin: (user_id: string, is_admin: boolean) =>
    callAdminAction<{ success: boolean }>({ action: 'toggle_admin', user_id, is_admin }),

  suspendUser: (user_id: string, permanent: boolean, reason: string, duration_days: number | null) =>
    callAdminAction<{ success: boolean }>({ action: 'suspend_user', user_id, permanent, reason, duration_days }),
};
