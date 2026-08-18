import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

export interface ListActivityQuery {
  actorId?: number;
  entityType?: string;
  from?: Date;
  to?: Date;
  page: number;
  pageSize: number;
}

export async function listActivityLogs(query: ListActivityQuery) {
  const where: Prisma.AuditLogWhereInput = {
    actorId: query.actorId,
    entityType: query.entityType,
    createdAt: query.from || query.to ? { gte: query.from, lte: query.to } : undefined,
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { actor: { select: { id: true, name: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export const ROLE_PERMISSIONS_REFERENCE = [
  {
    role: 'SUPER_ADMIN',
    panel: 'Admin',
    description: 'Full control of the platform. Creates agents directly, configures lottery/MLM settings, and is the root of the MLM tree — not a commission-earning node except as the configured rollup wallet.',
  },
  {
    role: 'AGENT',
    panel: 'Agent',
    description: 'Sells tickets, recruits new agents beneath themselves via a referral link, and earns multi-level commission from their entire downline\'s sales.',
  },
] as const;

export async function getAppSetting(key: string) {
  return prisma.appSetting.findUnique({ where: { key } });
}

export async function listAppSettings() {
  return prisma.appSetting.findMany();
}

export async function upsertAppSetting(key: string, value: unknown) {
  return prisma.appSetting.upsert({
    where: { key },
    create: { key, value: value as Prisma.InputJsonValue },
    update: { value: value as Prisma.InputJsonValue },
  });
}
