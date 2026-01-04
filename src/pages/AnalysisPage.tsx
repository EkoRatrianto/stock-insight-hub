import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { CompanyHeader } from '@/components/analysis/CompanyHeader';
import { FinancialChart } from '@/components/analysis/FinancialChart';
import { RatioCard } from '@/components/analysis/RatioCard';
import { SWOTSection } from '@/components/analysis/SWOTSection';
import { ProjectionSection } from '@/components/analysis/ProjectionSection';
import { AIInsightCard } from '@/components/analysis/AIInsightCard';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { Company } from '@/types/company';
import { mockFinancialData, mockRatios, mockSWOT, mockProjections } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface AnalysisPageProps {
  company: Company;
  onNavigate: (page: string, data?: any) => void;
}

export function AnalysisPage({ company, onNavigate }: AnalysisPageProps) {
  const [activeTimeframe, setActiveTimeframe] = useState('5Y');
  const { toast } = useToast();

  const latestRatios = mockRatios[mockRatios.length - 1];
  const previousRatios = mockRatios[mockRatios.length - 2];

  const getRatioTrend = (current: number, previous: number, inverse: boolean = false) => {
    const diff = current - previous;
    if (Math.abs(diff) < 0.01) return 'neutral';
    if (inverse) return diff > 0 ? 'down' : 'up';
    return diff > 0 ? 'up' : 'down';
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Mengunduh Laporan PDF",
      description: `Laporan analisis ${company.ticker} sedang diproses...`,
    });
  };

  const handleAddToWatchlist = () => {
    toast({
      title: "Ditambahkan ke Watchlist",
      description: `${company.ticker} berhasil ditambahkan ke watchlist Anda.`,
    });
  };

  const aiInsight = `ROE meningkat terutama karena peningkatan Net Profit Margins di Q3, didorong oleh pemotongan biaya di rantai pasokan. Leverage tetap stabil, menunjukkan pertumbuhan organik daripada ekspansi yang didanai hutang.`;

  return (
    <div className="pb-32 min-h-dvh w-full">
      <Header 
        title="Analisis Perusahaan" 
        showBack 
        showShare
        onBack={() => onNavigate('home')} 
      />
      
      <div className="px-3 sm:px-4 space-y-4 sm:space-y-6 py-3 sm:py-4">
        <CompanyHeader 
          company={company} 
          activeTimeframe={activeTimeframe}
          onTimeframeChange={setActiveTimeframe}
        />

        <FinancialChart 
          data={mockFinancialData} 
          title="Ikhtisar Keuangan 5 Tahun"
          yoyChange={5}
        />

        <section>
          <h3 className="font-heading font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Tren Rasio Utama</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <RatioCard
              label="ROE (Return on Equity)"
              value={`${latestRatios.roe.toFixed(0)}%`}
              trend={getRatioTrend(latestRatios.roe, previousRatios.roe)}
              onClick={() => onNavigate('ratio-detail', { ratio: 'roe', company })}
            />
            <RatioCard
              label="Debt to Equity"
              value={latestRatios.debtToEquity}
              trend={getRatioTrend(latestRatios.debtToEquity, previousRatios.debtToEquity, true)}
            />
            <RatioCard
              label="Net Profit Margin"
              value={`${latestRatios.netProfitMargin.toFixed(1)}%`}
              trend={getRatioTrend(latestRatios.netProfitMargin, previousRatios.netProfitMargin)}
              subLabel="+0.5%"
            />
            <RatioCard
              label="P/E Ratio"
              value={latestRatios.peRatio}
              trend="neutral"
            />
          </div>
        </section>

        <AIInsightCard insight={aiInsight} />

        <SWOTSection swot={mockSWOT} compact />

        <ProjectionSection 
          projections={mockProjections}
          averageConfidence={80}
        />

        {/* Footer info */}
        <div className="text-center text-[10px] sm:text-xs text-muted-foreground py-3 sm:py-4">
          <p>ID: 89332-{company.ticker}-XE • VER. 2.4.1</p>
          <p>eko.ratrianto@gmail.com</p>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-16 left-0 right-0 px-3 sm:px-4 pb-2 pt-2 bg-gradient-to-t from-background via-background to-transparent safe-area-pb">
        <div className="flex gap-2 sm:gap-3 max-w-lg mx-auto">
          <Button 
            variant="outline" 
            size="default"
            className="flex-1 h-11 text-xs sm:text-sm"
            onClick={handleAddToWatchlist}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 shrink-0" />
            <span className="truncate">Watchlist</span>
          </Button>
          <Button 
            size="default"
            className="flex-1 h-11 text-xs sm:text-sm"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 shrink-0" />
            <span className="truncate">Unduh PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
