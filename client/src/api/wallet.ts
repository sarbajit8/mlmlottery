import { axiosClient } from './axiosClient';
import type { Paginated, WalletTransaction, WithdrawalRequest, WithdrawalStatus } from '@/types/api';

export const walletApi = {
  get: () => axiosClient.get<{ balance: string }>('/wallet').then((r) => r.data),
  transactions: (params: { page?: number; pageSize?: number }) =>
    axiosClient.get<Paginated<WalletTransaction>>('/wallet/transactions', { params }).then((r) => r.data),
  requestWithdrawal: (amount: number) => axiosClient.post<WithdrawalRequest>('/wallet/withdrawals', { amount }).then((r) => r.data),
  listWithdrawals: (params: { status?: WithdrawalStatus; page?: number; pageSize?: number }) =>
    axiosClient.get<Paginated<WithdrawalRequest>>('/wallet/withdrawals', { params }).then((r) => r.data),
  processWithdrawal: (id: number, status: 'APPROVED' | 'REJECTED' | 'PAID') =>
    axiosClient.put<WithdrawalRequest>(`/wallet/withdrawals/${id}`, { status }).then((r) => r.data),
};
