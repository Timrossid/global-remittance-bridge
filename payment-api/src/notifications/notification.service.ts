import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async sendEmail(to: string, subject: string, body: string) {
    console.log(`Sending Email to ${to}: [${subject}] ${body}`);
    return { success: true, provider: 'sendgrid' };
  }

  async sendSms(phone: string, message: string) {
    console.log(`Sending SMS to ${phone}: ${message}`);
    return { success: true, provider: 'twilio' };
  }

  async sendWebhook(url: string, payload: any) {
    console.log(`Triggering Webhook at ${url}`);
    return { success: true };
  }
}
