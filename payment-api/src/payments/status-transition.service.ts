import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['COMPLETED', 'FAILED', 'CANCELLED'],
  COMPLETED: [],
  FAILED: ['PENDING'],
  CANCELLED: [],
};

@Injectable()
export class StatusTransitionService {
  constructor(private readonly prisma: PrismaService) {}

  validateTransition(currentStatus: string, newStatus: string) {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async transition(id: string, newStatus: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new BadRequestException('Transaction not found');
    this.validateTransition(tx.status, newStatus);
    return this.prisma.transaction.update({
      where: { id },
      data: { status: newStatus as any },
    });
  }
}
