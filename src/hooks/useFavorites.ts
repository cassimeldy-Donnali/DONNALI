import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useFavorites(user: User | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);
      if (data) setFavoriteIds(new Set(data.map((r) => r.listing_id)));
      setLoading(false);
    })();
  }, [user]);

  const toggle = useCallback(async (listingId: string): Promise<boolean> => {
    if (!user) return false;

    if (favoriteIds.has(listingId)) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
      if (!error) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listingId });
      if (!error) {
        setFavoriteIds((prev) => new Set([...prev, listingId]));
        return true;
      }
    }
    return favoriteIds.has(listingId);
  }, [user, favoriteIds]);

  return { favoriteIds, loading, toggle };
}
