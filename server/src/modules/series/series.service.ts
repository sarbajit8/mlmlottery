import type { Series } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/apiError.js';
import { logActivity } from '../../middleware/auditLog.js';
import { round2 } from '../../lib/money.js';

function present(series: Series) {
  const semValue = round2(series.multiplier.times(series.basePrice));
  return { ...series, semValue };
}

export async function listSeries() {
  const items = await prisma.series.findMany({ orderBy: { createdAt: 'desc' } });
  return items.map(present);
}

export async function getSeries(id: number) {
  const series = await prisma.series.findUnique({ where: { id } });
  if (!series) throw ApiError.notFound('Series not found');
  return present(series);
}

export interface CreateSeriesInput {
  name: string;
  multiplier: number;
  basePrice: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export async function createSeries(input: CreateSeriesInput, actorId: number) {
  const series = await prisma.series.create({ data: input });
  await logActivity(prisma, { actorId, action: 'SERIES_CREATE', entityType: 'Series', entityId: series.id });
  return present(series);
}

export async function updateSeries(id: number, input: Partial<CreateSeriesInput>, actorId: number) {
  const existing = await prisma.series.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Series not found');
  const series = await prisma.series.update({ where: { id }, data: input });
  await logActivity(prisma, { actorId, action: 'SERIES_UPDATE', entityType: 'Series', entityId: id });
  return present(series);
}

export async function deleteSeries(id: number, actorId: number) {
  const usageCount = await prisma.ticketBatch.count({ where: { seriesId: id } });
  if (usageCount > 0) throw ApiError.conflict('Cannot delete a series that already has ticket batches');
  await prisma.series.delete({ where: { id } });
  await logActivity(prisma, { actorId, action: 'SERIES_DELETE', entityType: 'Series', entityId: id });
}
