import { Test, TestingModule } from '@nestjs/testing';
import { NotificationReadService } from '../../src/notifications/notification-read.service';
import { PrismaService } from '../../src/common/prisma.service';

describe('NotificationReadService', () => {
  let service: NotificationReadService;
  const prisma = {
    notification: {
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, NotificationReadService],
    }).compile();
    service = module.get(NotificationReadService);
  });

  afterEach(() => jest.clearAllMocks());

  it('marks a single notification as read', async () => {
    prisma.notification.findFirst.mockResolvedValue({ id: 'n1' });
    prisma.notification.update.mockResolvedValue({ id: 'n1', read: true });
    const result = await service.markRead('user-1', 'n1');
    expect(result.read).toBe(true);
  });

  it('marks all notifications as read for a user', async () => {
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
