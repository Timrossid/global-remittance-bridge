import { Injectable, NestMiddleware, OnModuleInit } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitCleanupMiddleware implements NestMiddleware, OnModuleInit {
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  onModuleInit() {
    setInterval(() => this.cleanup(), 60000);
  }

  use(req: Request, _res: Response, next: NextFunction) {
    next();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}
