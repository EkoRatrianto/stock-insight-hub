import { Shield, AlertTriangle, Lightbulb, AlertOctagon, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SWOTData } from '@/hooks/useStockData';
import { cn } from '@/lib/utils';

interface SWOTSectionProps {
  swot: SWOTData | null;
  compact?: boolean;
  loading?: boolean;
}

const swotConfig = [
  { key: 'strengths', label: 'KEKUATAN', icon: Shield, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  { key: 'weaknesses', label: 'KELEMAHAN', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  { key: 'opportunities', label: 'PELUANG', icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  { key: 'threats', label: 'ANCAMAN', icon: AlertOctagon, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
] as const;

export function SWOTSection({ swot, compact, loading }: SWOTSectionProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base">Analisis SWOT</h3>
        <div className="grid grid-cols-2 gap-3">
          {swotConfig.map(({ key, label, icon: Icon, color, bg, border }) => (
            <Card key={key} className={cn("p-3", bg, border)}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", color)} />
                <span className={cn("text-xs font-semibold", color)}>{label}</span>
              </div>
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!swot) {
    return (
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base">Analisis SWOT</h3>
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">SWOT analysis not available</p>
        </Card>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base">Analisis SWOT (AI)</h3>
        <div className="grid grid-cols-2 gap-3">
          {swotConfig.map(({ key, label, icon: Icon, color, bg, border }) => (
            <Card key={key} className={cn("p-3", bg, border)}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", color)} />
                <span className={cn("text-xs font-semibold", color)}>{label}</span>
              </div>
              <p className="text-xs text-foreground line-clamp-3">
                {swot[key as keyof SWOTData]?.[0] || 'N/A'}
              </p>
            </Card>
          ))}
        </div>
        {swot.summary && (
          <p className="text-xs text-muted-foreground italic px-1">{swot.summary}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-semibold text-foreground">Analisis SWOT (AI)</h3>
      <div className="grid grid-cols-2 gap-3">
        {swotConfig.map(({ key, label, icon: Icon, color, bg, border }) => (
          <Card key={key} className={cn("p-4", bg, border)}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn("h-5 w-5", color)} />
              <span className={cn("text-xs font-semibold uppercase", color)}>{label}</span>
            </div>
            <ul className="space-y-2">
              {(swot[key as keyof SWOTData] as string[] || []).map((item, idx) => (
                <li key={idx} className="text-xs text-foreground leading-relaxed">
                  • {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      {swot.summary && (
        <Card className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">{swot.summary}</p>
        </Card>
      )}
    </div>
  );
}
