import { Badge } from '@/components/ui/badge';
import { WatchlistItem as WatchlistItemType } from '@/types/company';
import { cn } from '@/lib/utils';

interface WatchlistItemProps {
  item: WatchlistItemType;
  onClick: () => void;
}

export function WatchlistItem({ item, onClick }: WatchlistItemProps) {
  const isPositive = item.priceChangePercent >= 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-secondary/50 transition-colors text-left"
    >
      <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary">{item.ticker.slice(0, 4)}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{item.ticker}</span>
          {item.rating && (
            <Badge 
              variant={item.rating === 'STRONG' ? 'strong' : item.rating === 'HOLD' ? 'hold' : 'weak'}
              className="text-[10px]"
            >
              {item.rating}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">{item.name}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="font-semibold text-foreground">
          ${item.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className={cn(
          "text-sm font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
        </p>
      </div>
    </button>
  );
}
