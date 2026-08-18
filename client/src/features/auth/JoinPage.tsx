import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { apiErrorMessage } from '@/api/axiosClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { IconCheck } from '@/components/ui/icons';

export function JoinPage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', whatsapp: '', password: '', referralCode: params.get('ref') ?? '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.registerAgent({ ...form, referralCode: form.referralCode || undefined });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not complete registration'));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
        <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <IconCheck className="h-6 w-6" />
          </div>
          <h1 className="text-base font-semibold text-slate-100">Registration submitted</h1>
          <p className="mt-1 text-sm text-slate-400">Your account is pending admin approval. You'll be able to log in and start selling once an admin approves it.</p>
          <Link to="/login">
            <Button accent="emerald" variant="secondary" className="mt-5 w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold text-neutral-950 shadow-lg shadow-emerald-500/25">
            BC
          </div>
          <h1 className="text-lg font-semibold text-slate-50">Join as an Agent</h1>
          <p className="mt-1 text-xs text-slate-500">Create your agent account — approval from an admin is required before you can log in.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-white/8 bg-white/[0.02] p-6 shadow-2xl">
          <FormField label="Full name">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Email">
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>
          <FormField label="Mobile">
            <Input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </FormField>
          <FormField label="WhatsApp (optional)">
            <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </FormField>
          <FormField label="Password">
            <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>
          <FormField label="Referral Code (optional)" hint="Have a sponsor's code? Enter it here. Leave blank to register directly under the platform admin.">
            <Input value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })} placeholder="e.g. AGT00001" className="font-mono" />
          </FormField>
          {error && <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
          <Button type="submit" accent="emerald" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}
