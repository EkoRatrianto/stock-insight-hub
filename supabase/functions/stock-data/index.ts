import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Yahoo Finance API endpoints
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        return response;
      }
      
      // If rate limited, wait before retry
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
  
  throw lastError || new Error('Failed after retries');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { symbols, action, query } = body;
    
    console.log('Stock data request:', { action, symbols, query });
    
    // Search stocks
    if (action === 'search') {
      if (!query) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const searchUrl = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=15&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;
      
      console.log('Searching stocks:', query);
      
      const response = await fetchWithRetry(searchUrl);
      const data = await response.json();
      
      const results = (data.quotes || []).map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || q.exchDisp,
        type: q.quoteType,
        sector: q.sector,
      }));
      
      console.log(`Found ${results.length} search results`);
      
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get stock quotes
    if (action === 'quote') {
      const symbolList = Array.isArray(symbols) ? symbols : [symbols];
      
      if (!symbolList.length || !symbolList[0]) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Fetching quotes for:', symbolList);
      
      const quotePromises = symbolList.map(async (symbol: string) => {
        try {
          const chartUrl = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?interval=1d&range=5d&includePrePost=false`;
          
          const response = await fetchWithRetry(chartUrl);
          const data = await response.json();
          const result = data.chart?.result?.[0];
          
          if (!result) {
            console.log(`No data for symbol: ${symbol}`);
            return null;
          }
          
          const meta = result.meta;
          const quotes = result.indicators?.quote?.[0] || {};
          const closes = quotes.close || [];
          const volumes = quotes.volume || [];
          
          const currentPrice = meta.regularMarketPrice || closes[closes.length - 1] || 0;
          const prevClose = meta.chartPreviousClose || meta.previousClose || closes[closes.length - 2] || currentPrice;
          const change = currentPrice - prevClose;
          const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
          
          // Calculate average volume from available data
          const avgVolume = volumes.length > 0 
            ? Math.round(volumes.reduce((a: number, b: number) => (a || 0) + (b || 0), 0) / volumes.filter((v: number) => v).length)
            : meta.regularMarketVolume;
          
          return {
            symbol: meta.symbol || symbol,
            name: meta.longName || meta.shortName || symbol,
            price: currentPrice,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            currency: meta.currency || 'USD',
            exchange: meta.exchangeName || meta.exchange,
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
            volume: meta.regularMarketVolume || volumes[volumes.length - 1] || 0,
            avgVolume: avgVolume || 0,
            marketCap: meta.marketCap || 0,
            pe: meta.trailingPE || 0,
            dividendYield: meta.dividendYield || 0,
            sector: meta.sector || 'N/A',
          };
        } catch (err) {
          console.error(`Error fetching quote for ${symbol}:`, err);
          return null;
        }
      });
      
      const quotes = (await Promise.all(quotePromises)).filter(q => q !== null);
      console.log(`Successfully fetched ${quotes.length}/${symbolList.length} quotes`);
      
      return new Response(JSON.stringify(quotes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get historical data
    if (action === 'history') {
      const symbol = Array.isArray(symbols) ? symbols[0] : symbols;
      
      if (!symbol) {
        return new Response(JSON.stringify({ error: 'Symbol required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Fetching history for:', symbol);
      
      const historyUrl = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?interval=1mo&range=5y`;
      
      const response = await fetchWithRetry(historyUrl);
      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) {
        console.log(`No history data for: ${symbol}`);
        return new Response(JSON.stringify({ 
          symbol,
          currency: 'USD',
          history: [] 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const timestamps = result.timestamp || [];
      const quotes = result.indicators?.quote?.[0] || {};
      
      const history = timestamps.map((ts: number, i: number) => {
        const close = quotes.close?.[i];
        if (close === null || close === undefined) return null;
        
        return {
          date: new Date(ts * 1000).toISOString().split('T')[0],
          open: quotes.open?.[i] || close,
          high: quotes.high?.[i] || close,
          low: quotes.low?.[i] || close,
          close: close,
          volume: quotes.volume?.[i] || 0,
        };
      }).filter(Boolean);
      
      console.log(`Fetched ${history.length} history data points for ${symbol}`);
      
      return new Response(JSON.stringify({
        symbol,
        currency: result.meta?.currency || 'USD',
        history
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get financial data
    if (action === 'financials') {
      const symbol = Array.isArray(symbols) ? symbols[0] : symbols;
      
      if (!symbol) {
        return new Response(JSON.stringify({ error: 'Symbol required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Fetching financials for:', symbol);
      
      const chartUrl = `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?interval=1d&range=5y`;
      
      const response = await fetchWithRetry(chartUrl);
      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) {
        console.log(`No financial data for: ${symbol}`);
        return new Response(JSON.stringify({
          incomeStatements: [],
          ratios: {},
          balanceSheets: [],
          cashflows: [],
          meta: { symbol }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const meta = result.meta;
      const timestamps = result.timestamp || [];
      const closes = result.indicators?.quote?.[0]?.close || [];
      
      // Group data by year
      const yearlyData: { [year: number]: number[] } = {};
      timestamps.forEach((ts: number, i: number) => {
        const year = new Date(ts * 1000).getFullYear();
        const close = closes[i];
        if (close !== null && close !== undefined) {
          if (!yearlyData[year]) yearlyData[year] = [];
          yearlyData[year].push(close);
        }
      });
      
      const years = Object.keys(yearlyData).map(Number).sort((a, b) => b - a).slice(0, 4);
      
      const financials = {
        incomeStatements: years.map(year => ({
          year,
          revenue: null,
          grossProfit: null,
          operatingIncome: null,
          netIncome: null,
          eps: null,
        })),
        ratios: {
          roe: null,
          roa: null,
          profitMargin: null,
          operatingMargin: null,
          currentRatio: null,
          debtToEquity: null,
          pe: meta.trailingPE || null,
          pb: meta.priceToBook || null,
          ps: null,
          pegRatio: null,
          beta: meta.beta || null,
        },
        balanceSheets: years.map(year => ({
          year,
          totalAssets: null,
          totalLiabilities: null,
          totalEquity: null,
          cash: null,
          totalDebt: null,
        })),
        cashflows: years.map(year => ({
          year,
          operatingCashflow: null,
          investingCashflow: null,
          financingCashflow: null,
          freeCashflow: null,
        })),
        meta: {
          symbol: meta.symbol,
          currency: meta.currency,
          exchange: meta.exchangeName,
          currentPrice: meta.regularMarketPrice,
          prevClose: meta.chartPreviousClose,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        }
      };
      
      console.log('Returning financials for:', symbol);
      
      return new Response(JSON.stringify(financials), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get news
    if (action === 'news') {
      const symbol = Array.isArray(symbols) ? symbols[0] : symbols;
      
      if (!symbol) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Fetching news for:', symbol);
      
      const newsUrl = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=15`;
      
      const response = await fetchWithRetry(newsUrl);
      const data = await response.json();
      const newsItems = data.news || [];
      
      const formattedNews = newsItems.map((item: any) => ({
        uuid: item.uuid || crypto.randomUUID(),
        title: item.title,
        publisher: item.publisher,
        link: item.link,
        providerPublishTime: item.providerPublishTime,
        thumbnail: item.thumbnail?.resolutions?.[0]?.url || null,
      }));
      
      console.log(`Fetched ${formattedNews.length} news items for ${symbol}`);
      
      return new Response(JSON.stringify(formattedNews), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Invalid action received:', action);
    return new Response(JSON.stringify({ error: 'Invalid action. Valid actions: search, quote, history, financials, news' }), {
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
