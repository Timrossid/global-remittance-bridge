import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PaymentService.getTransaction and updateTransactionStatus', () => {
  const prisma = { transaction: { findUnique: jest.fn(), update: jest.fn() }, merchant: { findUnique: jest.fn() } } as any;
  const stellarService = {} as any;
  const notificationService = { sendEmail: jest.fn(), sendWebhook: jest.fn() } as any;
  const sorobanService = {} as any;

  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prisma },
        { provide: StellarService, useValue: stellarService },
        { provide: NotificationService, useValue: notificationService },
        { provide: SorobanService, useValue: sorobanService },
      ],
    }).compile();
    service = module.get(PaymentService);
    jest.clearAllMocks();
  });

  it('throws NotFoundException for missing transaction', async () => {
    prisma.transaction.findUnique.mockResolvedValue(null);
    await expect(service.getTransaction('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns transaction when found', async () => {
    prisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', amount: 100 });
    const result = await service.getTransaction('tx-1');
    expect(result.id).toBe('tx-1');
  });

  it('rejects invalid status values', async () => {
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1' });
    await expect(service.updateTransactionStatus('tx-1', 'BAD_STATUS' as any)).rejects.toThrow('Invalid status');
  });
});
