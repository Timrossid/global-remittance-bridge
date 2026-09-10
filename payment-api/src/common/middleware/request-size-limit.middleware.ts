import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestSizeLimitMiddleware implements NestMiddleware {
  private readonly limit: number;

  constructor(limitBytes = 1_048_576) {
    this.limit = limitBytes;
  }

  use(req: Request, _res: Response, next: NextFunction) {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > this.limit) {
      throw new BadRequestException(`Request body too large. Maximum size is ${this.limit} bytes.`);
    }
    next();
  }
}
