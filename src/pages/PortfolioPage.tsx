import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockWatchlist } from '@/data/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PortfolioPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const portfolioData = [
  { name: 'Technology', value: 45, color: 'hsl(217, 91%, 60%)' },
  { name: 'Financial', value: 25, color: 'hsl(142, 76%, 45%)' },
  { name: 'Consumer', value: 20, color: 'hsl(38, 92%, 50%)' },
  { name: 'Healthcare', value: 10, color: 'hsl(280, 65%, 60%)' },
];

export function PortfolioPage({ onNavigate }: PortfolioPageProps) {
  const totalValue = 125430.50;
  const totalChange = 2.35;

  return (
    <div className="pb-20 min-h-screen">
      <Header userName="Analyst" />
      
      <div className="px-4 space-y-6">
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-1">Total Nilai Portofolio</p>
          <h1 className="text-3xl font-bold font-heading text-foreground">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h1>
          <Badge variant="success" className="mt-2">
            ↗ +{totalChange}% Hari Ini
          </Badge>
        </div>

        <Card variant="gradient">
          <CardHeader>
            <CardTitle>Alokasi Sektor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {portfolioData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <section>
          <h3 className="font-heading font-semibold text-foreground mb-3">Holdings</h3>
          <div className="space-y-2">
            {mockWatchlist.map((item) => (
              <Card 
                key={item.ticker} 
                variant="glass" 
                className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onNavigate('search')}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{item.ticker.slice(0, 4)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.ticker}</p>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${item.currentPrice.toLocaleString()}
                    </p>
                    <p className={`text-xs ${item.priceChangePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {item.priceChangePercent >= 0 ? '+' : ''}{item.priceChangePercent}%
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
