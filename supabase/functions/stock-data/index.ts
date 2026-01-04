import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YahooQuote {
  symbol: string;
  shortName: string;
  longName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  marketCap: number;
  trailingPE: number;
  dividendYield: number;
  sector: string;
  currency: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols, action } = await req.json();
    
    if (action === 'search') {
      const { query } = await req.json();
      const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const data = await response.json();
      return new Response(JSON.stringify(data.quotes || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'quote') {
      const symbolList = Array.isArray(symbols) ? symbols.join(',') : symbols;
      const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolList)}`;
      
      console.log('Fetching quotes for:', symbolList);
      
      const response = await fetch(quoteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const data = await response.json();
      const quotes = data.quoteResponse?.result || [];
      
      const formattedQuotes = quotes.map((q: any) => ({
        symbol: q.symbol,
        name: q.longName || q.shortName || q.symbol,
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePercent: q.regularMarketChangePercent,
        marketCap: q.marketCap,
        pe: q.trailingPE,
        dividendYield: q.trailingAnnualDividendYield,
        sector: q.sector || 'N/A',
        currency: q.currency,
        exchange: q.exchange,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow,
        volume: q.regularMarketVolume,
        avgVolume: q.averageDailyVolume3Month,
      }));
      
      return new Response(JSON.stringify(formattedQuotes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'history') {
      const symbol = Array.isArray(symbols) ? symbols[0] : symbols;
      const period = '5y';
      const interval = '1mo';
      
      const historyUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=0&period2=9999999999&interval=${interval}&range=${period}`;
      
      console.log('Fetching history for:', symbol);
      
      const response = await fetch(historyUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) {
        return new Response(JSON.stringify({ error: 'No data found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      
      const history = timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        open: quotes.open?.[i],
        high: quotes.high?.[i],
        low: quotes.low?.[i],
        close: quotes.close?.[i],
        volume: quotes.volume?.[i],
      })).filter((h: any) => h.close !== null);
      
      return new Response(JSON.stringify({
        symbol,
        currency: result.meta?.currency,
        history
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'financials') {
      const symbol = Array.isArray(symbols) ? symbols[0] : symbols;
      
      // Fetch financial data from Yahoo Finance
      const modules = 'incomeStatementHistory,balanceSheetHistory,cashflowStatementHistory,financialData,defaultKeyStatistics';
      const financialsUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`;
      
      console.log('Fetching financials for:', symbol);
      
      const response = await fetch(financialsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const data = await response.json();
      const result = data.quoteSummary?.result?.[0];
      
      if (!result) {
        return new Response(JSON.stringify({ error: 'No financial data found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const incomeStatements = result.incomeStatementHistory?.incomeStatementHistory || [];
      const balanceSheets = result.balanceSheetHistory?.balanceSheetHistory || [];
      const cashflows = result.cashflowStatementHistory?.cashflowStatementHistory || [];
      const keyStats = result.defaultKeyStatistics || {};
      const financialData = result.financialData || {};
      
      const financials = {
        incomeStatements: incomeStatements.map((stmt: any) => ({
          year: new Date(stmt.endDate?.raw * 1000).getFullYear(),
          revenue: stmt.totalRevenue?.raw,
          grossProfit: stmt.grossProfit?.raw,
          operatingIncome: stmt.operatingIncome?.raw,
          netIncome: stmt.netIncome?.raw,
          eps: stmt.dilutedEPS?.raw,
        })),
        ratios: {
          roe: financialData.returnOnEquity?.raw,
          roa: financialData.returnOnAssets?.raw,
          profitMargin: financialData.profitMargins?.raw,
          operatingMargin: financialData.operatingMargins?.raw,
          currentRatio: financialData.currentRatio?.raw,
          debtToEquity: financialData.debtToEquity?.raw,
          pe: keyStats.trailingPE?.raw || keyStats.forwardPE?.raw,
          pb: keyStats.priceToBook?.raw,
          ps: keyStats.priceToSalesTrailing12Months?.raw,
          pegRatio: keyStats.pegRatio?.raw,
          beta: keyStats.beta?.raw,
        },
        balanceSheets: balanceSheets.map((bs: any) => ({
          year: new Date(bs.endDate?.raw * 1000).getFullYear(),
          totalAssets: bs.totalAssets?.raw,
          totalLiabilities: bs.totalLiab?.raw,
          totalEquity: bs.totalStockholderEquity?.raw,
          cash: bs.cash?.raw,
          totalDebt: bs.longTermDebt?.raw,
        })),
        cashflows: cashflows.map((cf: any) => ({
          year: new Date(cf.endDate?.raw * 1000).getFullYear(),
          operatingCashflow: cf.totalCashFromOperatingActivities?.raw,
          investingCashflow: cf.totalCashflowsFromInvestingActivities?.raw,
          financingCashflow: cf.totalCashFromFinancingActivities?.raw,
          freeCashflow: cf.freeCashflow?.raw,
        })),
      };
      
      return new Response(JSON.stringify(financials), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in stock-data function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
