import { Injectable, Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service';

export interface QueuedWebhook {
  id: string;
  url: string;
  secret: string;
  payload: unknown;
  retries: number;
  maxRetries: number;
  nextRetryAt: Date;
}

@Injectable()
export class WebhookQueueService {
  private readonly logger = new Logger(WebhookQueueService.name);
  private readonly queue: QueuedWebhook[] = [];
  private readonly processing = new Set<string>();

  constructor(private readonly webhookService: WebhookService) {
    setInterval(() => this.processQueue(), 5000);
  }

  enqueue(webhook: Omit<QueuedWebhook, 'id' | 'retries' | 'nextRetryAt'>) {
    const queued: QueuedWebhook = {
      ...webhook,
      id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      retries: 0,
      nextRetryAt: new Date(),
    };
    this.queue.push(queued);
    this.logger.log(`Webhook queued: ${queued.id}`);
  }

  private async processQueue() {
    const now = new Date();
    const pending = this.queue.filter(
      (w) => !this.processing.has(w.id) && w.nextRetryAt <= now && w.retries < w.maxRetries,
    );

    for (const webhook of pending) {
      this.processing.add(webhook.id);
      this.processWebhook(webhook).finally(() => {
        this.processing.delete(webhook.id);
      });
    }
  }

  private async processWebhook(webhook: QueuedWebhook) {
    try {
      const success = await this.webhookService.send({
        id: webhook.id,
        url: webhook.url,
        secret: webhook.secret,
        payload: webhook.payload,
      });

      if (success) {
        this.queue.splice(this.queue.indexOf(webhook), 1);
        this.logger.log(`Webhook delivered: ${webhook.id}`);
      } else {
        webhook.retries += 1;
        webhook.nextRetryAt = new Date(Date.now() + Math.pow(2, webhook.retries) * 1000);
        this.logger.warn(`Webhook retry ${webhook.retries}/${webhook.maxRetries}: ${webhook.id}`);
      }
    } catch (error) {
      webhook.retries += 1;
      webhook.nextRetryAt = new Date(Date.now() + Math.pow(2, webhook.retries) * 1000);
      this.logger.error(`Webhook error: ${webhook.id}`, error);
    }
  }
}
