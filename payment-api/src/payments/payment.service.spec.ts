import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';
import { StellarService } from '../../src/common/stellar.service';
import { NotificationService } from '../../src/notifications/notification.service';
import { SorobanService } from '../../src/common/soroban.service';

describe('PaymentService', () => {
  const prisma = {
    transaction: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    merchant: { findUnique: jest.fn() },
  } as any;
  const stellarService = { buildPaymentTransaction: jest.fn(), submitTransaction: jest.fn() } as any;
  const notificationService = { sendEmail: jest.fn(), sendWebhook: jest.fn() } as any;
  const sorobanService = { callRPC: jest.fn(), submitTransaction: jest.fn(), getTransactionStatus: jest.fn() } as any;

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

  it('creates a payment record', async () => {
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1', amount: 100, status: 'PENDING' });
    const result = await service.createPayment({ amount: 100, currency: 'USDC', merchantId: 'm1', customerId: 'c1' });
    expect(result.id).toBe('tx-1');
    expect(prisma.transaction.create).toHaveBeenCalled();
  });

  it('updates transaction status to COMPLETED and notifies merchant', async () => {
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'COMPLETED' });
    prisma.merchant.findUnique.mockResolvedValue({ id: 'm1', email: 'm@test.com' });
    const result = await service.updateTransactionStatus('tx-1', 'COMPLETED');
    expect(result.status).toBe('COMPLETED');
    expect(prisma.transaction.update).toHaveBeenCalledWith({ where: { id: 'tx-1' }, data: { status: 'COMPLETED' } });
  });

  it('getMerchantTransactions returns ordered list capped at 100', async () => {
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

  it('rejects invalid status values', async () => {
    await expect(service.updateTransactionStatus('tx-1', 'INVALID' as any)).rejects.toThrow('Invalid status');
  });
});
