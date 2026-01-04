import { useState } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { RatioDetailPage } from '@/pages/RatioDetailPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { Company } from '@/types/company';

type PageState = 
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'analysis'; company: Company }
  | { name: 'ratio-detail'; ratio: string; company: Company }
  | { name: 'settings' }
  | { name: 'portfolio' }
  | { name: 'reports' };

const Index = () => {
  const [currentPage, setCurrentPage] = useState<PageState>({ name: 'home' });
  const [activeTab, setActiveTab] = useState('home');

  const handleNavigate = (page: string, data?: any) => {
    switch (page) {
      case 'home':
        setCurrentPage({ name: 'home' });
        setActiveTab('home');
        break;
      case 'search':
        setCurrentPage({ name: 'search' });
        setActiveTab('search');
        break;
      case 'analysis':
        setCurrentPage({ name: 'analysis', company: data });
        break;
      case 'ratio-detail':
        setCurrentPage({ name: 'ratio-detail', ratio: data.ratio, company: data.company });
        break;
      case 'settings':
        setCurrentPage({ name: 'settings' });
        setActiveTab('settings');
        break;
      case 'portfolio':
        setCurrentPage({ name: 'portfolio' });
        setActiveTab('portfolio');
        break;
      case 'reports':
        setCurrentPage({ name: 'reports' });
        setActiveTab('reports');
        break;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    handleNavigate(tab);
  };

  const renderPage = () => {
    switch (currentPage.name) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'search':
        return <SearchPage onNavigate={handleNavigate} />;
      case 'analysis':
        return <AnalysisPage company={currentPage.company} onNavigate={handleNavigate} />;
      case 'ratio-detail':
        return <RatioDetailPage ratio={currentPage.ratio} company={currentPage.company} onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case 'portfolio':
        return <PortfolioPage onNavigate={handleNavigate} />;
      case 'reports':
        return <ReportsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
