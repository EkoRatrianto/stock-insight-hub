import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Share2 } from 'lucide-react';

interface ReportsPageProps {
  onNavigate: (page: string) => void;
}

const recentReports = [
  {
    id: 1,
    company: 'Apple Inc.',
    ticker: 'AAPL',
    date: '2024-01-03',
    type: 'Full Analysis',
    pages: 12,
  },
  {
    id: 2,
    company: 'NVIDIA Corporation',
    ticker: 'NVDA',
    date: '2024-01-02',
    type: 'ROE Deep Dive',
    pages: 8,
  },
  {
    id: 3,
    company: 'Bank Central Asia',
    ticker: 'BBCA',
    date: '2024-01-01',
    type: 'SWOT Analysis',
    pages: 6,
  },
];

export function ReportsPage({ onNavigate }: ReportsPageProps) {
  return (
    <div className="pb-20 min-h-screen">
      <Header userName="Analyst" />
      
      <div className="px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-foreground">Laporan Saya</h2>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground">Total Laporan</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Bulan Ini</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-xs text-muted-foreground">Dikirim</p>
          </Card>
        </div>

        <section>
          <h3 className="font-heading font-semibold text-foreground mb-3">Laporan Terbaru</h3>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <Card key={report.id} variant="glass" className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{report.ticker}</p>
                      <Badge variant="secondary" className="text-[10px]">{report.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{report.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(report.date).toLocaleDateString('id-ID')} • {report.pages} halaman
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="iconSm">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="iconSm">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
