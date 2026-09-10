import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from '../../src/feedback/feedback.service';
import { PrismaService } from '../../src/common/prisma.service';

describe('FeedbackService', () => {
  const prisma = { feedback: { create: jest.fn() } } as any;
  let service: FeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, FeedbackService],
    }).compile();
    service = module.get(FeedbackService);
    jest.clearAllMocks();
  });

  it('creates a feedback record', async () => {
    prisma.feedback.create.mockResolvedValue({ id: 'fb-1' });
    const result = await service.create({
      name: 'Alice',
      email: 'alice@test.com',
      walletAddress: 'GALICE',
      rating: 5,
      likedMost: 'Speed',
      missingFeature: 'None',
      issues: 'None',
      recommend: 'Yes',
      improvements: 'None',
      network: 'Testnet',
    });
    expect(result.id).toBe('fb-1');
  });
});
