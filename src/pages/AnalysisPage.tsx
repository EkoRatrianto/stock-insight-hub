import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { CompanyHeader } from '@/components/analysis/CompanyHeader';
import { FinancialChart } from '@/components/analysis/FinancialChart';
import { RatioCard } from '@/components/analysis/RatioCard';
import { SWOTSection } from '@/components/analysis/SWOTSection';
import { ProjectionSection } from '@/components/analysis/ProjectionSection';
import { AIInsightCard } from '@/components/analysis/AIInsightCard';
import { NewsSection } from '@/components/analysis/NewsSection';
import { Button } from '@/components/ui/button';
import { Download, Plus, Loader2 } from 'lucide-react';
import { Company, FinancialData, FinancialRatios } from '@/types/company';
import { mockProjections } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useStockData, SWOTData, StockNews } from '@/hooks/useStockData';
import { generatePDFContent, downloadAsTextFile } from '@/lib/generatePDF';

interface AnalysisPageProps {
  company: Company;
  onNavigate: (page: string, data?: any) => void;
}

export function AnalysisPage({ company, onNavigate }: AnalysisPageProps) {
  const [activeTimeframe, setActiveTimeframe] = useState('5Y');
  const { toast } = useToast();
  const { fetchFinancials, fetchQuotes, fetchNews, fetchSWOT } = useStockData();
  
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [ratios, setRatios] = useState<FinancialRatios[]>([]);
  const [companyData, setCompanyData] = useState<Company>(company);
  const [isLoading, setIsLoading] = useState(true);
  const [swotData, setSwotData] = useState<SWOTData | null>(null);
  const [swotLoading, setSwotLoading] = useState(false);
  const [newsData, setNewsData] = useState<StockNews[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Fetch latest quote
      const quotes = await fetchQuotes([company.ticker]);
      if (quotes.length > 0) {
        const q = quotes[0];
        setCompanyData({
          ...company,
          currentPrice: q.price,
          priceChange: q.change,
          priceChangePercent: q.changePercent,
          marketCap: q.marketCap,
          peRatio: q.pe,
          divYield: q.dividendYield,
          sector: q.sector || company.sector,
        });
      }

      // Fetch financial data
      const financials = await fetchFinancials(company.ticker);
      if (financials) {
        const hasRealData = financials.incomeStatements.some(stmt => stmt.revenue !== null);
        
        if (hasRealData) {
          const fData: FinancialData[] = financials.incomeStatements
            .filter(stmt => stmt.revenue !== null)
            .map((stmt) => ({
              year: stmt.year,
              revenue: (stmt.revenue || 0) / 1000000,
              netIncome: (stmt.netIncome || 0) / 1000000,
              totalAssets: 0,
              totalEquity: 0,
              totalDebt: 0,
              operatingCashFlow: 0,
              eps: stmt.eps || 0,
            }));
          setFinancialData(fData.reverse());

          const rData: FinancialRatios[] = fData.map((f) => ({
            year: f.year,
            roe: (financials.ratios.roe || 0) * 100,
            roa: (financials.ratios.roa || 0) * 100,
            debtToEquity: financials.ratios.debtToEquity || 0,
            currentRatio: financials.ratios.currentRatio || 0,
            netProfitMargin: (financials.ratios.profitMargin || 0) * 100,
            assetTurnover: 0,
            financialLeverage: 0,
            peRatio: financials.ratios.pe || 0,
            pbRatio: financials.ratios.pb || 0,
          }));
          setRatios(rData);
        } else {
          const metaData = (financials as any).meta;
          if (metaData) {
            setRatios([{
              year: new Date().getFullYear(),
              roe: 0,
              roa: 0,
              debtToEquity: 0,
              currentRatio: 0,
              netProfitMargin: 0,
              assetTurnover: 0,
              financialLeverage: 0,
              peRatio: financials.ratios.pe || 0,
              pbRatio: financials.ratios.pb || 0,
            }]);
          }
        }
      }
      
      setIsLoading(false);
    };

    loadData();
  }, [company.ticker, fetchFinancials, fetchQuotes]);

  // Fetch news separately
  useEffect(() => {
    const loadNews = async () => {
      setNewsLoading(true);
      const news = await fetchNews(company.ticker);
      setNewsData(news);
      setNewsLoading(false);
    };
    loadNews();
  }, [company.ticker, fetchNews]);

  // Fetch SWOT analysis separately (AI-powered)
  useEffect(() => {
    const loadSWOT = async () => {
      setSwotLoading(true);
      const swot = await fetchSWOT(
        company.name, 
        company.ticker, 
        companyData.currentPrice, 
        companyData.priceChangePercent, 
        company.sector
      );
      setSwotData(swot);
      setSwotLoading(false);
    };
    
    // Only fetch after we have company data
    if (!isLoading) {
      loadSWOT();
    }
  }, [company.name, company.ticker, company.sector, companyData.currentPrice, companyData.priceChangePercent, fetchSWOT, isLoading]);

  const defaultRatios = {
    roe: 0, roa: 0, debtToEquity: 0, currentRatio: 0, netProfitMargin: 0,
    assetTurnover: 0, financialLeverage: 0, peRatio: 0, pbRatio: 0, year: 0
  };
  const latestRatios = ratios[ratios.length - 1] || defaultRatios;
  const previousRatios = ratios[ratios.length - 2] || latestRatios;

  // Helper to safely format numbers
  const safeToFixed = (value: number | null | undefined, decimals: number = 1): string => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return value.toFixed(decimals);
  };

  const getRatioTrend = (current: number | undefined, previous: number | undefined, inverse: boolean = false) => {
    const curr = current ?? 0;
    const prev = previous ?? 0;
    const diff = curr - prev;
    if (Math.abs(diff) < 0.01) return 'neutral';
    if (inverse) return diff > 0 ? 'down' : 'up';
    return diff > 0 ? 'up' : 'down';
  };

  const handleDownloadPDF = () => {
    const content = generatePDFContent({
      company: companyData,
      ratios: latestRatios,
      swot: swotData,
      generatedAt: new Date(),
    });
    
    const filename = `${companyData.ticker}_analysis_${new Date().toISOString().split('T')[0]}.txt`;
    downloadAsTextFile(content, filename);
    
    toast({
      title: "Laporan Diunduh",
      description: `Laporan ${companyData.ticker} berhasil diunduh sebagai ${filename}`,
    });
  };

  const handleAddToWatchlist = () => {
    toast({
      title: "Ditambahkan ke Watchlist",
      description: `${company.ticker} berhasil ditambahkan ke watchlist Anda.`,
    });
  };

  const aiInsight = `Analisis real-time untuk ${companyData.name}. ROE saat ini ${safeToFixed(latestRatios.roe)}% dengan P/E ratio ${safeToFixed(latestRatios.peRatio)}. Margin laba bersih berada di ${safeToFixed(latestRatios.netProfitMargin)}%.`;

  return (
    <div className="pb-32 min-h-dvh w-full">
      <Header 
        title="Analisis Perusahaan" 
        showBack 
        showShare
        onBack={() => onNavigate('home')} 
      />
      
      <div className="px-3 sm:px-4 space-y-4 sm:space-y-6 py-3 sm:py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading data...</span>
          </div>
        ) : (
          <>
            <CompanyHeader 
              company={companyData} 
              activeTimeframe={activeTimeframe}
              onTimeframeChange={setActiveTimeframe}
            />

            <FinancialChart 
              data={financialData.length > 0 ? financialData : []} 
              title="Ikhtisar Keuangan 5 Tahun"
              yoyChange={financialData.length > 1 
                ? ((financialData[financialData.length-1].revenue - financialData[financialData.length-2].revenue) / financialData[financialData.length-2].revenue * 100)
                : 0
              }
            />

            <section>
              <h3 className="font-heading font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Tren Rasio Utama</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <RatioCard
                  label="ROE (Return on Equity)"
                  value={`${safeToFixed(latestRatios.roe, 0)}%`}
                  trend={getRatioTrend(latestRatios.roe, previousRatios.roe)}
                  onClick={() => onNavigate('ratio-detail', { ratio: 'roe', company: companyData })}
                />
                <RatioCard
                  label="Debt to Equity"
                  value={safeToFixed(latestRatios.debtToEquity, 2)}
                  trend={getRatioTrend(latestRatios.debtToEquity, previousRatios.debtToEquity, true)}
                />
                <RatioCard
                  label="Net Profit Margin"
                  value={`${safeToFixed(latestRatios.netProfitMargin)}%`}
                  trend={getRatioTrend(latestRatios.netProfitMargin, previousRatios.netProfitMargin)}
                />
                <RatioCard
                  label="P/E Ratio"
                  value={safeToFixed(latestRatios.peRatio)}
                  trend="neutral"
                />
              </div>
            </section>

            <AIInsightCard insight={aiInsight} />

            <SWOTSection swot={swotData} compact loading={swotLoading} />

            <NewsSection news={newsData} loading={newsLoading} />

            <ProjectionSection 
              projections={mockProjections}
              averageConfidence={80}
            />

            {/* Footer info */}
            <div className="text-center text-[10px] sm:text-xs text-muted-foreground py-3 sm:py-4">
              <p>ID: 89332-{company.ticker}-XE • VER. 2.4.1</p>
              <p>Data: Yahoo Finance • SWOT: AI Generated</p>
            </div>
          </>
        )}
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
