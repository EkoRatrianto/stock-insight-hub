import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { QuickActions } from '@/components/home/QuickActions';
import { InsightCard } from '@/components/home/InsightCard';
import { WatchlistItem } from '@/components/home/WatchlistItem';
import { Button } from '@/components/ui/button';
import { Filter, Plus } from 'lucide-react';
import { mockCompanies, mockWatchlist } from '@/data/mockData';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

interface InsightItem {
  ticker: string;
  name: string;
  currentPrice: number;
  priceChangePercent: number;
  currency: string;
  projection?: string;
  projectionValue?: string;
  swotHighlight?: string;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleQuickAction = (action: string) => {
    if (action === 'new-analysis') {
      onNavigate('search');
    }
  };

  const latestInsights: InsightItem[] = [
    {
      ticker: mockCompanies[0].ticker,
      name: mockCompanies[0].name,
      currentPrice: mockCompanies[0].currentPrice,
      priceChangePercent: mockCompanies[0].priceChangePercent,
      currency: mockCompanies[0].currency,
      projection: '3Y Projection',
      projectionValue: '+15% (Bullish)',
    },
    {
      ticker: mockCompanies[4].ticker,
      name: mockCompanies[4].name,
      currentPrice: mockCompanies[4].currentPrice,
      priceChangePercent: mockCompanies[4].priceChangePercent,
      currency: mockCompanies[4].currency,
      swotHighlight: 'SWOT Analysis Ready',
    },
  ];

  return (
    <div className="pb-20 min-h-screen">
      <Header userName="Analyst" />
      
      <div className="px-4 space-y-6">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          onFocus={() => onNavigate('search')}
        />

        <QuickActions onAction={handleQuickAction} />

        {/* Latest Insights */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-foreground">Latest Insights</h2>
            <Button variant="link" className="text-primary text-sm p-0 h-auto">
              View All
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {latestInsights.map((insight) => (
              <InsightCard
                key={insight.ticker}
                ticker={insight.ticker}
                name={insight.name}
                price={insight.currentPrice}
                priceChange={insight.priceChangePercent}
                projection={insight.projection}
                projectionValue={insight.projectionValue}
                swotHighlight={insight.swotHighlight}
                currency={insight.currency}
                onClick={() => {
                  const company = mockCompanies.find(c => c.ticker === insight.ticker);
                  if (company) onNavigate('analysis', company);
                }}
              />
            ))}
          </div>
        </section>

        {/* Watchlist */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-foreground">Watchlist</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {mockWatchlist.map((item) => (
              <WatchlistItem
                key={item.ticker}
                item={item}
                onClick={() => {
                  const company = mockCompanies.find(c => c.ticker === item.ticker);
                  if (company) onNavigate('analysis', company);
                }}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
