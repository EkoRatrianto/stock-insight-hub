import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Projection } from '@/types/company';
import { Progress } from '@/components/ui/progress';

interface ProjectionSectionProps {
  projections: Projection[];
  averageConfidence: number;
}

export function ProjectionSection({ projections, averageConfidence }: ProjectionSectionProps) {
  return (
    <Card variant="gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Proyeksi 3 Tahun</CardTitle>
          <Badge variant="success" className="text-xs">
            CONFIDENCE: {averageConfidence}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {projections.map((proj) => (
          <div key={proj.year} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{proj.year} (Est.)</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  ${(proj.revenue / 1000).toFixed(0)}B
                </span>
                <span className="text-xs text-success">
                  ▲ {proj.growthRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress 
              value={(proj.revenue / 500000) * 100} 
              className="h-2 bg-secondary"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
