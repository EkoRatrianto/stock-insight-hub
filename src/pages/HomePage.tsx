import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { QuickActions } from '@/components/home/QuickActions';
import { InsightCard } from '@/components/home/InsightCard';
import { WatchlistItem } from '@/components/home/WatchlistItem';
import { Button } from '@/components/ui/button';
import { Filter, Plus, Loader2 } from 'lucide-react';
import { useStockData, StockQuote } from '@/hooks/useStockData';
import { WatchlistItem as WatchlistItemType } from '@/types/company';
import { useAuth } from '@/hooks/useAuth';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

const WATCHLIST_SYMBOLS = ['NVDA', 'TSLA', 'MSFT', 'AMZN'];
const INSIGHT_SYMBOLS = ['AAPL', 'GOOGL'];

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchValue, setSearchValue] = useState('');
  const { fetchQuotes, loading } = useStockData();
  const [watchlistData, setWatchlistData] = useState<WatchlistItemType[]>([]);
  const [insightData, setInsightData] = useState<StockQuote[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      const allSymbols = [...new Set([...WATCHLIST_SYMBOLS, ...INSIGHT_SYMBOLS])];
      const quotes = await fetchQuotes(allSymbols);
      
      if (quotes.length > 0) {
        const watchlist: WatchlistItemType[] = quotes
          .filter(q => WATCHLIST_SYMBOLS.includes(q.symbol))
          .map(q => ({
            ticker: q.symbol,
            name: q.name,
            currentPrice: q.price,
            priceChangePercent: q.changePercent,
            rating: q.changePercent > 2 ? 'STRONG' : q.changePercent < -1 ? 'WEAK' : 'HOLD',
          }));
        setWatchlistData(watchlist);

        const insights = quotes.filter(q => INSIGHT_SYMBOLS.includes(q.symbol));
        setInsightData(insights);
      }
    };
    
    loadData();
  }, [fetchQuotes]);

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
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          {loading && watchlistData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {watchlistData.map((item) => (
                <WatchlistItem
                  key={item.ticker}
                  item={item}
                  onClick={() => {
                    onNavigate('analysis', {
                      ticker: item.ticker,
                      name: item.name,
                      currentPrice: item.currentPrice,
                      priceChangePercent: item.priceChangePercent,
                      currency: 'USD',
                    });
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
