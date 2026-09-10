import { Test, TestingModule } from '@nestjs/testing';
import { CorrelationIdMiddleware } from '../../../src/common/middleware/correlation-id.middleware';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ providers: [CorrelationIdMiddleware] }).compile();
    middleware = module.get(CorrelationIdMiddleware);
    next = jest.fn();
    req = { headers: {}, socket: { remoteAddress: '127.0.0.1' } };
    res = {};
  });

  it('generates a new correlation ID when header is absent', () => {
    middleware.use(req, res, next);
    expect(req.headers['x-correlation-id']).toBeDefined();
    expect(req.correlationId).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it('reuses existing x-correlation-id header', () => {
    req.headers['x-correlation-id'] = 'req-abc';
    middleware.use(req, res, next);
    expect(req.headers['x-correlation-id']).toBe('req-abc');
    expect(req.correlationId).toBe('req-abc');
  });
});
