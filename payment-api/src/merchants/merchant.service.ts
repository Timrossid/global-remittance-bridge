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
}
