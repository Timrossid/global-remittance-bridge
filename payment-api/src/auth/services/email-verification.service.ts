import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private readonly tokenExpiryMs = 86400000;

  constructor(private readonly prisma: PrismaService) {}

  async createVerificationToken(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiryMs);

    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return token;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date() || verificationToken.used) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      }),
    ]);

    return true;
  }
}
