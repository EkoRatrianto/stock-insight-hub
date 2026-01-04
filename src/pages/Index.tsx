import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { AnalysisPage } from '@/pages/AnalysisPage';
import { RatioDetailPage } from '@/pages/RatioDetailPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AuthPage } from '@/pages/AuthPage';
import { ComparePage } from '@/pages/ComparePage';
import { ProjectionsPage } from '@/pages/ProjectionsPage';
import { Company } from '@/types/company';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

type PageState = 
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'analysis'; company: Company }
  | { name: 'ratio-detail'; ratio: string; company: Company }
  | { name: 'settings' }
  | { name: 'portfolio' }
  | { name: 'reports' }
  | { name: 'auth' }
  | { name: 'compare' }
  | { name: 'projections' };

const Index = () => {
  const [currentPage, setCurrentPage] = useState<PageState>({ name: 'home' });
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading } = useAuth();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user && currentPage.name !== 'auth') {
      setCurrentPage({ name: 'auth' });
    }
  }, [user, loading, currentPage.name]);

  // Redirect to home after login
  useEffect(() => {
    if (!loading && user && currentPage.name === 'auth') {
      setCurrentPage({ name: 'home' });
      setActiveTab('home');
    }
  }, [user, loading, currentPage.name]);

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
      case 'auth':
        setCurrentPage({ name: 'auth' });
        break;
      case 'compare':
        setCurrentPage({ name: 'compare' });
        break;
      case 'projections':
        setCurrentPage({ name: 'projections' });
        break;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    handleNavigate(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderPage = () => {
    // Show auth page if not logged in
    if (!user && currentPage.name !== 'auth') {
      return <AuthPage onNavigate={handleNavigate} />;
    }

    switch (currentPage.name) {
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
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
      case 'compare':
        return <ComparePage onNavigate={handleNavigate} />;
      case 'projections':
        return <ProjectionsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col w-full max-w-screen overflow-x-hidden">
      <main className="flex-1 w-full">
        {renderPage()}
      </main>
      {user && currentPage.name !== 'auth' && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
};

export default Index;
