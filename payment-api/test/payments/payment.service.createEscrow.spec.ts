import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';
import { StellarService } from '../../src/common/stellar.service';
import { NotificationService } from '../../src/notifications/notification.service';
import { SorobanService } from '../../src/common/soroban.service';

describe('PaymentService.createEscrowPayment', () => {
  const prisma = {
    merchant: { findUnique: vi.fn() },
    transaction: { create: vi.fn() },
  } as any;
  const stellarService = {} as any;
  const notificationService = {} as any;
  const sorobanService = {
    callRPC: vi.fn().mockResolvedValue({}),
    submitTransaction: vi.fn().mockResolvedValue({ hash: 'txhash' }),
    getTransactionStatus: vi.fn().mockResolvedValue({ status: 'SUCCESS' }),
  } as any;

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

  it('throws when STELLAR_SECRET is missing', async () => {
    delete process.env.STELLAR_SECRET;
    await expect(service.createEscrowPayment('GSRC', 'm1', 'CTOKEN', 100)).rejects.toThrow('STELLAR_SECRET is not configured');
  });

  it('resolves currency from token contract address', async () => {
    process.env.STELLAR_SECRET = 'S'.repeat(56);
    process.env.STELLAR_NETWORK = 'testnet';
    process.env.SOROBAN_CONTRACT_ID = 'CCESCROW';
    process.env.SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
    prisma.merchant.findUnique.mockResolvedValue({ id: 'm1', walletAddress: 'GMER' });
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
    await service.createEscrowPayment('GSRC', 'm1', 'GABCDEFGHIJKLMNOPQRSTUVWXYZ', 100);
    expect(prisma.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ currency: 'GABCDEFG' }),
    });
  });
});
