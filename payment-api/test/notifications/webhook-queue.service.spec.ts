import { Test, TestingModule } from '@nestjs/testing';
import { WebhookQueueService } from '../../src/notifications/queue/webhook-queue.service';

describe('WebhookQueueService', () => {
  let service: WebhookQueueService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhookQueueService],
    }).compile();
    service = module.get(WebhookQueueService);
  });

  it('instantiates without a live Redis connection', () => {
    expect(service).toBeDefined();
  });
});
