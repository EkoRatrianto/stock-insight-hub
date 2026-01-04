import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Company } from '@/types/company';
import { mockRatios } from '@/data/mockData';
import { ChevronDown, Info, Percent, RefreshCw, Scale } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface RatioDetailPageProps {
  ratio: string;
  company: Company;
  onNavigate: (page: string, data?: any) => void;
}

export function RatioDetailPage({ ratio, company, onNavigate }: RatioDetailPageProps) {
  const [activeTimeframe, setActiveTimeframe] = useState('5Y');
  const [swotOpen, setSWOTOpen] = useState(false);

  const timeframes = ['1Y', '3Y', '5Y', 'All'];
  
  const chartData = mockRatios.map(r => ({
    year: r.year.toString(),
    company: r.roe,
    industry: 12.1, // Mock industry average
  }));

  const latestROE = mockRatios[mockRatios.length - 1].roe;
  const yoyChange = 2.1;
  const industryAvg = 12.1;
  const sectorLeader = 24.8;

  // DuPont breakdown
  const dupont = {
    netProfitMargin: { value: 12.5, change: '+0.5%', category: 'Efficiency' },
    assetTurnover: { value: 0.85, change: 'No Change', category: 'Activity' },
    financialLeverage: { value: 1.73, change: '+0.1x', category: 'Solvency' },
  };

  return (
    <div className="pb-24 min-h-screen">
      <Header 
        title="Return on Equity" 
        showBack 
        showShare
        onBack={() => onNavigate('analysis', company)} 
      />
      
      <div className="px-4 space-y-6 py-4">
        {/* Main ROE Display */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-sm">{company.ticker} • {company.exchange}</p>
          <h1 className="text-5xl font-bold font-heading text-foreground">{latestROE.toFixed(1)}%</h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="success">↗ +{yoyChange}% YoY</Badge>
            <span className="text-muted-foreground">• Healthy</span>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center justify-center gap-2 p-1 bg-secondary/50 rounded-lg w-fit mx-auto">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={activeTimeframe === tf ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTimeframe(tf)}
              className="px-5"
            >
              {tf}
            </Button>
          ))}
        </div>

        {/* Chart */}
        <Card variant="gradient">
          <CardContent className="pt-6">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="roeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 20%, 65%)', fontSize: 10 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 9%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                  />
                  <ReferenceLine 
                    y={industryAvg} 
                    stroke="hsl(215, 20%, 45%)" 
                    strokeDasharray="5 5"
                    label={{ value: 'Industry', fill: 'hsl(215, 20%, 65%)', fontSize: 10, position: 'right' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="company"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={3}
                    fill="url(#roeGradient)"
                    name="Company"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-end gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-4 bg-primary rounded" />
                <span className="text-xs text-muted-foreground">Company</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-4 border-t-2 border-dashed border-muted-foreground" />
                <span className="text-xs text-muted-foreground">Industry</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industry Benchmarks */}
        <section>
          <h3 className="font-heading font-semibold text-foreground mb-3">Industry Benchmarks</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card variant="glass" className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Industry Avg</p>
              <p className="text-xl font-bold text-foreground">{industryAvg}%</p>
              <Progress value={50} className="h-1.5 mt-2 bg-secondary" />
            </Card>
            <Card variant="glass" className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Sector Leader</p>
              <p className="text-xl font-bold text-foreground">{sectorLeader}%</p>
              <Progress value={100} className="h-1.5 mt-2 bg-success/30" indicatorClassName="bg-success" />
            </Card>
          </div>
        </section>

        {/* Key Drivers (DuPont) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-foreground">Key Drivers (DuPont)</h3>
            <Button variant="link" className="text-primary text-sm p-0 h-auto">
              Explain
            </Button>
          </div>
          <div className="space-y-3">
            <Card variant="glass" className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Net Profit Margin</p>
                <p className="text-xs text-muted-foreground">{dupont.netProfitMargin.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{dupont.netProfitMargin.value}%</p>
                <p className="text-xs text-success">{dupont.netProfitMargin.change}</p>
              </div>
            </Card>

            <Card variant="glass" className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Asset Turnover</p>
                <p className="text-xs text-muted-foreground">{dupont.assetTurnover.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{dupont.assetTurnover.value}x</p>
                <p className="text-xs text-muted-foreground">{dupont.assetTurnover.change}</p>
              </div>
            </Card>

            <Card variant="glass" className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <Scale className="h-5 w-5 text-chart-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Financial Leverage</p>
                <p className="text-xs text-muted-foreground">{dupont.financialLeverage.category}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{dupont.financialLeverage.value}x</p>
                <p className="text-xs text-success">{dupont.financialLeverage.change}</p>
              </div>
            </Card>
          </div>
        </section>

        {/* AI Analysis */}
        <Card variant="glow" className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              ✨ AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              ROE increased primarily due to improved <strong>Net Profit Margins</strong> in Q3, driven by cost-cutting in the supply chain. Leverage remains stable, indicating organic growth rather than debt-fueled expansion.
            </p>
          </CardContent>
        </Card>

        {/* 3-Year Projection */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-foreground">3-Year Projection</h3>
            <span className="text-xs text-muted-foreground">Based on historicals</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card variant="glass" className="p-4">
              <p className="text-xs text-muted-foreground">2025 (F)</p>
              <p className="text-xl font-bold text-foreground">19.2%</p>
              <p className="text-xs text-success">+4.3% YoY</p>
            </Card>
            <Card variant="glass" className="p-4">
              <p className="text-xs text-muted-foreground">2026 (F)</p>
              <p className="text-xl font-bold text-foreground">20.5%</p>
              <p className="text-xs text-success">+6.7% YoY</p>
            </Card>
          </div>
        </section>

        {/* SWOT Collapsible */}
        <Collapsible open={swotOpen} onOpenChange={setSWOTOpen}>
          <CollapsibleTrigger asChild>
            <Card variant="glass" className="p-4 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">SWOT Analysis</span>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${swotOpen ? 'rotate-180' : ''}`} />
              </div>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Card variant="glass" className="p-4">
              <p className="text-sm text-muted-foreground">
                Full SWOT analysis available in the complete report.
              </p>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4">
          <p>ID: 8823-XJ • V2.4.1</p>
          <p>eko.ratrianto@gmail.com</p>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-20 left-4 right-4">
        <Button size="lg" className="w-full">
          + Add to Watchlist
        </Button>
      </div>
    </div>
  );
}
