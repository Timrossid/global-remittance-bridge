import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendEmail(to: string, subject: string): Promise<{ success: boolean }> {
    this.logger.log(`[email] to=${to} subject="${subject}"`);
    return { success: true };
  }

  async sendSms(phone: string, message: string): Promise<{ success: boolean }> {
    this.logger.log(`[sms] to=${phone} length=${message.length}`);
    return { success: true };
  }

  async sendWebhook(url: string, payload: unknown): Promise<{ success: boolean }> {
    this.logger.log(`[webhook] url=${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        this.logger.warn(`[webhook] delivery failed: ${response.status} ${response.statusText}`);
        return { success: false };
      }
      return { success: true };
    } catch (err: any) {
      this.logger.warn(`[webhook] delivery error: ${err.message}`);
      return { success: false };
    }
  }
}
