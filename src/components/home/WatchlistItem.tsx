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
      className="w-full flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card hover:bg-secondary/50 transition-colors text-left touch-target"
    >
      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <span className="text-[10px] sm:text-xs font-bold text-primary">{item.ticker.slice(0, 4)}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="font-semibold text-foreground text-sm sm:text-base">{item.ticker}</span>
          {item.rating && (
            <Badge 
              variant={item.rating === 'STRONG' ? 'strong' : item.rating === 'HOLD' ? 'hold' : 'weak'}
              className="text-[9px] sm:text-[10px] px-1.5"
            >
              {item.rating}
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.name}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="font-semibold text-foreground text-sm sm:text-base">
          ${item.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className={cn(
          "text-xs sm:text-sm font-medium",
          isPositive ? "text-success" : "text-destructive"
        )}>
          {isPositive ? '+' : ''}{item.priceChangePercent.toFixed(1)}%
        </p>
      </div>
    </button>
  );
}
