import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Trash2, Loader2 } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockData } from '@/hooks/useStockData';
import { AddInstrumentDialog } from '@/components/portfolio/AddInstrumentDialog';
import { useAuth } from '@/hooks/useAuth';

interface PortfolioPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const { user } = useAuth();
  const { 
    holdings, 
    loading, 
    removeHolding, 
    totalValue, 
    totalCost, 
    totalPL, 
    totalPLPercent,
    updateCurrentPrices 
  } = usePortfolio();
  const { fetchQuotes } = useStockData();
  const [isUpdating, setIsUpdating] = useState(false);

  // Update current prices on mount
  useEffect(() => {
    const updatePrices = async () => {
      if (holdings.length === 0) return;
      setIsUpdating(true);
      
      const tickers = holdings.map(h => h.ticker);
      const quotes = await fetchQuotes(tickers);
      
      if (quotes.length > 0) {
        const priceMap: Record<string, number> = {};
        quotes.forEach(q => {
          priceMap[q.symbol] = q.price;
        });
        await updateCurrentPrices(priceMap);
      }
      setIsUpdating(false);
    };

    updatePrices();
  }, [holdings.length]);

  // Generate sector allocation data
  const sectorData = holdings.reduce((acc, h) => {
    const value = h.quantity * h.current_price;
    const existingSector = acc.find(s => s.name === 'Investments');
    if (existingSector) {
      existingSector.value += value;
    } else {
      acc.push({ name: 'Investments', value, color: 'hsl(217, 91%, 60%)' });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  const getPL = (holding: typeof holdings[0]) => {
    const currentValue = holding.quantity * holding.current_price;
    const costBasis = holding.quantity * holding.average_price;
    return currentValue - costBasis;
  };

  const getPLPercent = (holding: typeof holdings[0]) => {
    const costBasis = holding.quantity * holding.average_price;
    if (costBasis === 0) return 0;
    return ((getPL(holding) / costBasis) * 100);
  };

  if (!user) {
    return (
      <div className="pb-20 min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Silakan login untuk melihat portfolio</p>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen">
      <Header userName={user.email?.split('@')[0] || 'Investor'} />
      
      <div className="px-4 space-y-6">
        {/* Portfolio Summary */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-1">Total Nilai Portfolio</p>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <Badge variant={totalPL >= 0 ? 'success' : 'destructive'} className="mt-2">
            {totalPL >= 0 ? '↗' : '↘'} {totalPL >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}% 
            (${totalPL >= 0 ? '+' : ''}{totalPL.toFixed(2)})
          </Badge>
        </div>

        {/* Sector Allocation Chart */}
        {sectorData.length > 0 && (
          <Card variant="gradient">
            <CardHeader>
              <CardTitle>Alokasi Aset</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-32 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {sectorData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        ${item.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Holdings Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-foreground">Holdings</h3>
            <AddInstrumentDialog />
          </div>

          {loading || isUpdating ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : holdings.length === 0 ? (
            <Card variant="glass" className="p-8 text-center">
              <p className="text-muted-foreground">Belum ada instrumen. Tambahkan saham pertama Anda!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {holdings.map((holding) => {
                const pl = getPL(holding);
                const plPercent = getPLPercent(holding);
                
                return (
                  <Card 
                    key={holding.id} 
                    variant="glass" 
                    className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => onNavigate('analysis', {
                      ticker: holding.ticker,
                      name: holding.name,
                      currentPrice: holding.current_price,
                      currency: holding.currency,
                    })}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{holding.ticker.slice(0, 4)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{holding.ticker}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {holding.quantity} lot
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{holding.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${(holding.quantity * holding.current_price).toFixed(2)}
                        </p>
                        <p className={`text-xs ${pl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {pl >= 0 ? '+' : ''}{plPercent.toFixed(2)}% (${pl >= 0 ? '+' : ''}{pl.toFixed(2)})
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHolding(holding.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* P/L Summary */}
        {holdings.length > 0 && (
          <Card variant="glass" className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Cost</p>
                <p className="font-semibold text-foreground">${totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total P/L</p>
                <p className={`font-semibold ${totalPL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
