import { Test, TestingModule } from '@nestjs/testing';
import { RequestSizeLimitMiddleware } from '../../../src/common/middleware/request-size-limit.middleware';
import { BadRequestException } from '@nestjs/common';

describe('RequestSizeLimitMiddleware', () => {
  let middleware: RequestSizeLimitMiddleware;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ providers: [RequestSizeLimitMiddleware] }).compile();
    middleware = module.get(RequestSizeLimitMiddleware);
    next = jest.fn();
    req = { headers: {} };
    res = {};
  });

  it('allows requests under the limit', () => {
    req.headers['content-length'] = '50000';
    middleware.use(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects requests over the limit', () => {
    req.headers['content-length'] = '999999999';
    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });
});
