import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet';
import { mlmApi } from '@/api/mlm';
import { apiErrorMessage } from '@/api/axiosClient';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { toast } from '@/store/toastStore';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { IconWallet } from '@/components/ui/icons';
import type { CommissionLedgerEntry, WalletTransaction } from '@/types/api';

export function MyCommissionsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'statement' | 'transactions'>('statement');
  const [page, setPage] = useState(1);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: wallet } = useQuery({ queryKey: ['wallet'], queryFn: walletApi.get });
  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ['my-commissions', page],
    queryFn: () => mlmApi.listCommissions({ page, pageSize: 20 }),
    enabled: tab === 'statement',
  });
  const { data: txns, isLoading: txnsLoading } = useQuery({
    queryKey: ['my-wallet-txns', page],
    queryFn: () => walletApi.transactions({ page, pageSize: 20 }),
    enabled: tab === 'transactions',
  });
  const { data: withdrawals } = useQuery({ queryKey: ['my-withdrawals'], queryFn: () => walletApi.listWithdrawals({ pageSize: 5 }) });

  const withdrawMut = useMutation({
    mutationFn: () => walletApi.requestWithdrawal(Number(amount)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['my-withdrawals'] });
      toast.success('Withdrawal requested');
      setWithdrawOpen(false);
      setAmount('');
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const ledgerColumns: Column<CommissionLedgerEntry>[] = [
    { key: 'date', header: 'Date', render: (r) => formatDateTime(r.createdAt) },
    { key: 'from', header: 'From', render: (r) => r.sourceAgent.name },
    { key: 'level', header: 'Level', render: (r) => r.levelNumber },
    { key: 'ticket', header: 'Ticket', render: (r) => <span className="font-mono text-xs">{r.ticket.ticketNumber}</span> },
    { key: 'pct', header: '%', render: (r) => `${Number(r.percentageApplied)}%` },
    { key: 'amount', header: 'Commission', render: (r) => <span className="font-semibold text-emerald-300">{formatCurrency(r.commissionAmount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const txnColumns: Column<WalletTransaction>[] = [
    { key: 'date', header: 'Date', render: (r) => formatDateTime(r.createdAt) },
    { key: 'type', header: 'Type', render: (r) => r.type },
    { key: 'amount', header: 'Amount', render: (r) => <span className={Number(r.amount) >= 0 ? 'text-emerald-300' : 'text-red-300'}>{formatCurrency(r.amount)}</span> },
    { key: 'balance', header: 'Balance After', render: (r) => formatCurrency(r.balanceAfter) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="My Commissions & Wallet"
        description="Track your commission earnings and manage withdrawals."
        actions={
          <Button accent="emerald" icon={<IconWallet className="h-4 w-4" />} onClick={() => setWithdrawOpen(true)}>
            Request Withdrawal
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Available Balance" value={formatCurrency(wallet?.balance ?? 0)} icon={<IconWallet className="h-5 w-5" />} accent="emerald" />
        <Card className="p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Recent Withdrawals</p>
          <div className="space-y-1.5">
            {withdrawals?.items.slice(0, 3).map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{formatCurrency(w.amount)}</span>
                <StatusBadge status={w.status} />
              </div>
            ))}
            {!withdrawals?.items.length && <p className="text-xs text-slate-500">No withdrawal requests yet.</p>}
          </div>
        </Card>
      </div>

      <div className="mb-4 flex gap-2">
        <Button size="sm" variant={tab === 'statement' ? 'primary' : 'secondary'} accent="emerald" onClick={() => { setTab('statement'); setPage(1); }}>
          Commission Statement
        </Button>
        <Button size="sm" variant={tab === 'transactions' ? 'primary' : 'secondary'} accent="emerald" onClick={() => { setTab('transactions'); setPage(1); }}>
          Wallet Transactions
        </Button>
      </div>

      <Card>
        {tab === 'statement' ? (
          <DataTable columns={ledgerColumns} data={ledger?.items ?? []} rowKey={(r) => r.id} loading={ledgerLoading} total={ledger?.total} page={page} pageSize={20} onPageChange={setPage} emptyTitle="No commissions yet" accent="emerald" />
        ) : (
          <DataTable columns={txnColumns} data={txns?.items ?? []} rowKey={(r) => r.id} loading={txnsLoading} total={txns?.total} page={page} pageSize={20} onPageChange={setPage} emptyTitle="No transactions yet" accent="emerald" />
        )}
      </Card>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Request Withdrawal">
        <form onSubmit={(e) => { e.preventDefault(); withdrawMut.mutate(); }} className="space-y-4">
          <p className="text-sm text-slate-400">
            Available balance: <span className="font-semibold text-emerald-300">{formatCurrency(wallet?.balance ?? 0)}</span>
          </p>
          <FormField label="Amount" required>
            <Input type="number" min="1" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormField>
          {error && <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
          <Button type="submit" accent="emerald" className="w-full" loading={withdrawMut.isPending}>
            Submit Request
          </Button>
        </form>
      </Modal>
    </div>
  );
}
