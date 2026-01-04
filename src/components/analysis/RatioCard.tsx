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
        "p-4",
        onClick && "cursor-pointer hover:border-primary/50 transition-colors"
      )}
      onClick={onClick}
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-foreground">
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {trend && trend !== 'neutral' && (
          <div className={cn(
            "p-1 rounded",
            trend === 'up' ? "text-success" : "text-destructive"
          )}>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
      {subLabel && (
        <p className={cn(
          "text-xs mt-1",
          trend === 'up' ? "text-success" : trend === 'down' ? "text-destructive" : "text-muted-foreground"
        )}>
          {subLabel}
        </p>
      )}
    </Card>
  );
}
