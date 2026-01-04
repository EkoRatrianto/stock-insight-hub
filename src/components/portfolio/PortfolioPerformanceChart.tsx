import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { PortfolioHolding } from '@/hooks/usePortfolio';

interface PortfolioPerformanceChartProps {
  holdings: PortfolioHolding[];
  totalValue: number;
  totalCost: number;
}

export function PortfolioPerformanceChart({ 
  holdings, 
  totalValue, 
  totalCost 
}: PortfolioPerformanceChartProps) {
  // Generate simulated performance data based on current holdings
  const performanceData = useMemo(() => {
    if (holdings.length === 0) return [];

    const data = [];
    const today = new Date();
    const days = 30;
    
    // Calculate average daily change based on P/L
    const totalPL = totalValue - totalCost;
    const dailyChange = totalPL / days;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate value progression from cost to current value with some variance
      const progress = (days - i) / days;
      const baseValue = totalCost + (dailyChange * (days - i));
      const variance = (Math.random() - 0.5) * (totalValue * 0.02); // 2% variance
      const value = Math.max(0, baseValue + variance);
      
      data.push({
        date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        value: Number(value.toFixed(2)),
        fullDate: date.toISOString(),
      });
    }
    
    // Ensure last point is actual current value
    if (data.length > 0) {
      data[data.length - 1].value = Number(totalValue.toFixed(2));
    }
    
    return data;
  }, [holdings, totalValue, totalCost]);

  const isPositive = totalValue >= totalCost;
  const minValue = Math.min(...performanceData.map(d => d.value)) * 0.98;
  const maxValue = Math.max(...performanceData.map(d => d.value)) * 1.02;

  if (holdings.length === 0) return null;

  return (
    <Card variant="gradient">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Performa Portfolio (30 Hari)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                hide 
                domain={[minValue, maxValue]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Nilai']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Modal: ${totalCost.toLocaleString()}</span>
          <span className={isPositive ? 'text-success' : 'text-destructive'}>
            Sekarang: ${totalValue.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
