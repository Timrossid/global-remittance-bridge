import { Test, TestingModule } from '@nestjs/testing';
import { MerchantService } from '../../src/merchants/merchant.service';
import { PrismaService } from '../../src/common/prisma.service';

describe('MerchantService', () => {
  const prisma = {
    merchant: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  } as any;

  let service: MerchantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, MerchantService],
    }).compile();
    service = module.get(MerchantService);
    jest.clearAllMocks();
  });

  it('creates a merchant', async () => {
    prisma.merchant.create.mockResolvedValue({ id: 'm1', name: 'Acme', email: 'a@test.com' });
    const result = await service.create({ name: 'Acme', email: 'a@test.com', walletAddress: 'GMER' });
    expect(result.id).toBe('m1');
  });

  it('throws NotFoundException for missing merchant', async () => {
    prisma.merchant.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow('Merchant not found');
  });
});
