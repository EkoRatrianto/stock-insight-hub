import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStockData, StockQuote } from '@/hooks/useStockData';
import { useToast } from '@/hooks/use-toast';

interface ComparePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ComparePage({ onNavigate }: ComparePageProps) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [searchTicker, setSearchTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { fetchQuotes, fetchFinancials } = useStockData();
  const { toast } = useToast();

  const handleAddStock = async () => {
    if (!searchTicker.trim()) return;
    if (stocks.length >= 4) {
      toast({
        variant: 'destructive',
        title: 'Maksimum 4 Saham',
        description: 'Anda hanya dapat membandingkan maksimal 4 saham',
      });
      return;
    }

    if (stocks.find(s => s.symbol === searchTicker.toUpperCase())) {
      toast({
        variant: 'destructive',
        title: 'Sudah Ditambahkan',
        description: 'Saham ini sudah ada dalam perbandingan',
      });
      return;
    }

    setIsLoading(true);
    const quotes = await fetchQuotes([searchTicker.toUpperCase()]);
    
    if (quotes.length > 0) {
      setStocks([...stocks, quotes[0]]);
      setSearchTicker('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Tidak Ditemukan',
        description: 'Simbol saham tidak ditemukan',
      });
    }
    setIsLoading(false);
  };

  const handleRemoveStock = (symbol: string) => {
    setStocks(stocks.filter(s => s.symbol !== symbol));
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="pb-20 min-h-screen">
      <Header 
        title="Bandingkan Saham" 
        showBack 
        onBack={() => onNavigate('home')} 
      />
      
      <div className="px-4 space-y-6 py-4">
        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Masukkan simbol (AAPL, GOOGL...)"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
            />
          </div>
          <Button onClick={handleAddStock} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {/* Selected stocks badges */}
        {stocks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stocks.map(stock => (
              <Badge 
                key={stock.symbol} 
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {stock.symbol}
                <Button
                  variant="ghost"
                  size="iconSm"
                  className="h-5 w-5 p-0 hover:bg-destructive/20"
                  onClick={() => handleRemoveStock(stock.symbol)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Comparison table */}
        {stocks.length > 0 ? (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-base">Perbandingan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Metrik</th>
                      {stocks.map(s => (
                        <th key={s.symbol} className="text-right py-2 font-semibold text-foreground">
                          {s.symbol}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 text-muted-foreground">Harga</td>
                      {stocks.map(s => (
                        <td key={s.symbol} className="text-right py-2 font-medium text-foreground">
                          ${s.price.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">Perubahan</td>
                      {stocks.map(s => (
                        <td key={s.symbol} className="text-right py-2">
                          <div className="flex items-center justify-end gap-1">
                            {getTrendIcon(s.changePercent)}
                            <span className={s.changePercent >= 0 ? 'text-success' : 'text-destructive'}>
                              {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">P/E Ratio</td>
                      {stocks.map(s => (
                        <td key={s.symbol} className="text-right py-2 text-foreground">
                          {s.pe?.toFixed(1) || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">Market Cap</td>
                      {stocks.map(s => (
                        <td key={s.symbol} className="text-right py-2 text-foreground">
                          {s.marketCap ? `$${(s.marketCap / 1e9).toFixed(1)}B` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">Dividen</td>
                      {stocks.map(s => (
                        <td key={s.symbol} className="text-right py-2 text-foreground">
                          {s.dividendYield ? `${s.dividendYield.toFixed(2)}%` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">52w High</td>
                      {stocks.map(s => (
                        <td key={s.symbol} className="text-right py-2 text-foreground">
                          {s.fiftyTwoWeekHigh ? `$${s.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 text-muted-foreground">52w Low</td>
                      {stocks.map(s => (
                        <td key={s.symbol} className="text-right py-2 text-foreground">
                          {s.fiftyTwoWeekLow ? `$${s.fiftyTwoWeekLow.toFixed(2)}` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="glass" className="p-8 text-center">
            <p className="text-muted-foreground">
              Tambahkan saham untuk memulai perbandingan
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
