import { Bell, ChevronLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showShare?: boolean;
  onBack?: () => void;
  userName?: string;
}

export function Header({ title, showBack, showShare, onBack, userName }: HeaderProps) {
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (showBack) {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-heading font-semibold text-lg">{title}</h1>
        {showShare ? (
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Share2 className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-primary/30">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=analyst" />
          <AvatarFallback className="bg-primary/20 text-primary">AN</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading font-semibold text-foreground">
            Hello, {userName || 'Analyst'}
          </h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="relative text-muted-foreground">
        <Bell className="h-5 w-5" />
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive border-2 border-background" />
      </Button>
    </header>
  );
}
