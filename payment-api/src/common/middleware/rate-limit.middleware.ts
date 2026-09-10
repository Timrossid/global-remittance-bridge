import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
  userId?: string;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly userMaxRequests: number;

  constructor(
    windowMs = 60000,
    maxRequests = 100,
    userMaxRequests = 200,
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.userMaxRequests = userMaxRequests;
  }

  use(req: Request, _res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = (req as any).user?.userId;
    const key = userId ? `user:${userId}` : `ip:${ip}`;
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
        userId,
      });
      return next();
    }

    entry.count += 1;
    const limit = userId ? this.userMaxRequests : this.maxRequests;

    if (entry.count > limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(limit));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', new Date(entry.resetAt).toISOString());
      throw new BadRequestException(
        `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      );
    }

    res.set('X-RateLimit-Limit', String(limit));
    res.set('X-RateLimit-Remaining', String(Math.max(0, limit - entry.count)));
    res.set('X-RateLimit-Reset', new Date(entry.resetAt).toISOString());

    next();
  }
}
