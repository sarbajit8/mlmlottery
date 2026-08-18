import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  createWithdrawalSchema,
  idParamSchema,
  listTransactionsQuerySchema,
  listWithdrawalsQuerySchema,
  processWithdrawalSchema,
} from './wallet.schema.js';
import {
  getWalletHandler,
  listTransactionsHandler,
  listWithdrawalsHandler,
  processWithdrawalHandler,
  requestWithdrawalHandler,
} from './wallet.controller.js';

export const walletRouter = Router();

walletRouter.use(requireAuth);

const adminRoles = ['SUPER_ADMIN'] as const;

walletRouter.get('/', asyncHandler(getWalletHandler));
walletRouter.get('/transactions', validate({ query: listTransactionsQuerySchema }), asyncHandler(listTransactionsHandler));
walletRouter.post('/withdrawals', validate({ body: createWithdrawalSchema }), asyncHandler(requestWithdrawalHandler));
walletRouter.get('/withdrawals', validate({ query: listWithdrawalsQuerySchema }), asyncHandler(listWithdrawalsHandler));
walletRouter.put(
  '/withdrawals/:id',
  requireRole(...adminRoles),
  validate({ params: idParamSchema, body: processWithdrawalSchema }),
  asyncHandler(processWithdrawalHandler),
);
