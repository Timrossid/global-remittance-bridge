import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from '../../src/common/audit/audit-log.service';
import { PrismaService } from '../../src/common/prisma.service';

describe('AuditLogService', () => {
  const prisma = { auditLog: { create: vi.fn() } } as any;
  let service: AuditLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, AuditLogService],
    }).compile();
    service = module.get(AuditLogService);
    vi.clearAllMocks();
  });

  it('persists an audit log entry', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 'log-1' });
    await service.log('tx.created', 'user-1', { txId: 'tx-1' });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: { action: 'tx.created', userId: 'user-1', details: { txId: 'tx-1' } },
    });
  });

  it('swallows DB errors without throwing', async () => {
    prisma.auditLog.create.mockRejectedValue(new Error('db down'));
    await expect(service.log('tx.created', 'user-1', {})).resolves.toBeUndefined();
  });
});
