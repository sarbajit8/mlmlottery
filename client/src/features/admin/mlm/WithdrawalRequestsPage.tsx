import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet';
import { apiErrorMessage } from '@/api/axiosClient';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { toast } from '@/store/toastStore';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { WithdrawalRequest, WithdrawalStatus } from '@/types/api';

export function WithdrawalRequestsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<WithdrawalStatus | ''>('PENDING');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['withdrawals', status, page],
    queryFn: () => walletApi.listWithdrawals({ status: status || undefined, page, pageSize: 20 }),
  });

  const processMut = useMutation({
    mutationFn: (vars: { id: number; status: 'APPROVED' | 'REJECTED' | 'PAID' }) => walletApi.processWithdrawal(vars.id, vars.status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal updated');
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  const columns: Column<WithdrawalRequest>[] = [
    { key: 'user', header: 'Agent', render: (r) => <span className="font-medium text-slate-100">{r.user?.name}</span> },
    { key: 'code', header: 'Referral Code', render: (r) => <span className="font-mono text-xs">{r.user?.referralCode}</span> },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold text-emerald-300">{formatCurrency(r.amount)}</span> },
    { key: 'requested', header: 'Requested At', render: (r) => formatDateTime(r.requestedAt) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1.5">
          {r.status === 'PENDING' && (
            <>
              <Button size="sm" onClick={() => processMut.mutate({ id: r.id, status: 'APPROVED' })}>
                Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => processMut.mutate({ id: r.id, status: 'REJECTED' })}>
                Reject
              </Button>
            </>
          )}
          {r.status === 'APPROVED' && (
            <Button size="sm" onClick={() => processMut.mutate({ id: r.id, status: 'PAID' })}>
              Mark Paid
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Withdrawal Requests"
        description="Approve, reject, or mark agent withdrawal requests as paid."
        actions={
          <Select value={status} onChange={(e) => { setStatus(e.target.value as WithdrawalStatus | ''); setPage(1); }} className="max-w-40">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAID">Paid</option>
          </Select>
        }
      />
      <Card>
        <DataTable columns={columns} data={data?.items ?? []} rowKey={(r) => r.id} loading={isLoading} total={data?.total} page={page} pageSize={20} onPageChange={setPage} emptyTitle="No withdrawal requests" />
      </Card>
    </div>
  );
}
