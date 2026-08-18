import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSiteName } from '@/hooks/useSiteName';
import { isAdminPanelRole } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import {
  IconCart,
  IconCheck,
  IconClipboard,
  IconLayers,
  IconNetwork,
  IconTicket,
  IconTrophy,
  IconUserPlus,
  IconWallet,
  IconWhatsapp,
} from '@/components/ui/icons';

const steps = [
  {
    icon: IconCart,
    title: 'Make Sales',
    description: 'Search available tickets by draw slot and series, build a cart, and complete the sale in seconds — with a WhatsApp receipt sent instantly.',
  },
  {
    icon: IconWallet,
    title: 'Earn Commission',
    description: "Every sale in your downline pays you a percentage, instantly credited to your wallet — up to the levels your admin configures.",
  },
  {
    icon: IconNetwork,
    title: 'Grow Your Team',
    description: 'Share your personal referral link or QR code. Every agent you recruit — and everyone they recruit — adds to your earning potential.',
  },
];

const features = [
  { icon: IconClipboard, title: 'Multiple Daily Draws', description: 'Admin-configured draw slots with live status — open, closed, or drawn — updating automatically through the day.' },
  { icon: IconLayers, title: 'SEM Multiplier Series', description: 'Flexible ticket tiers (3x, 5x, 10x and beyond) so pricing and payouts scale exactly how your business needs.' },
  { icon: IconNetwork, title: 'Unilevel MLM Engine', description: 'Unlimited-width, admin-configured-depth commission structure — transparent, auditable, and paid instantly on every sale.' },
  { icon: IconTicket, title: 'Bulk Ticket Generation', description: 'Generate thousands of tickets in seconds with collision-free numbering and a searchable, exportable ticket grid.' },
  { icon: IconTrophy, title: 'Live Results & Winners', description: 'Declare winners manually or by random draw, with prize tracking tied straight back to the original sale.' },
  { icon: IconWhatsapp, title: 'Instant WhatsApp Receipts', description: 'Every completed sale generates a ready-to-send WhatsApp receipt for the customer — no extra app required.' },
];

function Nav({ registerHref }: { registerHref: string }) {
  const { companyName, initials } = useSiteName();
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/20">
          {initials}
        </div>
        <span className="text-sm font-semibold text-slate-100">{companyName}</span>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/login">
          <Button variant="ghost" size="sm">
            Login
          </Button>
        </Link>
        <Link to={registerHref}>
          <Button size="sm">Register</Button>
        </Link>
      </div>
    </header>
  );
}

export function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { companyName } = useSiteName();
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const registerHref = ref ? `/join?ref=${ref}` : '/join';

  if (isAuthenticated) {
    return <Navigate to={isAdminPanelRole(user?.role) ? '/admin' : '/agent'} replace />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-950">
      <div className="pointer-events-none fixed -top-40 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-160px] right-[-100px] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <Nav registerHref={registerHref} />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-12 text-center sm:pt-20">
        {ref && (
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs text-emerald-300">
            <IconUserPlus className="h-3.5 w-3.5" />
            You've been invited by referral code <span className="font-mono font-semibold">{ref}</span>
          </div>
        )}
        <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-6xl">
          <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Build a Team.</span>
          <br className="hidden sm:block" /> Earn Every Level Down.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
          A complete lottery platform with a built-in unilevel MLM engine. Participate across daily draw slots,
          recruit agents beneath you, and earn transparent, instant commission on every sale in your downline.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to={registerHref}>
            <Button size="lg" icon={<IconUserPlus className="h-4.5 w-4.5" />}>
              Register as an Agent
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary">
              I already have an account
            </Button>
          </Link>
        </div>
        {!ref && (
          <p className="mt-4 text-xs text-slate-600">Have a sponsor's referral code? You can enter it on the registration page — or register without one.</p>
        )}
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-amber-400/80">How It Works</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">
                <s.icon className="h-5 w-5" />
              </div>
              <p className="mb-1.5 text-xs font-medium text-slate-600">Step {i + 1}</p>
              <h3 className="mb-2 text-base font-semibold text-slate-100">{s.title}</h3>
              <p className="text-sm text-slate-400">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-emerald-400/80">Platform Features</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-slate-100">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10 p-10 text-center">
          <h2 className="text-2xl font-semibold text-slate-50 sm:text-3xl">Ready to start selling and earning?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            Register with or without a sponsor's referral code, or sign in if you're already part of the team.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={registerHref}>
              <Button icon={<IconCheck className="h-4 w-4" />}>Register Now</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8 px-6 py-8 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} {companyName}. All rights reserved.
      </footer>
    </div>
  );
}
