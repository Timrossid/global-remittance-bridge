import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly windowMs = 30000;

  generateSecret(): string {
    return crypto.randomBytes(20).toString('base32');
  }

  generateTOTP(secret: string): string {
    const time = Math.floor(Date.now() / 30000);
    const buffer = Buffer.from(secret.padEnd(32, '='), 'base32');
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(time, 4);

    const hmac = crypto.createHmac('sha1', buffer);
    hmac.update(timeBuffer);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const code = ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    return String((code % 1000000)).padStart(6, '0');
  }

  verifyTOTP(token: string, secret: string): boolean {
    const current = this.generateTOTP(secret);
    if (token === current) return true;

    const previous = this.generateTOTP(secret);
    if (token === previous) return true;

    return false;
  }
}
