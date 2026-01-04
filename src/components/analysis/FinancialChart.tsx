import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FinancialData } from '@/types/company';

interface FinancialChartProps {
  data: FinancialData[];
  title: string;
  yoyChange?: number;
}

export function FinancialChart({ data, title, yoyChange }: FinancialChartProps) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    revenue: d.revenue / 1000,
    netIncome: d.netIncome / 1000,
  }));

  const latestRevenue = data[data.length - 1]?.revenue || 0;
  const formatValue = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}T`;
    return `$${value.toFixed(0)}B`;
  };

  return (
    <Card variant="gradient" className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <CardTitle className="text-2xl mt-1">
              ${(latestRevenue / 1000).toFixed(0)}B
            </CardTitle>
          </div>
          {yoyChange !== undefined && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">vs Industri</p>
              <Badge variant={yoyChange >= 0 ? 'success' : 'destructive'} className="mt-1">
                ↗ {yoyChange >= 0 ? '+' : ''}{yoyChange}% YoY
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" vertical={false} />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222, 47%, 9%)',
                  border: '1px solid hsl(217, 33%, 17%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 24px hsl(222, 47%, 3% / 0.5)',
                }}
                labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
                formatter={(value: number) => [`$${value.toFixed(0)}B`, '']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name="Pendapatan"
              />
              <Area
                type="monotone"
                dataKey="netIncome"
                stroke="hsl(142, 76%, 45%)"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                name="Laba Bersih"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">PENDAPATAN</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">LABA BERSIH</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
