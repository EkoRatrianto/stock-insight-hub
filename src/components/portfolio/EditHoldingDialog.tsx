import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PortfolioHolding } from '@/hooks/usePortfolio';

interface EditHoldingDialogProps {
  holding: PortfolioHolding | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, quantity: number, averagePrice: number) => Promise<{ error: any }>;
  onHoldingUpdated?: () => void;
}

export function EditHoldingDialog({ 
  holding, 
  open, 
  onOpenChange, 
  onSave,
  onHoldingUpdated 
}: EditHoldingDialogProps) {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (holding) {
      setQuantity(holding.quantity.toString());
      setPrice(holding.average_price.toString());
    }
  }, [holding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!holding || !quantity || !price) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Semua field harus diisi',
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await onSave(
      holding.id,
      parseFloat(quantity),
      parseFloat(price)
    );

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Gagal mengupdate instrumen',
      });
    } else {
      toast({
        title: 'Berhasil',
        description: `${holding.ticker} berhasil diupdate`,
      });
      onOpenChange(false);
      onHoldingUpdated?.();
    }
    
    setIsLoading(false);
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'IDR': 'Rp',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'SGD': 'S$',
      'HKD': 'HK$',
    };
    return symbols[currency] || currency + ' ';
  };

  if (!holding) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {holding.ticker}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{holding.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Harga saat ini: {getCurrencySymbol(holding.currency)}{holding.current_price.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-quantity">Jumlah</Label>
            <Input
              id="edit-quantity"
              type="number"
              step="0.01"
              placeholder="100"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-price">Harga Beli ({getCurrencySymbol(holding.currency).trim()})</Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              placeholder="150.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
