import type { Request, Response } from 'express';
import * as service from './wallet.service.js';
import { ApiError } from '../../lib/apiError.js';

export async function getWalletHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await service.getWallet(req.user.id));
}

export async function listTransactionsHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await service.listTransactions(req.user.id, req.query as unknown as service.ListQuery));
}

export async function requestWithdrawalHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  res.status(201).json(await service.requestWithdrawal(req.user.id, req.body.amount));
}

export async function listWithdrawalsHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const isAdmin = req.user.role === 'SUPER_ADMIN';
  const scopedUserId = isAdmin ? undefined : req.user.id;
  res.json(await service.listWithdrawals(req.query as unknown as service.ListWithdrawalsQuery, scopedUserId));
}

export async function processWithdrawalHandler(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized();
  const { id } = req.params as unknown as { id: number };
  res.json(await service.processWithdrawal(id, req.body.status, req.user.id));
}
