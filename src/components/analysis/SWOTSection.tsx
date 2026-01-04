import { Shield, AlertTriangle, Lightbulb, AlertOctagon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SWOTAnalysis } from '@/types/company';
import { cn } from '@/lib/utils';

interface SWOTSectionProps {
  swot: SWOTAnalysis;
  compact?: boolean;
}

const swotConfig = [
  { key: 'strengths', label: 'KEKUATAN', icon: Shield, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  { key: 'weaknesses', label: 'KELEMAHAN', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  { key: 'opportunities', label: 'PELUANG', icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  { key: 'threats', label: 'ANCAMAN', icon: AlertOctagon, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30' },
] as const;

export function SWOTSection({ swot, compact }: SWOTSectionProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {swotConfig.map(({ key, label, icon: Icon, color, bg, border }) => (
          <Card key={key} className={cn("p-3", bg, border)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("h-4 w-4", color)} />
              <span className={cn("text-xs font-semibold", color)}>{label}</span>
            </div>
            <p className="text-xs text-foreground line-clamp-3">
              {swot[key][0]}
            </p>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-semibold text-foreground">Analisis SWOT</h3>
      <div className="grid grid-cols-2 gap-3">
        {swotConfig.map(({ key, label, icon: Icon, color, bg, border }) => (
          <Card key={key} className={cn("p-4", bg, border)}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn("h-5 w-5", color)} />
              <span className={cn("text-xs font-semibold uppercase", color)}>{label}</span>
            </div>
            <ul className="space-y-2">
              {swot[key].map((item, idx) => (
                <li key={idx} className="text-xs text-foreground leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
