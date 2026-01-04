import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatioCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  subLabel?: string;
  onClick?: () => void;
}

export function RatioCard({ label, value, trend, subLabel, onClick }: RatioCardProps) {
  return (
    <Card 
      variant="glass" 
      className={cn(
        "p-3 sm:p-4",
        onClick && "cursor-pointer hover:border-primary/50 transition-colors active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 line-clamp-2 leading-tight">{label}</p>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-lg sm:text-xl font-bold text-foreground">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {trend && trend !== 'neutral' && (
          <div className={cn(
            "p-0.5 sm:p-1 rounded",
            trend === 'up' ? "text-success" : "text-destructive"
          )}>
            {trend === 'up' ? (
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </div>
        )}
      </div>
      {subLabel && (
        <p className={cn(
          "text-[10px] sm:text-xs mt-0.5 sm:mt-1",
          trend === 'up' ? "text-success" : trend === 'down' ? "text-destructive" : "text-muted-foreground"
        )}>
          {subLabel}
        </p>
      )}
    </Card>
  );
}
