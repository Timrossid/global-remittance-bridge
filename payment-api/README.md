# Payment API

NestJS backend for the Global Micro-Remittance Bridge. Orchestrates Stellar
payments, Soroban escrow interactions, merchant management, and notifications.

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6 (for BullMQ webhook queue)
- Stellar testnet or mainnet account with funded secret

## Setup

```bash
cp .env.example .env
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
npm run start:prod
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start with hot-reload |
| `npm run build` | Prisma generate + Nest build |
| `npm run test` | Jest unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript strict check |

## Architecture

- **Auth**: JWT + refresh tokens via passport-jwt
- **Payments**: Direct Stellar transfers and Soroban escrow via RPC simulate+send
- **Notifications**: SendGrid/Twilio/SMTP with fallback logging
- **Webhooks**: BullMQ queue with 5x exponential backoff retry

## Environment

Required: `DATABASE_URL`, `JWT_SECRET`, `STELLAR_NETWORK`, `SOROBAN_RPC_URL`, `SOROBAN_CONTRACT_ID`, `STELLAR_SECRET`.

Optional: `REDIS_URL`, `CORS_ORIGIN`, `SENDGRID_API_KEY`, `TWILIO_*`, `SMTP_*`, `WEBHOOK_BASE_URL`.
