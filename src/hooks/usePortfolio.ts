import { useState, useEffect, useCallback } from 'react';

export interface PortfolioHolding {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  average_price: number;
  current_price: number;
  currency: string;
}

const STORAGE_KEY = 'portfolio_holdings';

export function usePortfolio() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHoldings = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHoldings(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error fetching holdings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const saveHoldings = (newHoldings: PortfolioHolding[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHoldings));
    setHoldings(newHoldings);
  };

  const addHolding = async (
    ticker: string,
    name: string,
    quantity: number,
    price: number,
    currency: string = 'USD'
  ) => {
    try {
      const existing = holdings.find(h => h.ticker === ticker);

      if (existing) {
        const oldQty = existing.quantity;
        const oldAvg = existing.average_price;
        const newQty = oldQty + quantity;
        const newAvg = ((oldQty * oldAvg) + (quantity * price)) / newQty;

        const updated = holdings.map(h => 
          h.ticker === ticker 
            ? { ...h, quantity: newQty, average_price: newAvg, current_price: price }
            : h
        );
        saveHoldings(updated);
      } else {
        const newHolding: PortfolioHolding = {
          id: crypto.randomUUID(),
          ticker,
          name,
          quantity,
          average_price: price,
          current_price: price,
          currency,
        };
        saveHoldings([...holdings, newHolding]);
      }

      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const removeHolding = async (id: string) => {
    try {
      const updated = holdings.filter(h => h.id !== id);
      saveHoldings(updated);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const updateCurrentPrices = async (priceMap: Record<string, number>) => {
    if (holdings.length === 0) return;

    const updated = holdings.map(h => ({
      ...h,
      current_price: priceMap[h.ticker] || h.current_price,
    }));
    saveHoldings(updated);
  };

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