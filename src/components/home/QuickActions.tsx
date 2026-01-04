import { BarChart3, GitCompare, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const actions = [
  { id: 'new-analysis', label: 'New Analysis', icon: BarChart3 },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'projections', label: 'Projections', icon: TrendingUp },
];

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center group-hover:shadow-glow transition-shadow">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xs text-muted-foreground text-center">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
