import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';
import { StellarService } from '../../src/common/stellar.service';
import { NotificationService } from '../../src/notifications/notification.service';
import { SorobanService } from '../../src/common/soroban.service';

describe('PaymentService.getMerchantTransactions', () => {
  const prisma = { transaction: { findMany: jest.fn() } } as any;
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

  it('returns ordered list capped at 100', async () => {
    const txs = Array.from({ length: 100 }, (_, i) => ({ id: `tx-${i}` })).reverse();
    prisma.transaction.findMany.mockResolvedValue(txs);
    const result = await service.getMerchantTransactions('m1');
    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: { merchantId: 'm1' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    expect(result).toHaveLength(100);
  });
});
