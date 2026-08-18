import { z } from 'zod';

export const createWithdrawalSchema = z.object({
  amount: z.coerce.number().positive(),
});

export const processWithdrawalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'PAID']),
});

export const listWithdrawalsQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PAID']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
