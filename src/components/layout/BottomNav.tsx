import { Home, Search, PieChart, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'search', label: 'Cari', icon: Search },
  { id: 'portfolio', label: 'Portofolio', icon: PieChart },
  { id: 'reports', label: 'Laporan', icon: FileText },
  { id: 'settings', label: 'Pengaturan', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'navActive' : 'nav'}
              size="nav"
              onClick={() => onTabChange(item.id)}
              className="flex-1 min-w-0 max-w-[72px] touch-target"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] truncate">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
