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
      className="min-w-[240px] w-[75vw] max-w-[300px] p-3 sm:p-4 cursor-pointer hover:border-primary/50 transition-colors shrink-0 snap-start"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <span className="text-[10px] sm:text-xs font-bold text-primary">{ticker.slice(0, 4)}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm sm:text-base truncate">{ticker}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{name}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-foreground text-sm sm:text-base">{formatPrice}</p>
          <Badge variant={isPositive ? 'success' : 'destructive'} className="text-[10px] sm:text-xs">
            {isPositive ? '↗' : '↘'} {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {projection && (
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-success/10 border border-success/20 gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">{projection}</span>
          <span className={cn(
            "font-semibold text-xs sm:text-sm shrink-0",
            projectionValue?.includes('+') || projectionValue?.includes('Bullish') 
              ? "text-success" 
              : "text-destructive"
          )}>
            {projectionValue}
          </span>
        </div>
      )}

      {swotHighlight && (
        <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-xs sm:text-sm text-foreground">{swotHighlight}</span>
        </div>
      )}
    </Card>
  );
}
