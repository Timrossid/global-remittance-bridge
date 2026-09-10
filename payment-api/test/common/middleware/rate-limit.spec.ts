import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitMiddleware } from '../../../src/common/middleware/rate-limit.middleware';
import { BadRequestException } from '@nestjs/common';

describe('RateLimitMiddleware', () => {
  let middleware: RateLimitMiddleware;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ providers: [RateLimitMiddleware] }).compile();
    middleware = module.get(RateLimitMiddleware);
    next = jest.fn();
    req = { ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } };
    res = {};
  });

  it('allows requests within limit', () => {
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('throws after exceeding limit', () => {
    for (let i = 0; i < 100; i++) middleware.use(req, res, next);
    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });
});
