import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  ticker: string;
  name: string;
  price: number;
  priceChange: number;
  projection?: string;
  projectionValue?: string;
  swotHighlight?: string;
  currency?: string;
  onClick: () => void;
}

export function InsightCard({
  ticker,
  name,
  price,
  priceChange,
  projection,
  projectionValue,
  swotHighlight,
  currency = 'USD',
  onClick,
}: InsightCardProps) {
  const isPositive = priceChange >= 0;
  const formatPrice = currency === 'IDR' 
    ? `Rp ${price.toLocaleString('id-ID')}`
    : `$${price.toFixed(2)}`;

  return (
    <Card 
      variant="glass" 
      className="min-w-[280px] p-4 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{ticker.slice(0, 4)}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{ticker}</p>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-foreground">{formatPrice}</p>
          <Badge variant={isPositive ? 'success' : 'destructive'} className="text-xs">
            {isPositive ? '↗' : '↘'} {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {projection && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
          <span className="text-sm text-muted-foreground">{projection}</span>
          <span className={cn(
            "font-semibold",
            projectionValue?.includes('+') || projectionValue?.includes('Bullish') 
              ? "text-success" 
              : "text-destructive"
          )}>
            {projectionValue}
          </span>
        </div>
      )}

      {swotHighlight && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm text-foreground">{swotHighlight}</span>
        </div>
      )}
    </Card>
  );
}
