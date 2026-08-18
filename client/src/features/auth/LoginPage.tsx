import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { apiErrorMessage } from '@/api/axiosClient';
import { useAuthStore, isAdminPanelRole } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { toast } from '@/store/toastStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      setAuth({ accessToken: res.accessToken, refreshToken: res.refreshToken }, res.user);
      toast.success(`Welcome back, ${res.user.name}`);
      navigate(isAdminPanelRole(res.user.role) ? '/admin' : '/agent', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-100px] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-lg font-bold text-neutral-950 shadow-lg shadow-amber-500/25">
            BC
          </div>
          <h1 className="text-lg font-semibold text-slate-50">Bhutan Cherapunji Lottery</h1>
          <p className="mt-1 text-xs text-slate-500">Sign in to your Admin or Agent account</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.02] p-6 shadow-2xl backdrop-blur">
          <FormField label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
          </FormField>
          <FormField label="Password">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </FormField>
          {error && <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Recruited by an agent? Use the referral link they shared with you to join.
        </p>
      </div>
    </div>
  );
}
