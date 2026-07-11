# 🔔 Notification Service

Handles omni-channel communication for customers and merchants.

## 🚀 Capabilities
- **Emails:** Transaction confirmations and onboarding alerts.
- **SMS:** Instant notifications to merchants when funds arrive.
- **Webhooks:** Real-time event pushes to merchant-owned systems.

## 🛠️ Implementation
The service is currently integrated into the `payment-api` as a module, allowing the payment flow to trigger notifications automatically.

## ⚙️ Configuration
Supports multiple providers:
- **Email:** SendGrid / AWS SES
- **SMS:** Twilio
- **Webhooks:** Custom HTTP endpoints
