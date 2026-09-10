# Transaction Indexer

Polls Stellar Horizon every 30 seconds to sync on-chain payments into the
PostgreSQL database shared with the payment-api.

## Setup

```bash
cp .env.example .env
npm ci
npm run build
npm run start
```

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `STELLAR_NETWORK` | No | `testnet` |
| `DATABASE_URL` | Yes | — |

## How it works

1. On startup, runs one immediate indexing cycle across all merchants.
2. Every 30 seconds, polls Horizon for new payments.
3. Uses `MAX(stellarTxHash)` as a cursor to avoid re-scanning history.
4. Links on-chain payments to internal transaction records via Stellar memo.
5. Creates minimal customer records for unknown senders with `idx-` prefixed emails.
6. Every 5 minutes, runs a lightweight DB health check.

## Known limitations

- In-memory dead-letter buffer (not persisted). Consider Redis or DB for production.
- Single process; no distributed locking. Run one indexer per shard in production.
