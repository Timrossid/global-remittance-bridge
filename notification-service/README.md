# Notification Service

Omni-channel communication layer for the Global Micro-Remittance Bridge.

## Supported Channels

| Channel | Transport | Environment Variable |
|---------|-----------|---------------------|
| Email | SendGrid API | `SENDGRID_API_KEY` |
| Email | SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| SMS | Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |
| Webhook | HTTP POST | `WEBHOOK_BASE_URL` (server-side) |

## Usage

The NotificationService is provided as a NestJS injectable. It automatically
selects the first available transport for each channel:

```ts
await notificationService.sendEmail('user@example.com', 'Subject', { html: '<p>...</p>' });
await notificationService.sendSms('+1234567890', 'Your payment was received.');
await notificationService.sendWebhook('https://example.com/hook', { event: 'payment.completed' });
```

When no transport is configured, the service logs the message and returns
`{ success: false }`. Ensure at least one email or SMS transport is set in
production.
