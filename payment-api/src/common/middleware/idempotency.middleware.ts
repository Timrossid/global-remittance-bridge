import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private readonly ttlMs = 86400000;

  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (req.method !== 'POST') {
      return next();
    }

    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (!idempotencyKey) {
      return next();
    }

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, response FROM "IdempotencyKey"
      WHERE key = ${idempotencyKey}
        AND expires_at > NOW()
    `;

    if (existing.length > 0) {
      if (existing[0].response) {
        throw new BadRequestException({
          message: 'Duplicate request',
          idempotencyKey,
          previousResponse: existing[0].response,
        });
      }
    }

    (req as any).idempotencyKey = idempotencyKey;
    next();
  }
}
