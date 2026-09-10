import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailMessage {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface SmsMessage {
  to: string;
  body: string;
}

export interface NotificationResult {
  success: boolean;
  channel: 'email' | 'sms' | 'webhook';
  error?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly defaultFrom: string;

  constructor(private readonly config: ConfigService) {
    this.defaultFrom = this.config.get<string>('NOTIFICATION_FROM_EMAIL') || 'noreply@bridge.example';
  }

  async sendEmail(message: EmailMessage): Promise<NotificationResult> {
    const payload = {
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      from: message.from || this.defaultFrom,
    };

    this.logger.log(`[email] to=${message.to} subject="${message.subject}"`);

    if (process.env.SENDGRID_API_KEY) {
      return this.sendViaSendGrid(payload);
    }

    if (process.env.SMTP_HOST) {
      return this.sendViaSmtp(payload);
    }

    this.logger.warn('[email] No email transport configured (SENDGRID_API_KEY or SMTP_*). Dropping message.');
    return { success: false, channel: 'email', error: 'No email transport configured' };
  }

  private async sendViaSendGrid(payload: EmailMessage & { from: string }): Promise<NotificationResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.to }] }],
          from: { email: payload.from },
          subject: payload.subject,
          content: [
            ...(payload.html ? [{ type: 'text/html', value: payload.html }] : []),
            ...(payload.text ? [{ type: 'text/plain', value: payload.text }] : []),
          ],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.warn(`[email] SendGrid rejected: ${response.status} ${text}`);
        return { success: false, channel: 'email', error: `SendGrid ${response.status}` };
      }

      return { success: true, channel: 'email' };
    } catch (err: any) {
      this.logger.error(`[email] SendGrid delivery error: ${err.message}`);
      return { success: false, channel: 'email', error: err.message };
    }
  }

  private async sendViaSmtp(payload: EmailMessage & { from: string }): Promise<NotificationResult> {
    try {
      const { default: nodemailer } = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      });

      await transporter.sendMail({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      });

      return { success: true, channel: 'email' };
    } catch (err: any) {
      this.logger.error(`[email] SMTP delivery error: ${err.message}`);
      return { success: false, channel: 'email', error: err.message };
    }
  }

  async sendSms(message: SmsMessage): Promise<NotificationResult> {
    this.logger.log(`[sms] to=${message.to} length=${message.body.length}`);

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      return this.sendViaTwilio(message);
    }

    this.logger.warn('[sms] No SMS transport configured (TWILIO_*). Dropping message.');
    return { success: false, channel: 'sms', error: 'No SMS transport configured' };
  }

  private async sendViaTwilio(message: SmsMessage): Promise<NotificationResult> {
    try {
      const { Twilio } = await import('twilio');
      const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        to: message.to,
        from: process.env.TWILIO_FROM_NUMBER,
        body: message.body,
      });
      return { success: true, channel: 'sms' };
    } catch (err: any) {
      this.logger.error(`[sms] Twilio delivery error: ${err.message}`);
      return { success: false, channel: 'sms', error: err.message };
    }
  }

  async sendWebhook(url: string, payload: unknown): Promise<NotificationResult> {
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
        return { success: false, channel: 'webhook', error: `${response.status}` };
      }
      return { success: true, channel: 'webhook' };
    } catch (err: any) {
      this.logger.warn(`[webhook] delivery error: ${err.message}`);
      return { success: false, channel: 'webhook', error: err.message };
    }
  }
}
