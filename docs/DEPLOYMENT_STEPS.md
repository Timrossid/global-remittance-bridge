# Deployment Guide

## 1. Deploy Soroban Contracts to Stellar Testnet

```bash
# Install the Stellar CLI
cargo install stellar-cli

# Generate and fund a deployer keypair on testnet
stellar keys generate --global deployer --network testnet
stellar keys fund deployer --network testnet

# Build and deploy the escrow contract
cd contracts/escrow
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source deployer \
  --network testnet
# → Save the returned C... address as SOROBAN_CONTRACT_ID

# Build and deploy the settlement contract
cd ../settlement
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/settlement.wasm \
  --source deployer \
  --network testnet
```

---

## 2. Deploy the Backend API (Railway)

1. Create a new project at [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Set **Root Directory** to `payment-api`
4. Add environment variables from `payment-api/.env.example`:
   - `DATABASE_URL` — your Supabase pooler URL
   - `DIRECT_URL` — your Supabase direct URL
   - `JWT_SECRET` — a strong random string (32+ chars)
   - `STELLAR_SECRET` — your server Stellar secret key
   - `SOROBAN_CONTRACT_ID` — the C-address from step 1
   - `SOROBAN_RPC_URL` — `https://soroban-testnet.stellar.org`
   - `REDIS_URL` — your Redis instance URL
5. Set **Build command**: `npm run build`
6. Set **Start command**: `npm run start:prod`
7. After deployment, run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```
8. Copy the deployed URL (e.g. `https://payment-api-production.up.railway.app`)

---

## 3. Deploy the Frontend (Vercel)

1. Import the repo at [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `merchant-dashboard`
3. Framework preset: **Next.js**
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` — your Railway API URL from step 2
   - `NEXT_PUBLIC_CONTRACT_ID` — your escrow contract C-address
   - `NEXT_PUBLIC_NETWORK` — `testnet`
5. Deploy — Vercel Analytics activates automatically

---

## 4. Run the Transaction Indexer

The indexer runs as a standalone Node.js process. Deploy alongside the API (same Railway project or a separate service):

```bash
cd transaction-indexer
npm install
DATABASE_URL="postgresql://user:password@db-hostname.render.com:6543/dbname?pgbouncer=true" STELLAR_NETWORK=testnet node src/index.js
```

Or add it as a second Railway service pointing to `transaction-indexer/`.

---

## 5. Database Migrations

```bash
cd payment-api
npx prisma migrate deploy   # Apply pending migrations
npx prisma generate         # Regenerate Prisma client
```

---

## Verifying the Deployment

1. Visit your Vercel URL → you should see the login page
2. Register a merchant account
3. Check `https://your-api.railway.app/merchants/me` with the returned JWT
4. Send a test payment and verify it appears in the Stellar testnet explorer
