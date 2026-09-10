import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';
import { StellarService } from '../../src/common/stellar.service';
import { NotificationService } from '../../src/notifications/notification.service';
import { SorobanService } from '../../src/common/soroban.service';

describe('PaymentService.initiateStellarTransfer', () => {
  const prisma = {
    merchant: { findUnique: jest.fn() },
    transaction: { create: jest.fn(), update: jest.fn() },
  } as any;
  const stellarService = { buildPaymentTransaction: jest.fn(), submitTransaction: jest.fn() } as any;
  const notificationService = { sendEmail: jest.fn() } as any;
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

  it('throws when STELLAR_SECRET is missing', async () => {
    delete process.env.STELLAR_SECRET;
    await expect(service.initiateStellarTransfer('m1', 'c1', 10)).rejects.toThrow('STELLAR_SECRET is not configured');
  });

  it('marks transaction FAILED on Stellar error', async () => {
    process.env.STELLAR_SECRET = 'S'.repeat(56);
    prisma.merchant.findUnique.mockResolvedValue({ id: 'm1', walletAddress: 'GMER', email: 'm@test.com' });
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1', status: 'PENDING' });
    stellarService.buildPaymentTransaction.mockRejectedValue(new Error('Horizon error'));
    await expect(service.initiateStellarTransfer('m1', 'c1', 10)).rejects.toThrow('Horizon error');
    expect(prisma.transaction.update).toHaveBeenCalledWith({ where: { id: 'tx-1' }, data: { status: 'FAILED' } });
  });

  it('sends notification email on success', async () => {
    process.env.STELLAR_SECRET = 'S'.repeat(56);
    prisma.merchant.findUnique.mockResolvedValue({ id: 'm1', walletAddress: 'GMER', email: 'm@test.com' });
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1', status: 'PENDING' });
    stellarService.buildPaymentTransaction.mockResolvedValue({});
    stellarService.submitTransaction.mockResolvedValue('hash123');
    prisma.transaction.update.mockResolvedValue({});
    const result = await service.initiateStellarTransfer('m1', 'c1', 10);
    expect(notificationService.sendEmail).toHaveBeenCalledWith('m@test.com', 'Payment Received');
    expect(result.txHash).toBe('hash123');
  });
});
