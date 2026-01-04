import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { QuickActions } from '@/components/home/QuickActions';
import { InsightCard } from '@/components/home/InsightCard';
import { WatchlistItem } from '@/components/home/WatchlistItem';
import { Button } from '@/components/ui/button';
import { Filter, Star, Loader2 } from 'lucide-react';
import { useStockData, StockQuote } from '@/hooks/useStockData';
import { WatchlistItem as WatchlistItemType } from '@/types/company';
import { useAuth } from '@/hooks/useAuth';
import { useWatchlist } from '@/hooks/useWatchlist';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

const INSIGHT_SYMBOLS = ['AAPL', 'GOOGL'];

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchValue, setSearchValue] = useState('');
  const { fetchQuotes, loading } = useStockData();
  const { watchlist, loading: watchlistLoading } = useWatchlist();
  const [watchlistQuotes, setWatchlistQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [insightData, setInsightData] = useState<StockQuote[]>([]);
  const { user } = useAuth();

  // Fetch insight data
  useEffect(() => {
    const loadInsights = async () => {
      const quotes = await fetchQuotes(INSIGHT_SYMBOLS);
      setInsightData(quotes);
    };
    loadInsights();
  }, [fetchQuotes]);

  // Fetch quotes for watchlist items
  useEffect(() => {
    const loadWatchlistQuotes = async () => {
      if (watchlist.length === 0) {
        setWatchlistQuotes(new Map());
        return;
      }
      const tickers = watchlist.map(item => item.ticker);
      const quotes = await fetchQuotes(tickers);
      const quotesMap = new Map<string, StockQuote>();
      quotes.forEach(q => quotesMap.set(q.symbol, q));
      setWatchlistQuotes(quotesMap);
    };
    loadWatchlistQuotes();
  }, [watchlist, fetchQuotes]);

  // Convert watchlist to display format
  const watchlistDisplayData: WatchlistItemType[] = watchlist.slice(0, 4).map(item => {
    const quote = watchlistQuotes.get(item.ticker);
    return {
      ticker: item.ticker,
      name: item.name,
      currentPrice: quote?.price || 0,
      priceChangePercent: quote?.changePercent || 0,
      rating: (quote?.changePercent || 0) > 2 ? 'STRONG' : (quote?.changePercent || 0) < -1 ? 'WEAK' : 'HOLD',
    };
  });

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-analysis':
        onNavigate('search');
        break;
      case 'compare':
        onNavigate('compare');
        break;
      case 'reports':
        onNavigate('reports');
        break;
      case 'projections':
        onNavigate('projections');
        break;
      case 'watchlist':
        onNavigate('watchlist');
        break;
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Analyst';

  return (
    <div className="pb-24 min-h-dvh w-full">
      <Header userName={userName} />
      
      <div className="px-3 sm:px-4 space-y-5 pb-4">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          onFocus={() => onNavigate('search')}
        />

        <QuickActions onAction={handleQuickAction} />

        {/* Latest Insights */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading font-semibold text-foreground text-sm sm:text-base">Latest Insights</h2>
            <Button variant="link" className="text-primary text-xs sm:text-sm p-0 h-auto">
              View All
            </Button>
          </div>
          {loading && insightData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-hide snap-x snap-mandatory">
              {insightData.map((insight) => (
                <InsightCard
                  key={insight.symbol}
                  ticker={insight.symbol}
                  name={insight.name}
                  price={insight.price}
                  priceChange={insight.changePercent}
                  projection="Real-time"
                  projectionValue={`PE: ${insight.pe?.toFixed(1) || 'N/A'}`}
                  currency="USD"
                  onClick={() => {
                    onNavigate('analysis', {
                      ticker: insight.symbol,
                      name: insight.name,
                      exchange: insight.exchange || 'NASDAQ',
                      sector: insight.sector,
                      currentPrice: insight.price,
                      priceChange: insight.change,
                      priceChangePercent: insight.changePercent,
                      marketCap: insight.marketCap,
                      peRatio: insight.pe,
                      divYield: insight.dividendYield,
                      currency: insight.currency,
                    });
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Watchlist */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-heading font-semibold text-foreground text-sm sm:text-base">Watchlist</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onNavigate('watchlist')}
              >
                <Star className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          {(loading || watchlistLoading) && watchlistDisplayData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : watchlistDisplayData.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-2">Watchlist kosong</p>
              <Button variant="outline" size="sm" onClick={() => onNavigate('search')}>
                Cari Saham
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlistDisplayData.map((item) => (
                <WatchlistItem
                  key={item.ticker}
                  item={item}
                  onClick={() => {
                    const quote = watchlistQuotes.get(item.ticker);
                    onNavigate('analysis', {
                      ticker: item.ticker,
                      name: item.name,
                      exchange: quote?.exchange || '',
                      sector: quote?.sector || '',
                      industry: '',
                      country: '',
                      currentPrice: item.currentPrice,
                      priceChange: quote?.change || 0,
                      priceChangePercent: item.priceChangePercent,
                      marketCap: quote?.marketCap || 0,
                      peRatio: quote?.pe || 0,
                      divYield: quote?.dividendYield || 0,
                      currency: quote?.currency || 'USD',
                    });
                  }}
                />
              ))}
              {watchlist.length > 4 && (
                <Button 
                  variant="ghost" 
                  className="w-full text-xs"
                  onClick={() => onNavigate('watchlist')}
                >
                  Lihat Semua ({watchlist.length})
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
