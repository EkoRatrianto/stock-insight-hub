import { useState, useEffect, useCallback } from 'react';

export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  added_at: string;
}

const STORAGE_KEY = 'watchlist_items';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWatchlist = (newWatchlist: WatchlistItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWatchlist));
    setWatchlist(newWatchlist);
  };

  const addToWatchlist = useCallback(async (ticker: string, name: string, sector?: string) => {
    try {
      const existing = watchlist.find(item => item.ticker === ticker);
      if (existing) {
        return { success: false, error: 'Stock already in watchlist' };
      }

      const newItem: WatchlistItem = {
        id: crypto.randomUUID(),
        ticker,
        name,
        sector: sector || null,
        added_at: new Date().toISOString(),
      };

      saveWatchlist([newItem, ...watchlist]);
      return { success: true };
    } catch (err: any) {
      console.error('Error adding to watchlist:', err);
      return { success: false, error: err.message };
    }
  }, [watchlist]);

  const removeFromWatchlist = useCallback(async (ticker: string) => {
    try {
      const updated = watchlist.filter(item => item.ticker !== ticker);
      saveWatchlist(updated);
      return { success: true };
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      return { success: false, error: err.message };
    }
  }, [watchlist]);

  const isInWatchlist = useCallback((ticker: string) => {
    return watchlist.some(item => item.ticker === ticker);
  }, [watchlist]);

  const toggleWatchlist = useCallback(async (ticker: string, name: string, sector?: string) => {
    if (isInWatchlist(ticker)) {
      return removeFromWatchlist(ticker);
    } else {
      return addToWatchlist(ticker, name, sector);
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

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