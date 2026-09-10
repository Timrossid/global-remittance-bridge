import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../../src/payments/payment.service';
import { PrismaService } from '../../src/common/prisma.service';
import { StellarService } from '../../src/common/stellar.service';
import { NotificationService } from '../../src/notifications/notification.service';
import { SorobanService } from '../../src/common/soroban.service';

describe('PaymentService.createEscrowPayment', () => {
  const prisma = {
    merchant: { findUnique: jest.fn() },
    transaction: { create: jest.fn() },
  } as any;
  const stellarService = {} as any;
  const notificationService = {} as any;
  const sorobanService = {
    callRPC: jest.fn(),
    submitTransaction: jest.fn(),
    getTransactionStatus: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('throws when STELLAR_SECRET is not configured', async () => {
    delete process.env.STELLAR_SECRET;
    await expect(
      service.createEscrowPayment('GSRC', 'm1', 'CTOKEN', 100),
    ).rejects.toThrow('STELLAR_SECRET is not configured');
  });

  it('resolves currency from token contract address (XLM for native)', async () => {
    process.env.STELLAR_SECRET = 'S'.repeat(56);
    process.env.STELLAR_NETWORK = 'testnet';
    process.env.SOROBAN_CONTRACT_ID = 'CCESCROW';
    process.env.SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
    prisma.merchant.findUnique.mockResolvedValue({ id: 'm1', walletAddress: 'GMER' });
    sorobanService.callRPC.mockResolvedValue({});
    sorobanService.submitTransaction.mockResolvedValue({ hash: 'txhash' });
    sorobanService.getTransactionStatus.mockResolvedValue({ status: 'SUCCESS' });
    prisma.transaction.create.mockResolvedValue({ id: 'tx-1' });

    await service.createEscrowPayment('GSRC', 'm1', 'GABCDEFGHIJKLMNOPQRSTUVWXYZ', 100);
    const createArg = prisma.transaction.create.mock.calls[0][0];
    expect(createArg.data.currency).toBe('GABCDEFG');
  });
});
