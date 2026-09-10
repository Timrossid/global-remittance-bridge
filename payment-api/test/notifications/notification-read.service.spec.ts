import { Test, TestingModule } from '@nestjs/testing';
import { NotificationReadService } from '../../src/notifications/notification-read.service';
import { PrismaService } from '../../src/common/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationReadService', () => {
  const prisma = {
    notification: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
  } as any;
  let service: NotificationReadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, NotificationReadService],
    }).compile();
    service = module.get(NotificationReadService);
    vi.clearAllMocks();
  });

  it('marks a single notification as read', async () => {
    prisma.notification.findFirst.mockResolvedValue({ id: 'n1' });
    prisma.notification.update.mockResolvedValue({ id: 'n1', read: true });
    const result = await service.markRead('user-1', 'n1');
    expect(result.read).toBe(true);
  });

  it('throws NotFoundException for unknown notification', async () => {
    prisma.notification.findFirst.mockResolvedValue(null);
    await expect(service.markRead('user-1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('marks all as read and returns count', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 3 });
    const result = await service.markAllRead('user-1');
    expect(result.count).toBe(3);
  });

  it('returns unread count', async () => {
    prisma.notification.count.mockResolvedValue(7);
    const result = await service.getUnreadCount('user-1');
    expect(result.count).toBe(7);
  });
});
