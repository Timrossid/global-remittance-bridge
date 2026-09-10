import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface AuditLogEntry {
  action: string;
  userId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          userId: entry.userId,
          details: entry.details,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
