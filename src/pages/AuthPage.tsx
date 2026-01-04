import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Mail, Lock, User, Loader2, ArrowLeft, Chrome } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const emailSchema = z.string().trim().email('Email tidak valid').max(255, 'Email terlalu panjang');
const passwordSchema = z.string().min(6, 'Password minimal 6 karakter').max(72, 'Password maksimal 72 karakter');
const nameSchema = z.string().trim().min(1, 'Nama tidak boleh kosong').max(100, 'Nama terlalu panjang');

export function AuthPage({ onNavigate }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, updatePassword, signInWithOAuth, session } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Check if user arrived via password reset link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true' && session) {
      setMode('reset');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email for all modes except reset
    if (mode !== 'reset') {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: emailResult.error.errors[0].message,
        });
        return;
      }
    }

    // Validate password for login, signup, reset
    if (mode === 'login' || mode === 'signup' || mode === 'reset') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: passwordResult.error.errors[0].message,
        });
        return;
      }
    }

    // Validate name for signup
    if (mode === 'signup') {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: nameResult.error.errors[0].message,
        });
        return;
      }
    }

    // Validate confirm password for reset
    if (mode === 'reset' && password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Password tidak cocok',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          let message = error.message;
          if (error.message.includes('Invalid login credentials')) {
            message = 'Email atau password salah';
          }
          toast({
            variant: 'destructive',
            title: 'Login Gagal',
            description: message,
          });
        } else {
          toast({
            title: 'Login Berhasil',
            description: 'Selamat datang kembali!',
          });
          onNavigate('home');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          let message = error.message;
          if (error.message.includes('already registered')) {
            message = 'Email sudah terdaftar. Silakan login.';
          }
          toast({
            variant: 'destructive',
            title: 'Pendaftaran Gagal',
            description: message,
          });
        } else {
          toast({
            title: 'Pendaftaran Berhasil',
            description: 'Akun Anda telah dibuat!',
          });
          onNavigate('home');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email.trim());
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
          });
        } else {
          toast({
            title: 'Email Terkirim',
            description: 'Cek inbox email Anda untuk link reset password.',
          });
          setMode('login');
        }
      } else if (mode === 'reset') {
        const { error } = await updatePassword(password);
        if (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message,
          });
        } else {
          toast({
            title: 'Password Diubah',
            description: 'Password Anda berhasil diperbarui!',
          });
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);
          onNavigate('home');
        }
      }
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan. Coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Masuk ke Akun';
      case 'signup': return 'Daftar Akun Baru';
      case 'forgot': return 'Lupa Password';
      case 'reset': return 'Reset Password';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <BarChart3 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Stock Analyzer</h1>
          <p className="text-muted-foreground mt-1">Analisis saham dengan AI</p>
        </div>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              {(mode === 'forgot' || mode === 'reset') && (
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => setMode('login')}
                  className="absolute left-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              {getTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      maxLength={100}
                    />
                  </div>
                </div>
              )}

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      maxLength={255}
                    />
                  </div>
                </div>
              )}

              {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {mode === 'reset' ? 'Password Baru' : 'Password'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      maxLength={72}
                    />
                  </div>
                </div>
              )}

              {mode === 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      maxLength={72}
                    />
                  </div>
                </div>
              )}

              {mode === 'forgot' && (
                <p className="text-sm text-muted-foreground">
                  Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' && 'Masuk'}
                {mode === 'signup' && 'Daftar'}
                {mode === 'forgot' && 'Kirim Link Reset'}
                {mode === 'reset' && 'Simpan Password Baru'}
              </Button>
            </form>

            {(mode === 'login' || mode === 'signup') && (
              <>
                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    atau
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    setIsGoogleLoading(true);
                    const { error } = await signInWithOAuth('google');
                    if (error) {
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: error.message,
                      });
                    }
                    setIsGoogleLoading(false);
                  }}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Chrome className="mr-2 h-4 w-4" />
                  )}
                  Lanjutkan dengan Google
                </Button>
              </>
            )}

            {mode === 'login' && (
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  className="text-sm text-muted-foreground p-0 h-auto"
                  onClick={() => setMode('forgot')}
                >
                  Lupa password?
                </Button>
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
                  <Button
                    variant="link"
                    className="px-1"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  >
                    {mode === 'login' ? 'Daftar' : 'Masuk'}
                  </Button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
