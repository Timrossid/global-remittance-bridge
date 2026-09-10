import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '../../src/common/audit/audit-log.service';
import { PrismaService } from '../../src/common/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  const prisma = { auditLog: { create: jest.fn() } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, AuditLogService],
    }).compile();
    service = module.get(AuditLogService);
  });

  afterEach(() => jest.clearAllMocks());

  it('persists audit log entry', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 'log-1' });
    await service.log('payment.created', 'user-1', { amount: 100 });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: { action: 'payment.created', userId: 'user-1', details: { amount: 100 } },
    });
  });

  it('swallows DB errors without throwing', async () => {
    prisma.auditLog.create.mockRejectedValue(new Error('db down'));
    await expect(service.log('payment.created', 'user-1', {})).resolves.toBeUndefined();
  });
});
