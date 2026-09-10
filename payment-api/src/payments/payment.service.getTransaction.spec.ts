import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { StellarService } from '../../src/common/stellar.service';
import { NotificationService } from '../../src/notifications/notification.service';
import { SorobanService } from '../../src/common/soroban.service';

describe('PaymentService.getTransaction', () => {
  const prisma = { transaction: { findUnique: jest.fn() } } as any;
  const stellarService = {} as any;
  const notificationService = {} as any;
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
});
