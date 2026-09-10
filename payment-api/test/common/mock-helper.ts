import { PrismaService } from '../src/common/prisma.service';
import { StellarService } from '../src/common/stellar.service';
import { NotificationService } from '../src/notifications/notification.service';
import { SorobanService } from '../src/common/soroban.service';
import { JwtService } from '@nestjs/jwt';

export function createMockPrisma() {
  return {
    user: { findUnique: vi.fn(), create: vi.fn() },
    refreshToken: { create: vi.fn() },
    merchant: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    customer: { findUnique: vi.fn(), create: vi.fn() },
    transaction: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    feedback: { create: vi.fn() },
    notification: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
    auditLog: { create: vi.fn() },
    exchangeRate: { findUnique: vi.fn() },
    apiKey: { findUnique: vi.fn(), create: vi.fn() },
    webhook: { findMany: vi.fn(), create: vi.fn() },
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
  } as any;
}

export function createMockServices() {
  return {
    prisma: createMockPrisma(),
    stellarService: { buildPaymentTransaction: vi.fn(), submitTransaction: vi.fn() } as unknown as StellarService,
    notificationService: { sendEmail: vi.fn(), sendSms: vi.fn(), sendWebhook: vi.fn() } as unknown as NotificationService,
    sorobanService: { callRPC: vi.fn(), submitTransaction: vi.fn(), getTransactionStatus: vi.fn() } as unknown as SorobanService,
    jwtService: { signAsync: vi.fn(), verifyAsync: vi.fn() } as unknown as JwtService,
  };
}
