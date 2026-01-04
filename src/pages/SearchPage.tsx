import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterChips } from '@/components/search/FilterChips';
import { CompanyListItem } from '@/components/company/CompanyListItem';
import { Button } from '@/components/ui/button';
import { mockCompanies, trendingStocks } from '@/data/mockData';
import { Company } from '@/types/company';

interface SearchPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState<Company[]>([
    mockCompanies[4], // BBCA
    mockCompanies[5], // GOTO
  ]);

  const filteredCompanies = useMemo(() => {
    let companies = mockCompanies;
    
    if (activeFilter === 'IDX') {
      companies = companies.filter(c => c.exchange === 'IDX');
    } else if (activeFilter === 'US') {
      companies = companies.filter(c => c.exchange === 'NASDAQ' || c.exchange === 'NYSE');
    }

    if (searchValue) {
      const query = searchValue.toLowerCase();
      companies = companies.filter(
        c => c.ticker.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
      );
    }

    return companies;
  }, [searchValue, activeFilter]);

  const handleSelectCompany = (company: Company) => {
    if (!recentSearches.find(r => r.ticker === company.ticker)) {
      setRecentSearches(prev => [company, ...prev].slice(0, 5));
    }
    onNavigate('analysis', company);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <div className="pb-20 min-h-screen">
      <Header 
        title="Pencarian Perusahaan" 
        showBack 
        onBack={() => onNavigate('home')} 
      />
      
      <div className="px-4 space-y-6">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Cari kode saham (AAPL) atau nama..."
        />

        <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {!searchValue && recentSearches.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-foreground">Pencarian Terakhir</h2>
              <Button 
                variant="link" 
                className="text-primary text-sm p-0 h-auto"
                onClick={clearRecentSearches}
              >
                Hapus Semua
              </Button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((company) => (
                <CompanyListItem
                  key={company.ticker}
                  company={company}
                  showRecent
                  onClick={() => handleSelectCompany(company)}
                />
              ))}
            </div>
          </section>
        )}

        {!searchValue && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-foreground">Sedang Tren</h2>
              <Button variant="link" className="text-primary text-sm p-0 h-auto">
                Lihat Semua →
              </Button>
            </div>
            <div className="space-y-2">
              {trendingStocks.map((stock) => {
                const company = mockCompanies.find(c => c.ticker === stock.ticker);
                if (!company) return null;
                return (
                  <CompanyListItem
                    key={stock.ticker}
                    company={company}
                    onClick={() => handleSelectCompany(company)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {searchValue && (
          <section>
            <h2 className="font-heading font-semibold text-foreground mb-3">
              Hasil Pencarian ({filteredCompanies.length})
            </h2>
            <div className="space-y-2">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <CompanyListItem
                    key={company.ticker}
                    company={company}
                    onClick={() => handleSelectCompany(company)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada hasil untuk "{searchValue}"
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
