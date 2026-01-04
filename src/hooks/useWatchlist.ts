import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  added_at: string;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch watchlist
  const fetchWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (fetchError) throw fetchError;
      setWatchlist(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add to watchlist
  const addToWatchlist = useCallback(async (ticker: string, name: string, sector?: string) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error: insertError } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          ticker,
          name,
          sector: sector || null,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          return { success: false, error: 'Stock already in watchlist' };
        }
        throw insertError;
      }

      await fetchWatchlist();
      return { success: true };
    } catch (err: any) {
      console.error('Error adding to watchlist:', err);
      return { success: false, error: err.message };
    }
  }, [user, fetchWatchlist]);

  // Remove from watchlist
  const removeFromWatchlist = useCallback(async (ticker: string) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error: deleteError } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('ticker', ticker);

      if (deleteError) throw deleteError;

      await fetchWatchlist();
      return { success: true };
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      return { success: false, error: err.message };
    }
  }, [user, fetchWatchlist]);

  // Check if stock is in watchlist
  const isInWatchlist = useCallback((ticker: string) => {
    return watchlist.some(item => item.ticker === ticker);
  }, [watchlist]);

  // Toggle watchlist
  const toggleWatchlist = useCallback(async (ticker: string, name: string, sector?: string) => {
    if (isInWatchlist(ticker)) {
      return removeFromWatchlist(ticker);
    } else {
      return addToWatchlist(ticker, name, sector);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return {
    watchlist,
    loading,
    error,
    fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
  };
}