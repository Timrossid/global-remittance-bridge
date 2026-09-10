import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRate(pair: string) {
    const rate = await this.prisma.exchangeRate.findUnique({ where: { pair } });
    if (!rate) throw new BadRequestException(`Exchange rate not found for ${pair}`);
    return rate;
  }

  async updateRate(pair: string, rate: number) {
    return this.prisma.exchangeRate.upsert({
      where: { pair },
      update: { rate },
      create: { pair, rate },
    });
  }

  async listRates() {
    return this.prisma.exchangeRate.findMany({ orderBy: { updatedAt: 'desc' } });
  }
}
