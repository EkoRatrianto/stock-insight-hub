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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, ChevronRight } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Password minimal 6 karakter').max(72, 'Password maksimal 72 karakter');

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: passwordResult.error.errors[0].message,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password tidak cocok',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await updatePassword(newPassword);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } else {
      toast({
        title: 'Berhasil',
        description: 'Password berhasil diubah!',
      });
      setNewPassword('');
      setConfirmPassword('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="h-9 w-9 rounded-lg bg-warning/20 flex items-center justify-center">
            <Lock className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Ubah Password</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
                maxLength={72}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                maxLength={72}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
