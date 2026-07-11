import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MerchantService {
  constructor(private prisma: PrismaService) {}

  async createMerchant(data: Prisma.MerchantCreateInput) {
    return this.prisma.merchant.create({ data });
  }

  async getMerchantById(id: string) {
    return this.prisma.merchant.findUnique({ where: { id } });
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
    const pendingSettlements = transactions.filter(tx => tx.status === 'PENDING').length;
    const activeCustomers = await this.prisma.customer.count({
      where: { transactions: { some: { merchantId } } }
    });

    return {
      totalVolume,
      pendingSettlements,
      activeCustomers,
    };
  }
}
