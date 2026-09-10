import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NotificationPreferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    return this.prisma.notificationPreference.findUnique({ where: { userId } });
  }

  async upsert(userId: string, data: { emailEnabled?: boolean; smsEnabled?: boolean; webhookOnly?: boolean }) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
