import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';

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

  it('returns transactions ordered by createdAt desc with cap of 100', async () => {
    prisma.transaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);
    const result = await service.getMerchantTransactions('m1');
    expect(prisma.transaction.findMany).toHaveBeenCalledWith({
      where: { merchantId: 'm1' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    expect(result).toHaveLength(1);
  });
});
