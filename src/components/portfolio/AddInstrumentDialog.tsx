import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useStockData } from '@/hooks/useStockData';

interface AddInstrumentDialogProps {
  onHoldingAdded?: () => void;
}

export function AddInstrumentDialog({ onHoldingAdded }: AddInstrumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { addHolding } = usePortfolio();
  const { fetchQuotes } = useStockData();

  const handleSearch = async () => {
    if (!ticker.trim()) return;
    
    setIsSearching(true);
    try {
      const quotes = await fetchQuotes([ticker.toUpperCase()]);
      if (quotes.length > 0) {
        setName(quotes[0].name);
        setPrice(quotes[0].price.toString());
        toast({
          title: 'Ditemukan',
          description: `${quotes[0].name} - $${quotes[0].price.toFixed(2)}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Tidak Ditemukan',
          description: 'Simbol saham tidak ditemukan',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticker || !quantity || !price || !name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Semua field harus diisi',
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await addHolding(
      ticker.toUpperCase(),
      name,
      parseFloat(quantity),
      parseFloat(price)
    );

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal menambahkan instrumen',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: `${ticker.toUpperCase()} ditambahkan ke portfolio`,
      });
      setOpen(false);
      setTicker('');
      setQuantity('');
      setPrice('');
      setName('');
      onHoldingAdded?.();
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Instrumen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticker">Simbol Saham</Label>
            <div className="flex gap-2">
              <Input
                id="ticker"
                placeholder="AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Perusahaan</Label>
            <Input
              id="name"
              placeholder="Apple Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga Beli ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="150.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tambah ke Portfolio
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
