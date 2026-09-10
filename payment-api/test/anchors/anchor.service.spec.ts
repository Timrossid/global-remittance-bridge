import { Test, TestingModule } from '@nestjs/testing';
import { AnchorService } from '../../src/anchors/anchor.service';
import { PrismaService } from '../../src/common/prisma.service';

describe('AnchorService', () => {
  const prisma = { merchant: { findUnique: vi.fn() } } as any;

  let service: AnchorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, AnchorService],
    }).compile();
    service = module.get(AnchorService);
    vi.clearAllMocks();
  });

  it('returns supported anchors', async () => {
    const result = await service.getSupportedAnchors();
    expect(Array.isArray(result)).toBe(true);
  });
});
