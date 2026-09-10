import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../../src/notifications/notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();
    service = module.get(NotificationService);
  });

  it('sendEmail returns failure when no transport is configured', async () => {
    const result = await service.sendEmail('test@example.com', 'Subject');
    expect(result.success).toBe(false);
    expect(result.channel).toBe('email');
    expect(result.error).toBeDefined();
  });

  it('sendSms returns failure when no transport is configured', async () => {
    const result = await service.sendSms('+1234567890', 'Hello');
    expect(result.success).toBe(false);
    expect(result.channel).toBe('sms');
  });

  it('sendWebhook handles network errors gracefully', async () => {
    const result = await service.sendWebhook('http://invalid.invalid/hook', { hello: true });
    expect(result.channel).toBe('webhook');
    expect(result.success).toBe(false);
  });
});
