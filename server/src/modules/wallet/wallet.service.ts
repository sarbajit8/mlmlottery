import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/apiError.js';
import { logActivity } from '../../middleware/auditLog.js';
import { round2 } from '../../lib/money.js';

export async function getWallet(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
  if (!user) throw ApiError.notFound('User not found');
  return { balance: user.walletBalance };
}

export interface ListQuery {
  page: number;
  pageSize: number;
}

export async function listTransactions(userId: number, query: ListQuery) {
  const where = { userId };
  const [items, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.walletTransaction.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

/** Debit-on-request: immediately reserves the funds so two concurrent requests can't jointly overdraw. */
export async function requestWithdrawal(userId: number, amountInput: number) {
  const amount = round2(amountInput);

  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.user.updateMany({
      where: { id: userId, walletBalance: { gte: amount } },
      data: { walletBalance: { decrement: amount } },
    });
    if (updateResult.count !== 1) {
      throw ApiError.badRequest('Insufficient wallet balance for this withdrawal amount');
    }

    const updatedUser = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { walletBalance: true } });

    const withdrawal = await tx.withdrawalRequest.create({ data: { userId, amount, status: 'PENDING' } });

    await tx.walletTransaction.create({
      data: {
        userId,
        type: 'WITHDRAWAL',
        amount: amount.negated(),
        balanceAfter: updatedUser.walletBalance,
        refId: `WDR-${withdrawal.id}`,
        status: 'PENDING',
      },
    });

    await logActivity(tx, { actorId: userId, action: 'WITHDRAWAL_REQUEST', entityType: 'WithdrawalRequest', entityId: withdrawal.id });
    return withdrawal;
  });
}

export interface ListWithdrawalsQuery {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  page: number;
  pageSize: number;
}

export async function listWithdrawals(query: ListWithdrawalsQuery, scopedUserId?: number) {
  const where: Prisma.WithdrawalRequestWhereInput = { status: query.status, userId: scopedUserId };
  const [items, total] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { user: { select: { id: true, name: true, referralCode: true } } },
    }),
    prisma.withdrawalRequest.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function processWithdrawal(id: number, status: 'APPROVED' | 'REJECTED' | 'PAID', actorId: number) {
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawalRequest.findUnique({ where: { id } });
    if (!withdrawal) throw ApiError.notFound('Withdrawal request not found');

    const validTransitions: Record<string, string[]> = {
      PENDING: ['APPROVED', 'REJECTED'],
      APPROVED: ['PAID', 'REJECTED'],
    };
    if (!validTransitions[withdrawal.status]?.includes(status)) {
      throw ApiError.conflict(`Cannot move a ${withdrawal.status} withdrawal to ${status}`);
    }

    if (status === 'REJECTED') {
      const updatedUser = await tx.user.update({
        where: { id: withdrawal.userId },
        data: { walletBalance: { increment: withdrawal.amount } },
      });
      await tx.walletTransaction.create({
        data: {
          userId: withdrawal.userId,
          type: 'WITHDRAWAL',
          amount: withdrawal.amount,
          balanceAfter: updatedUser.walletBalance,
          refId: `WDR-${withdrawal.id}-REVERSED`,
          status: 'REVERSED',
        },
      });
    }

    const updated = await tx.withdrawalRequest.update({
      where: { id },
      data: { status, processedAt: new Date(), processedById: actorId },
    });

    await logActivity(tx, { actorId, action: 'WITHDRAWAL_PROCESS', entityType: 'WithdrawalRequest', entityId: id, metadata: { status } });
    return updated;
  });
}
