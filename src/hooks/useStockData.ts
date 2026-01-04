import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number;
  dividendYield: number;
  sector: string;
  currency: string;
  exchange: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  volume: number;
  avgVolume: number;
}

export interface StockHistory {
  symbol: string;
  currency: string;
  history: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface StockFinancials {
  incomeStatements: {
    year: number;
    revenue: number;
    grossProfit: number;
    operatingIncome: number;
    netIncome: number;
    eps: number;
  }[];
  ratios: {
    roe: number;
    roa: number;
    profitMargin: number;
    operatingMargin: number;
    currentRatio: number;
    debtToEquity: number;
    pe: number;
    pb: number;
    ps: number;
    pegRatio: number;
    beta: number;
  };
  balanceSheets: {
    year: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    cash: number;
    totalDebt: number;
  }[];
  cashflows: {
    year: number;
    operatingCashflow: number;
    investingCashflow: number;
    financingCashflow: number;
    freeCashflow: number;
  }[];
}

export function useStockData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async (symbols: string[]): Promise<StockQuote[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stock-data', {
        body: { symbols, action: 'quote' }
      });
      
      if (fnError) throw fnError;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (symbol: string): Promise<StockHistory | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stock-data', {
        body: { symbols: symbol, action: 'history' }
      });
      
      if (fnError) throw fnError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFinancials = useCallback(async (symbol: string): Promise<StockFinancials | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stock-data', {
        body: { symbols: symbol, action: 'financials' }
      });
      
      if (fnError) throw fnError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchStocks = useCallback(async (query: string): Promise<any[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('stock-data', {
        body: { query, action: 'search' }
      });
      
      if (fnError) throw fnError;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchQuotes,
    fetchHistory,
    fetchFinancials,
    searchStocks,
  };
}
