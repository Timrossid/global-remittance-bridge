import { Injectable, Logger } from '@nestjs/common';

export interface WebhookPayload {
  id: string;
  url: string;
  secret: string;
  payload: unknown;
  headers?: Record<string, string>;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly defaultTimeout = 10000;
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;

  async send(payload: WebhookPayload): Promise<boolean> {
    const body = JSON.stringify(payload.payload);
    const signature = this.generateSignature(body, payload.secret);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Id': payload.id,
      ...(payload.headers || {}),
    };

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

        const response = await fetch(payload.url, {
          method: 'POST',
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          this.logger.log(`Webhook delivered: ${payload.id} to ${payload.url}`);
          return true;
        }

        this.logger.warn(
          `Webhook attempt ${attempt + 1} failed: ${response.status} ${response.statusText}`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(
          `Webhook attempt ${attempt + 1} error: ${message}`,
        );
      }

      if (attempt < this.maxRetries - 1) {
        await this.delay(this.baseDelay * Math.pow(2, attempt));
      }
    }

    this.logger.error(`Webhook delivery failed after ${this.maxRetries} attempts: ${payload.id}`);
    return false;
  }

  private generateSignature(body: string, secret: string): string {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(body);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return Buffer.from(signature).toString('hex');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
