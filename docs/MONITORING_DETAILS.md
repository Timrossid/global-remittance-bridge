# Monitoring & Analytics Details

## Vercel Analytics (Frontend)

Integrated via `@vercel/analytics` in the merchant dashboard. Automatically active on Vercel deployments.

Tracks:
- Page views per route (`/`, `/transactions`, `/wallet`, `/settings`, `/feedback`)
- Unique visitors and session counts
- Top navigation patterns

No configuration required — the `<Analytics />` component in `app/layout.tsx` handles everything.

## Stellar Expert (On-Chain)

All contract interactions are publicly verifiable:

- Escrow contract: `https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>`
- Settlement contract: `https://stellar.expert/explorer/testnet/contract/<SETTLEMENT_CONTRACT_ID>`

## Transaction Indexer

The `transaction-indexer` service polls the Stellar Horizon API every 30 seconds for payments to all registered merchant wallets. When a new payment is detected:

1. It is matched to an internal transaction ID via the Stellar memo field.
2. The transaction status is updated to `COMPLETED` in the database.
3. If no matching internal record exists, a new transaction is created from on-chain data.

Run locally:
```bash
cd transaction-indexer
npm install
DATABASE_URL=<your_db_url> STELLAR_NETWORK=testnet node src/index.js
```

## GitHub Actions CI

Three workflows run on every push to `main`/`master`:

| Workflow | What it checks |
|---|---|
| `build.yml` | Compiles `payment-api` (NestJS) and `merchant-dashboard` (Next.js) |
| `test.yml` | Runs Jest tests for `payment-api`, lints `merchant-dashboard` |
| `lint.yml` | ESLint for both projects |

## Audit Logs

The `AuditLog` table in the database records all critical actions (payments, KYC updates, status changes) with timestamps and user IDs for compliance auditing.
