import { Button } from '@/components/ui/button';

interface FilterChipsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: 'all', label: 'Semua' },
  { id: 'IDX', label: 'Indonesia (IDX)' },
  { id: 'US', label: 'Amerika (US)' },
];

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? 'chipActive' : 'chip'}
          size="chip"
          onClick={() => onFilterChange(filter.id)}
          className="whitespace-nowrap"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
