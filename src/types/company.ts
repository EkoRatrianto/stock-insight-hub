export interface Company {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  country: string;
  currency: string;
  logoUrl?: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  marketCap: number;
  peRatio: number;
  divYield: number;
}

export interface FinancialData {
  year: number;
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalEquity: number;
  totalDebt: number;
  operatingCashFlow: number;
  eps: number;
}

export interface FinancialRatios {
  year: number;
  roe: number;
  roa: number;
  debtToEquity: number;
  currentRatio: number;
  netProfitMargin: number;
  assetTurnover: number;
  financialLeverage: number;
  peRatio: number;
  pbRatio: number;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Projection {
  year: number;
  revenue: number;
  netIncome: number;
  roe: number;
  confidence: number;
  growthRate: number;
}

export interface CompanyAnalysis {
  company: Company;
  financialData: FinancialData[];
  ratios: FinancialRatios[];
  swot: SWOTAnalysis;
  projections: Projection[];
  aiInsight: string;
  rating: 'STRONG' | 'HOLD' | 'WEAK';
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  logoUrl?: string;
  currentPrice: number;
  priceChangePercent: number;
  rating?: 'STRONG' | 'HOLD' | 'WEAK';
}
