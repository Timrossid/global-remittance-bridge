import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';

describe('PaymentService.createPayment', () => {
  const prisma = { transaction: { create: vi.fn() } } as any;
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
    vi.clearAllMocks();
  });

  it('creates a PENDING payment record', async () => {
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1', status: 'PENDING' });
    const result = await service.createPayment({ amount: 50, currency: 'USDC', merchantId: 'm1', customerId: 'c1' });
    expect(result.status).toBe('PENDING');
  });
});
