import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  BarChart2, 
  TrendingUp, 
  Mail, 
  Send, 
  DollarSign, 
  Moon, 
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    includeSWOT: true,
    includeProjection: false,
    autoSend: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="pb-20 min-h-screen">
      <Header 
        title="Pengaturan" 
        showBack 
        onBack={() => onNavigate('home')} 
      />
      
      <div className="px-4 space-y-6 py-4">
        {/* Laporan & Ekspor */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            LAPORAN & EKSPOR
          </h3>
          <Card variant="glass" className="divide-y divide-border">
            <div className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Format PDF</p>
              </div>
              <span className="text-sm text-muted-foreground">A4 - Portrait</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 rounded-lg bg-warning/20 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Analisis SWOT</p>
              </div>
              <Switch 
                checked={settings.includeSWOT} 
                onCheckedChange={() => toggleSetting('includeSWOT')} 
              />
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Proyeksi 3 Tahun</p>
              </div>
              <Switch 
                checked={settings.includeProjection} 
                onCheckedChange={() => toggleSetting('includeProjection')} 
              />
            </div>
          </Card>
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Pilih komponen yang akan disertakan secara otomatis saat mengunduh laporan emiten.
          </p>
        </section>

        {/* Pengiriman */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            PENGIRIMAN
          </h3>
          <Card variant="glass" className="divide-y divide-border">
            <div className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-chart-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Email</p>
              </div>
              <span className="text-sm text-muted-foreground">-</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Kirim Otomatis</p>
              </div>
              <Switch 
                checked={settings.autoSend} 
                onCheckedChange={() => toggleSetting('autoSend')} 
              />
            </div>
          </Card>
        </section>

        {/* Preferensi Umum */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            PREFERENSI UMUM
          </h3>
          <Card variant="glass" className="divide-y divide-border">
            <div className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 rounded-lg bg-success/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Mata Uang</p>
              </div>
              <span className="text-sm text-muted-foreground">USD ($)</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
                <Moon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Tema</p>
              </div>
              <span className="text-sm text-muted-foreground">Gelap</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground py-4">
          <p>Versi 1.0.4</p>
        </div>
      </div>
    </div>
  );
}