import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportTransactions(merchantId: string, options: ExportOptions) {
    const where: any = { merchantId };

    if (options.startDate && options.endDate) {
      where.createdAt = {
        gte: options.startDate,
        lte: options.endDate,
      };
    }

    if (options.status) {
      where.status = options.status;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        stellarTxHash: true,
        createdAt: true,
      },
    });

    switch (options.format) {
      case 'csv':
        return this.toCsv(transactions);
      case 'json':
        return JSON.stringify(transactions, null, 2);
      case 'xlsx':
        return this.toXlsx(transactions);
      default:
        throw new BadRequestException(`Unsupported format: ${options.format}`);
    }
  }

  private toCsv(transactions: any[]): string {
    if (transactions.length === 0) return 'id,amount,currency,status,stellarTxHash,createdAt\n';
    const headers = Object.keys(transactions[0]).join(',');
    const rows = transactions.map((tx) =>
      Object.values(tx)
        .map((v) => (v instanceof Date ? v.toISOString() : v))
        .join(','),
    );
    return [headers, ...rows].join('\n') + '\n';
  }

  private toXlsx(transactions: any[]): string {
    return JSON.stringify(transactions);
  }
}
