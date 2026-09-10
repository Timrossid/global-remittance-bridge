import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';
import { StellarService } from '../../src/common/stellar.service';
import { NotificationService } from '../../src/notifications/notification.service';
import { SorobanService } from '../../src/common/soroban.service';

describe('PaymentService.updateTransactionStatus', () => {
  const prisma = {
    transaction: { update: jest.fn() },
    merchant: { findUnique: jest.fn() },
  } as any;
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

  it('rejects invalid status values', async () => {
    await expect(service.updateTransactionStatus('tx-1', 'BAD' as any)).rejects.toThrow('Invalid status');
  });

  it('fires webhook when COMPLETED and WEBHOOK_BASE_URL is set', async () => {
    process.env.WEBHOOK_BASE_URL = 'https://example.com';
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'COMPLETED', merchantId: 'm1' });
    prisma.merchant.findUnique.mockResolvedValue({ id: 'm1', email: 'm@test.com' });
    await service.updateTransactionStatus('tx-1', 'COMPLETED');
    expect(notificationService.sendWebhook).toHaveBeenCalledWith(
      'https://example.com/events',
      { txId: 'tx-1', status: 'COMPLETED', merchantId: 'm1' },
    );
  });
});
