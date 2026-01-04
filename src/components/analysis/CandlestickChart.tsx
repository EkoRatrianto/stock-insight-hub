import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Bar, Line, ReferenceLine } from 'recharts';

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  data: CandleData[];
  symbol: string;
}

// Custom Candlestick Bar Component
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  
  if (!payload) return null;
  
  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const bodyHeight = Math.abs(close - open);
  
  // Scale calculations
  const priceRange = high - low;
  if (priceRange === 0) return null;
  
  const totalHeight = height;
  const yScale = totalHeight / priceRange;
  
  const wickTop = y;
  const wickBottom = y + totalHeight;
  const bodyY = y + (high - bodyBottom) * yScale;
  const bodyRectHeight = Math.max(bodyHeight * yScale, 1);
  
  const wickX = x + width / 2;
  
  return (
    <g>
      {/* Upper wick */}
      <line
        x1={wickX}
        y1={wickTop}
        x2={wickX}
        y2={bodyY}
        stroke={isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
        strokeWidth={1}
      />
      {/* Lower wick */}
      <line
        x1={wickX}
        y1={bodyY + bodyRectHeight}
        x2={wickX}
        y2={wickBottom}
        stroke={isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + 1}
        y={bodyY}
        width={Math.max(width - 2, 2)}
        height={bodyRectHeight}
        fill={isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
        stroke={isGreen ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
        strokeWidth={1}
      />
    </g>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  const isGreen = data.close >= data.open;
  
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-2">{data.date}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground">Open:</span>
        <span className="font-medium">{data.open?.toFixed(2)}</span>
        <span className="text-muted-foreground">High:</span>
        <span className="font-medium text-chart-2">{data.high?.toFixed(2)}</span>
        <span className="text-muted-foreground">Low:</span>
        <span className="font-medium text-destructive">{data.low?.toFixed(2)}</span>
        <span className="text-muted-foreground">Close:</span>
        <span className={`font-medium ${isGreen ? 'text-chart-2' : 'text-destructive'}`}>
          {data.close?.toFixed(2)}
        </span>
        <span className="text-muted-foreground">Volume:</span>
        <span className="font-medium">{(data.volume / 1000000).toFixed(2)}M</span>
      </div>
    </div>
  );
};

export function CandlestickChart({ data, symbol }: CandlestickChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Grafik Candlestick</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Data candlestick tidak tersedia untuk {symbol}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get last 30 data points for display
  const chartData = data.slice(-30);
  
  // Calculate price change
  const firstClose = chartData[0]?.close || 0;
  const lastClose = chartData[chartData.length - 1]?.close || 0;
  const priceChange = lastClose - firstClose;
  const priceChangePercent = firstClose > 0 ? (priceChange / firstClose) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Calculate min/max for Y axis
  const prices = chartData.flatMap(d => [d.high, d.low]).filter(p => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  // Calculate SMA 10
  const smaData = chartData.map((item, index) => {
    if (index < 9) return { ...item, sma10: null };
    const sum = chartData.slice(index - 9, index + 1).reduce((acc, d) => acc + d.close, 0);
    return { ...item, sma10: sum / 10 };
  });

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Grafik Candlestick</CardTitle>
          <Badge 
            variant={isPositive ? "default" : "destructive"}
            className={`text-xs ${isPositive ? 'bg-chart-2/20 text-chart-2' : ''}`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">30 periode terakhir dengan SMA 10</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={smaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[minPrice - padding, maxPrice + padding]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickFormatter={(value) => value.toFixed(0)}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={lastClose} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
              
              {/* Candlestick bars rendered as custom shapes */}
              <Bar
                dataKey="high"
                shape={<CandlestickBar />}
                isAnimationActive={false}
              />
              
              {/* SMA Line */}
              <Line
                type="monotone"
                dataKey="sma10"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-chart-2" />
            <span className="text-muted-foreground">Naik</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-destructive" />
            <span className="text-muted-foreground">Turun</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">SMA 10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}