import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/company';
import { cn } from '@/lib/utils';

interface CompanyListItemProps {
  company: Company;
  showRecent?: boolean;
  onClick: () => void;
}

export function CompanyListItem({ company, showRecent, onClick }: CompanyListItemProps) {
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'IDR') {
      return `Rp ${price.toLocaleString('id-ID')}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const isPositive = company.priceChangePercent >= 0;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-colors text-left"
    >
      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt={company.ticker} className="h-8 w-8 object-contain" />
        ) : (
          <span className="text-sm font-bold text-primary">{company.ticker.slice(0, 4)}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{company.ticker}</span>
          <Badge variant="exchange" className="text-[10px]">{company.exchange}</Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{company.name}</p>
      </div>

      <div className="text-right shrink-0">
        {showRecent ? (
          <Clock className="h-5 w-5 text-muted-foreground ml-auto" />
        ) : (
          <>
            <p className="font-semibold text-foreground">
              {formatPrice(company.currentPrice, company.currency)}
            </p>
            <p className={cn(
              "text-sm font-medium flex items-center justify-end gap-0.5",
              isPositive ? "text-success" : "text-destructive"
            )}>
              <span>{isPositive ? '↗' : '↘'}</span>
              {isPositive ? '+' : ''}{company.priceChangePercent.toFixed(2)}%
            </p>
          </>
        )}
      </div>
    </button>
  );
}
