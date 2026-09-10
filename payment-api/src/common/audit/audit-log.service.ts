import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(action: string, userId: string | undefined, details: Record<string, unknown>) {
    try {
      await this.prisma.auditLog.create({
        data: { action, userId, details },
      });
    } catch (err) {
      this.logger.warn(`[audit] failed to persist log: ${(err as Error).message}`);
    }
  }
}
