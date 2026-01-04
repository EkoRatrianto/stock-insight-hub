import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Company } from '@/types/company';
import { cn } from '@/lib/utils';

interface CompanyHeaderProps {
  company: Company;
  activeTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

const timeframes = ['1Y', '3Y', '5Y'];

export function CompanyHeader({ company, activeTimeframe, onTimeframeChange }: CompanyHeaderProps) {
  const isPositive = company.priceChangePercent >= 0;
  const formatPrice = company.currency === 'IDR'
    ? `Rp ${company.currentPrice.toLocaleString('id-ID')}`
    : `$${company.currentPrice.toFixed(2)}`;

  const formatMarketCap = (value: number, currency: string) => {
    if (currency === 'IDR') {
      if (value >= 1000000000000000) return `Rp ${(value / 1000000000000000).toFixed(2)}Kuadriliun`;
      if (value >= 1000000000000) return `Rp ${(value / 1000000000000).toFixed(2)}T`;
      return `Rp ${(value / 1000000000).toFixed(2)}M`;
    }
    if (value >= 1000000000000) return `$${(value / 1000000000000).toFixed(2)}T`;
    return `$${(value / 1000000000).toFixed(2)}B`;
  };

  return (
    <div className="text-center space-y-4 animate-slide-up">
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 mx-auto flex items-center justify-center">
        <span className="text-2xl font-bold text-primary">{company.ticker.slice(0, 2)}</span>
      </div>

      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">
          {company.name} ({company.ticker})
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-2xl font-bold text-foreground">{formatPrice}</span>
          <Badge variant={isPositive ? 'success' : 'destructive'}>
            {isPositive ? '↗' : '↘'} {isPositive ? '+' : ''}{company.priceChangePercent.toFixed(2)}%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {company.exchange} • {company.sector} • {company.industry}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 p-1 bg-secondary/50 rounded-lg w-fit mx-auto">
        {timeframes.map((tf) => (
          <Button
            key={tf}
            variant={activeTimeframe === tf ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTimeframeChange(tf)}
            className="px-6"
          >
            {tf}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase">Market Cap</p>
          <p className="font-semibold text-foreground">
            {formatMarketCap(company.marketCap, company.currency)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase">P/E Ratio</p>
          <p className="font-semibold text-foreground">{company.peRatio.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase">Div Yield</p>
          <p className={cn(
            "font-semibold",
            company.divYield > 0 ? "text-success" : "text-muted-foreground"
          )}>
            {company.divYield > 0 ? `${company.divYield.toFixed(2)}%` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
