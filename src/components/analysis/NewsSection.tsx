import { ExternalLink, Newspaper } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StockNews } from '@/hooks/useStockData';

interface NewsSectionProps {
  news: StockNews[];
  loading?: boolean;
}

export function NewsSection({ news, loading }: NewsSectionProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base">Berita Terkini</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base">Berita Terkini</h3>
        <Card className="p-4 text-center">
          <Newspaper className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Tidak ada berita terbaru</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-semibold text-foreground text-sm sm:text-base">Berita Terkini</h3>
      <div className="space-y-2">
        {news.slice(0, 5).map((item) => (
          <Card 
            key={item.uuid} 
            className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => window.open(item.link, '_blank')}
          >
            <div className="flex items-start gap-3">
              {item.thumbnail && (
                <img 
                  src={item.thumbnail} 
                  alt="" 
                  className="w-16 h-12 object-cover rounded shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 mb-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <span>{item.publisher}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(item.providerPublishTime)}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
