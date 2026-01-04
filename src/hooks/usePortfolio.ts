import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PortfolioHolding {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  average_price: number;
  current_price: number;
  currency: string;
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHoldings = useCallback(async () => {
    if (!user) {
      setHoldings([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setHoldings((data || []).map(h => ({
        id: h.id,
        ticker: h.ticker,
        name: h.name,
        quantity: Number(h.quantity),
        average_price: Number(h.average_price),
        current_price: Number(h.current_price),
        currency: h.currency || 'USD',
      })));
    } catch (err) {
      console.error('Error fetching holdings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const addHolding = async (
    ticker: string,
    name: string,
    quantity: number,
    price: number,
    currency: string = 'USD'
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('ticker', ticker)
        .single();

      if (existing) {
        // Update existing - recalculate average price
        const oldQty = Number(existing.quantity);
        const oldAvg = Number(existing.average_price);
        const newQty = oldQty + quantity;
        const newAvg = ((oldQty * oldAvg) + (quantity * price)) / newQty;

        const { error } = await supabase
          .from('portfolio_holdings')
          .update({
            quantity: newQty,
            average_price: newAvg,
            current_price: price,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('portfolio_holdings')
          .insert({
            user_id: user.id,
            ticker,
            name,
            quantity,
            average_price: price,
            current_price: price,
            currency,
          });

        if (error) throw error;
      }

      await fetchHoldings();
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const removeHolding = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchHoldings();
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const updateCurrentPrices = async (priceMap: Record<string, number>) => {
    if (!user || holdings.length === 0) return;

    for (const holding of holdings) {
      if (priceMap[holding.ticker]) {
        await supabase
          .from('portfolio_holdings')
          .update({ current_price: priceMap[holding.ticker] })
          .eq('id', holding.id);
      }
    }
    await fetchHoldings();
  };

  // Calculate totals
  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.average_price), 0);
  const totalPL = totalValue - totalCost;
  const totalPLPercent = totalCost > 0 ? ((totalPL / totalCost) * 100) : 0;

  return {
    holdings,
    loading,
    addHolding,
    removeHolding,
    updateCurrentPrices,
    fetchHoldings,
    totalValue,
    totalCost,
    totalPL,
    totalPLPercent,
  };
}
