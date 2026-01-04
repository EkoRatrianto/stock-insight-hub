import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useStockData, StockQuote } from '@/hooks/useStockData';
import { useToast } from '@/hooks/use-toast';
import { Company } from '@/types/company';

interface WatchlistPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function WatchlistPage({ onNavigate }: WatchlistPageProps) {
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();
  const { fetchQuotes } = useStockData();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Map<string, StockQuote>>(new Map());
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Fetch quotes for watchlist items
  useEffect(() => {
    const loadQuotes = async () => {
      if (watchlist.length === 0) {
        setQuotes(new Map());
        return;
      }

      setQuotesLoading(true);
      const tickers = watchlist.map(item => item.ticker);
      const quotesData = await fetchQuotes(tickers);
      
      const quotesMap = new Map<string, StockQuote>();
      quotesData.forEach(quote => {
        quotesMap.set(quote.symbol, quote);
      });
      setQuotes(quotesMap);
      setQuotesLoading(false);
    };

    loadQuotes();
  }, [watchlist, fetchQuotes]);

  const handleRemove = async (ticker: string, name: string) => {
    const result = await removeFromWatchlist(ticker);
    if (result.success) {
      toast({
        title: "Dihapus dari Watchlist",
        description: `${name} telah dihapus dari watchlist Anda.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Gagal menghapus dari watchlist",
        variant: "destructive",
      });
    }
  };

  const handleItemClick = (item: typeof watchlist[0]) => {
    const quote = quotes.get(item.ticker);
    const company: Company = {
      ticker: item.ticker,
      name: item.name,
      exchange: quote?.exchange || '',
      sector: item.sector || quote?.sector || 'Unknown',
      industry: '',
      country: '',
      currency: quote?.currency || 'USD',
      currentPrice: quote?.price || 0,
      priceChange: quote?.change || 0,
      priceChangePercent: quote?.changePercent || 0,
      marketCap: quote?.marketCap || 0,
      peRatio: quote?.pe || 0,
      divYield: quote?.dividendYield || 0,
      logoUrl: '',
    };
    onNavigate('analysis', company);
  };

  return (
    <div className="pb-20 min-h-dvh w-full">
      <Header 
        title="Watchlist Saya" 
        showBack 
        onBack={() => onNavigate('home')} 
      />

      <div className="px-3 sm:px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Memuat watchlist...</span>
          </div>
        ) : watchlist.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg mb-2">Watchlist Kosong</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Anda belum menambahkan saham ke watchlist. Cari saham dan tambahkan ke watchlist untuk memantau pergerakan harga.
              </p>
              <Button onClick={() => onNavigate('search')}>
                Cari Saham
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {watchlist.map(item => {
              const quote = quotes.get(item.ticker);
              const isPositive = (quote?.changePercent || 0) >= 0;

              return (
                <Card 
                  key={item.id} 
                  className="bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm sm:text-base">{item.ticker}</span>
                          {item.sector && (
                            <Badge variant="secondary" className="text-[10px] sm:text-xs">
                              {item.sector}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {item.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div 
                          className="text-right min-w-[80px]"
                          onClick={() => handleItemClick(item)}
                        >
                          {quotesLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                          ) : quote ? (
                            <>
                              <p className="font-semibold text-sm sm:text-base">
                                {quote.currency === 'IDR' ? 'Rp' : '$'}{quote.price.toLocaleString()}
                              </p>
                              <div className={`flex items-center justify-end gap-1 text-xs ${isPositive ? 'text-chart-2' : 'text-destructive'}`}>
                                {isPositive ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                <span>{isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(item.ticker, item.name);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}