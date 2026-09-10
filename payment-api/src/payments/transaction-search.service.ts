import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(merchantId: string, query: { status?: string; currency?: string; startDate?: Date; endDate?: Date; minAmount?: number; maxAmount?: number; cursor?: string; limit = 20 }) {
    const where: Prisma.TransactionWhereInput = {
      merchantId,
      ...(query.status && { status: query.status as any }),
      ...(query.currency && { currency: query.currency }),
      ...(query.startDate && query.endDate && {
        createdAt: { gte: query.startDate, lte: query.endDate },
      }),
      ...(query.minAmount !== undefined && { amount: { ...((query as any).amount || {}), gte: query.minAmount } }),
      ...(query.maxAmount !== undefined && { amount: { ...((query as any).amount || {}), lte: query.maxAmount } }),
      ...(query.cursor && { id: { lt: query.cursor } }),
    };

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        stellarTxHash: true,
        createdAt: true,
      },
    });

    const hasMore = transactions.length > query.limit;
    if (hasMore) transactions.pop();

    return {
      data: transactions,
      nextCursor: hasMore ? transactions[transactions.length - 1]?.id : null,
    };
  }
}
