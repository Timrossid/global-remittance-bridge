import { Test, TestingModule } from '@nestjs/testing';
import { WebhookQueueService } from '../../src/notifications/queue/webhook-queue.service';

describe('WebhookQueueService', () => {
  let service: WebhookQueueService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookQueueService],
    }).compile();
    service = module.get(WebhookQueueService);
  });

  it('is instantiable without Redis', () => {
    expect(service).toBeDefined();
  });
});
