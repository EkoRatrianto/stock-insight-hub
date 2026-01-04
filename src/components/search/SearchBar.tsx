import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

export function SearchBar({ value, onChange, placeholder, onFocus }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder || "Search ticker (e.g., AAPL, BBCA)..."}
        className="pl-12 h-12 bg-secondary/50 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary/50"
      />
    </div>
  );
}
