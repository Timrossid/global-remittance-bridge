import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MerchantService {
  constructor(private prisma: PrismaService) {}

  async createMerchant(data: Prisma.MerchantCreateInput) {
    return this.prisma.merchant.create({ data });
  }

  async getMerchantById(id: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async updateKycStatus(id: string, status: string) {
    return this.prisma.merchant.update({
      where: { id },
      data: { kycStatus: status },
    });
  }

  async getStats(merchantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { merchantId },
    });

    const totalVolume = transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
    const pendingSettlements = transactions.filter((tx) => tx.status === 'PENDING').length;
    const completedCount = transactions.filter((tx) => tx.status === 'COMPLETED').length;

    const activeCustomers = await this.prisma.customer.count({
      where: { transactions: { some: { merchantId } } },
    });

    return {
      totalVolume,
      pendingSettlements,
      completedCount,
      activeCustomers,
      totalTransactions: transactions.length,
    };
  }

  async getTransactions(merchantId: string) {
    return this.prisma.transaction.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        stellarTxHash: true,
        senderId: true,
        receiverId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getAnalytics(merchantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        status: true,
        amount: true,
        currency: true,
        createdAt: true,
      },
    });

    const now = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });

    const dailyMap = new Map<string, { volume: number; count: number }>();
    days.forEach((d) => dailyMap.set(d, { volume: 0, count: 0 }));

    transactions.forEach((tx) => {
      const day = tx.createdAt.toISOString().slice(0, 10);
      if (dailyMap.has(day)) {
        const entry = dailyMap.get(day)!;
        entry.volume += Number(tx.amount);
        entry.count += 1;
      }
    });

    const dailyVolume = days.map((day) => ({
      day,
      volume: dailyMap.get(day)!.volume,
      count: dailyMap.get(day)!.count,
    }));

    const statusCounts = transactions.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {});

    const currencyCounts = transactions.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.currency] = (acc[tx.currency] || 0) + 1;
      return acc;
    }, {});

    return {
      dailyVolume,
      statusCounts,
      currencyCounts,
      totalAnalyzed: transactions.length,
    };
  }
}
