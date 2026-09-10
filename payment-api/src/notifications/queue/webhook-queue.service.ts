import { Injectable, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';

export interface WebhookJobData {
  url: string;
  payload: unknown;
  merchantId: string;
  eventType: string;
  attempts?: number;
}

@Injectable()
export class WebhookQueueService {
  private readonly logger = new Logger(WebhookQueueService.name);
  private queue: Queue<WebhookJobData>;
  private worker: Worker<WebhookJobData>;

  constructor() {
    const connection = process.env.REDIS_URL
      ? { host: new URL(process.env.REDIS_URL).hostname, port: parseInt(new URL(process.env.REDIS_URL).port || '6379', 10) }
      : { host: 'localhost', port: 6379 };

    this.queue = new Queue('webhooks', { connection });
    this.worker = new Worker('webhooks', async (job: Job<WebhookJobData>) => {
      const { url, payload, merchantId, eventType } = job.data;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: eventType, merchantId, data: payload }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.logger.log(`[webhook-queue] Delivered ${eventType} to ${url}`);
      } catch (err: any) {
        this.logger.warn(`[webhook-queue] Delivery failed for ${url}: ${err.message} — will retry`);
        throw err;
      }
    }, { connection, attempts: 5, backoff: { type: 'exponential', delay: 2000 } });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`[webhook-queue] Job ${job?.id} failed after retries: ${err.message}`);
    });
  }

  async enqueue(data: WebhookJobData): Promise<void> {
    await this.queue.add('deliver', data, { attempts: 5, backoff: { type: 'exponential', delay: 2000 } });
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.worker.close();
  }
}
