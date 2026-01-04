import { Bell, ChevronLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { shareContent } from '@/lib/generatePDF';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showShare?: boolean;
  onBack?: () => void;
  userName?: string;
}

export function Header({ title, showBack, showShare, onBack, userName }: HeaderProps) {
  const { toast } = useToast();
  
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleShare = () => {
    const shareText = `Lihat analisis ${title || 'saham'} di Stock Analyzer!`;
    shareContent(title || 'Stock Analyzer', shareText, window.location.href);
    toast({
      title: 'Berbagi',
      description: 'Konten siap dibagikan!',
    });
  };

  if (showBack) {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-background/95 backdrop-blur-lg border-b border-border/50 safe-area-pt">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground h-9 w-9 sm:h-10 sm:w-10">
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <h1 className="font-heading font-semibold text-sm sm:text-lg truncate max-w-[60%]">{title}</h1>
        {showShare ? (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground h-9 w-9 sm:h-10 sm:w-10"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        ) : (
          <div className="w-9 sm:w-10" />
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-background/95 backdrop-blur-lg safe-area-pt">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/30 shrink-0">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'analyst'}`} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm sm:text-base">
            {(userName || 'AN').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="font-heading font-semibold text-foreground text-sm sm:text-base truncate">
            Hello, {userName || 'Analyst'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{today}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="relative text-muted-foreground h-9 w-9 sm:h-10 sm:w-10 shrink-0">
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="absolute top-1 right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive border-2 border-background" />
      </Button>
    </header>
  );
}
