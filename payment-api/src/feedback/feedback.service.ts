import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface CreateFeedbackDto {
  name: string;
  email: string;
  walletAddress: string;
  network?: string;
  rating: number;
  likedMost: string;
  missingFeature: string;
  issues: string;
  recommend: string;
  improvements: string;
}

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateFeedbackDto, merchantId?: string) {
    return this.prisma.feedback.create({
      data: {
        name: dto.name,
        email: dto.email,
        walletAddress: dto.walletAddress,
        network: dto.network || 'Testnet',
        rating: dto.rating,
        likedMost: dto.likedMost,
        missingFeature: dto.missingFeature,
        issues: dto.issues,
        recommend: dto.recommend,
        improvements: dto.improvements,
        merchantId: merchantId || null,
      },
    });
  }

  findAll() {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  stats() {
    return this.prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });
  }
}
