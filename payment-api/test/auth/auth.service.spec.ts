import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/common/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  const prisma = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    refreshToken: { create: jest.fn() },
  } as any;
  const jwtService = { signAsync: jest.fn() } as any;

  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, { provide: JwtService, useValue: jwtService }, AuthService],
    }).compile();
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('validates user with matching password hash', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'u@test.com', password: 'hashed', role: 'USER' });
    const result = await service.validateUser('u@test.com', 'hashed');
    expect(result?.id).toBe('u1');
  });

  it('returns null for unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const result = await service.validateUser('nope@test.com', 'x');
    expect(result).toBeNull();
  });
});
