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
    const body = await req.json();
    const { symbols, action, query } = body;
    
    console.log('Request received:', { action, symbols, query });
    
    if (action === 'search') {
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
      const symbolList = Array.isArray(symbols) ? symbols : [symbols];
      
      console.log('Fetching quotes for:', symbolList);
      
      // Use the chart API which doesn't require authentication
      const quotePromises = symbolList.map(async (symbol: string) => {
        try {
          const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
          
          const response = await fetch(chartUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
          });
          
          const data = await response.json();
          const result = data.chart?.result?.[0];
          
          if (!result) {
            console.log(`No data for symbol: ${symbol}`);
            return null;
          }
          
          const meta = result.meta;
          const quote = result.indicators?.quote?.[0] || {};
          const prevClose = meta.chartPreviousClose || meta.previousClose || 0;
          const currentPrice = meta.regularMarketPrice || quote.close?.[quote.close.length - 1] || 0;
          const change = currentPrice - prevClose;
          const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
          
          return {
            symbol: meta.symbol,
            name: meta.longName || meta.shortName || meta.symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            currency: meta.currency,
            exchange: meta.exchangeName,
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
            volume: meta.regularMarketVolume,
            marketCap: meta.marketCap,
          };
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err);
          return null;
        }
      });
      
      const quotes = (await Promise.all(quotePromises)).filter(q => q !== null);
      console.log(`Fetched ${quotes.length} quotes successfully`);
      
      return new Response(JSON.stringify(quotes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'history') {
      const symbol = Array.isArray(symbols) ? symbols[0] : symbols;
      const period = '5y';
      const interval = '1mo';
      
      const historyUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${period}`;
      
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
      
      console.log('Fetching financials for:', symbol);
      
      // Try the chart API for basic financial metrics
      const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5y`;
      
      const chartResponse = await fetch(chartUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });
      
      const chartData = await chartResponse.json();
      const chartResult = chartData.chart?.result?.[0];
      
      if (!chartResult) {
        console.log('No chart data found for:', symbol);
        return new Response(JSON.stringify({ error: 'No financial data found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const meta = chartResult.meta;
      const timestamps = chartResult.timestamp || [];
      const closes = chartResult.indicators?.quote?.[0]?.close || [];
      
      // Calculate basic metrics from chart data
      const currentPrice = meta.regularMarketPrice || closes[closes.length - 1];
      const prevClose = meta.chartPreviousClose;
      
      // Generate yearly data from historical prices
      const yearlyData: { [year: number]: number[] } = {};
      timestamps.forEach((ts: number, i: number) => {
        const year = new Date(ts * 1000).getFullYear();
        if (closes[i] !== null) {
          if (!yearlyData[year]) yearlyData[year] = [];
          yearlyData[year].push(closes[i]);
        }
      });
      
      // Create basic financial structure with estimated data
      const years = Object.keys(yearlyData).map(Number).sort((a, b) => b - a).slice(0, 4);
      
      const financials = {
        incomeStatements: years.map((year, i) => ({
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
          beta: null,
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
          currentPrice,
          prevClose,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
        }
      };
      
      console.log('Returning basic financials for:', symbol);
      
      return new Response(JSON.stringify(financials), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'news') {
      const symbol = Array.isArray(symbols) ? symbols[0] : symbols;
      
      console.log('Fetching news for:', symbol);
      
      // Use Yahoo Finance search API which includes news
      const newsUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbol)}&quotesCount=0&newsCount=10`;
      
      const response = await fetch(newsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });
      
      const data = await response.json();
      const newsItems = data.news || [];
      
      const formattedNews = newsItems.map((item: any) => ({
        uuid: item.uuid,
        title: item.title,
        publisher: item.publisher,
        link: item.link,
        providerPublishTime: item.providerPublishTime,
        thumbnail: item.thumbnail?.resolutions?.[0]?.url || null,
      }));
      
      console.log(`Fetched ${formattedNews.length} news items`);
      
      return new Response(JSON.stringify(formattedNews), {
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
