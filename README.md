# 🌎 Global Micro-Remittance Bridge

An open-source infrastructure enabling Small and Medium Enterprises (SMEs) to receive affordable, instant international payments via the **Stellar network** and **Soroban smart contracts**. No bank account required.

## 🔗 Live Links

| Resource | URL |
|---|---|
| **Live Demo** | [https://merchant-dashboard-rosy.vercel.app](https://merchant-dashboard-rosy.vercel.app) |
| **Payment API** | [https://global-remittance-api.onrender.com](https://global-remittance-api.onrender.com) |
| **GitHub Repo** | [https://github.com/Timrossid/global-remittance-bridge](https://github.com/Timrossid/global-remittance-bridge) |
| **Stellar Testnet Explorer** | [https://stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) |
| **Escrow Contract** | [CBL3I4IDMIUZJEJG56DV2VP6K7L2ROLT3JYCC53KNU7PPUX6DGPJJVKC](https://stellar.expert/explorer/testnet/contract/CBL3I4IDMIUZJEJG56DV2VP6K7L2ROLT3JYCC53KNU7PPUX6DGPJJVKC) |
| **Settlement Contract** | [CBBH6JHHNKAC4E444EIYG3HGNPYLVFLY72OMRYCCLFZU4ASVU3AO73QR](https://stellar.expert/explorer/testnet/contract/CBBH6JHHNKAC4E444EIYG3HGNPYLVFLY72OMRYCCLFZU4ASVU3AO73QR) |

---

## 🚀 Key Features

- **Trustless Escrow** — Soroban smart contract holds funds until confirmed delivery; 0.5% protocol fee distributed automatically.
- **Real-time Settlement** — Automated payouts to merchants via Stellar Horizon API.
- **Merchant Dashboard** — Production Next.js portal with auth, transaction history, wallet view, settings, and user feedback collection.
- **Submission Pack** — Screenshots, demo video notes, and feedback collection guidance are now documented in [screenshots/README.md](screenshots/README.md).
- **REST API** — NestJS backend with JWT authentication, Prisma ORM, and full CRUD for merchants and transactions.
- **Analytics** — Vercel Analytics integrated for page-view and engagement tracking.
- **Responsive UI** — Mobile-first Tailwind CSS design, tested on 375px–1440px viewports.

---

## 📂 Repository Structure

```
global-remittance-bridge/
├── contracts/
│   ├── escrow/          # Soroban escrow contract (Rust) — creates/releases/refunds escrows
│   └── settlement/      # Soroban settlement contract (Rust) — processes payouts with fee distribution
├── payment-api/         # NestJS REST API — auth, merchants, payments, Stellar integration
├── merchant-dashboard/  # Next.js 14 merchant portal — dashboard, transactions, wallet, settings
├── transaction-indexer/ # Stellar event monitor and DB synchronizer
├── anchor-adapter/      # Fiat on/off-ramp integration layer
├── notification-service/# Email/SMS/webhook notification engine
├── sdk/                 # Developer SDK for merchant integrations
├── website/             # Marketing and docs site
├── infrastructure/      # Docker Compose and deployment configs
├── docs/                # Architecture, API guide, deployment docs
├── screenshots/         # Submission screenshots
└── demo-app/            # Reference merchant implementation
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Stellar Network + Soroban Smart Contracts (Rust) |
| Backend | NestJS, TypeScript, PostgreSQL (Supabase), Prisma ORM, Redis, BullMQ |
| Frontend | Next.js 14, Tailwind CSS, TypeScript, Vercel Analytics |
| Auth | JWT (passport-jwt), salted HMAC-SHA256 passwords |
| DevOps | Docker, GitHub Actions, Vercel (frontend), Railway/Render (API) |

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- Rust + `stellar` CLI (`cargo install stellar-cli`)
- PostgreSQL (or a free [Supabase](https://supabase.com) project)
- Redis (or [Upstash](https://upstash.com) free tier)

### 1. Clone the repo

```bash
git clone https://github.com/Timrossid/global-remittance-bridge.git
cd global-remittance-bridge
```

### 2. Deploy the Soroban contracts to testnet

```bash
cd contracts

# Fund a testnet account (do this once)
stellar keys generate --global deployer --network testnet
stellar keys fund deployer --network testnet

# Build the escrow contract
cd escrow
stellar contract build

# Deploy the escrow contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source deployer \
  --network testnet
# → Copy the returned contract address (C...) — you'll need it below

# Build and deploy the settlement contract
cd ../settlement
stellar contract build
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/settlement.wasm \
  --source deployer \
  --network testnet
# → Copy this contract address too
```

### 3. Set up the Payment API

```bash
cd ../../payment-api
cp .env.example .env
# Edit .env: fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, STELLAR_SECRET, SOROBAN_CONTRACT_ID

npm install
npx prisma migrate deploy
npm run start:dev
# API will be running at http://localhost:3001
```

### 4. Set up the Merchant Dashboard

```bash
cd ../merchant-dashboard
cp .env.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL=http://localhost:3001
#                  set NEXT_PUBLIC_CONTRACT_ID=<your C... address>

npm install
npm run dev
# Dashboard at http://localhost:3000
```

---

## 🔑 API Reference

### Authentication

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Acme Corp",
  "email": "merchant@acme.com",
  "password": "securepass123",
  "walletAddress": "GABC..."
}
→ { "access_token": "eyJ...", "merchant_id": "uuid", "merchant": {...} }
```

```http
POST /auth/login
Content-Type: application/json

{ "email": "merchant@acme.com", "password": "securepass123" }
→ { "access_token": "eyJ...", "merchant": {...} }
```

### Merchant

```http
GET /merchants/me                    # Get authenticated merchant profile
GET /merchants/me/stats              # Get dashboard stats
GET /merchants/me/transactions       # Get transaction history
```

### Payments

```http
POST /payments/transfer              # Initiate a direct Stellar payment
POST /payments/create                # Create a payment record
GET  /payments/:id                   # Get a single payment
PUT  /payments/:id/status            # Update payment status
```

All protected endpoints require `Authorization: Bearer <token>`.

---

## 📜 Smart Contract Details

### Escrow Contract (`contracts/escrow`)

```rust
// Create a new escrow — locks tokens until released or refunded
create_escrow(sender, receiver, token, amount) -> escrow_id

// Release funds to receiver (admin only)
release_funds(admin, escrow_id)

// Refund to original sender (admin only)
refund_funds(admin, escrow_id)
```

**State machine:** `PENDING (0)` → `RELEASED (1)` or `REFUNDED (2)`

### Settlement Contract (`contracts/settlement`)

```rust
// Process a settlement: transfers net amount to merchant, fee to treasury
// Fee rate: 50 bps (0.5%)
process_settlement(sender, merchant, treasury, token, amount)

// Distribute accumulated protocol fees to treasury
distribute_fees(admin, treasury, token, fee_amount)

// View helpers
get_last_settlement() -> (amount, net, fee)
get_fee_bps() -> i128
```

---

## 🏗️ Architecture

```
Customer Browser / SDK
        │
        ▼
Payment API (NestJS) ─────────── Soroban RPC (testnet)
        │                                │
        ├─ auth (JWT)                    │
        ├─ merchants                     ▼
        ├─ payments ─────────── Escrow Contract
        └─ notifications         Settlement Contract
        │
        ▼
PostgreSQL (Supabase) ◄─── Transaction Indexer
                                    │
                            Stellar Horizon API
```

---

## 🚢 Deployment

### Frontend (Vercel)

1. Import repo to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL` → your deployed API URL
   - `NEXT_PUBLIC_CONTRACT_ID` → deployed escrow contract C-address
   - `NEXT_PUBLIC_NETWORK` → `testnet`
3. Deploy — Vercel Analytics auto-activates

### Backend API (Railway / Render)

1. Connect your GitHub repo
2. Set all variables from `payment-api/.env.example`
3. Build command: `npm run build`
4. Start command: `npm run start:prod`
5. Run migrations: `npx prisma migrate deploy`

---

## 📊 Analytics & Monitoring

- **Vercel Analytics** — Integrated in the merchant dashboard (`@vercel/analytics`). Tracks page views, unique visitors, and navigation patterns automatically on Vercel deployments.
- **GitHub Actions** — CI runs lint, build, and tests on every push/PR.
- **Stellar Expert** — All on-chain transactions are publicly visible at `https://stellar.expert/explorer/testnet`.

---

## 🤝 User Onboarding

Users can register at the live demo URL, connect their Stellar wallet address, and start receiving payments immediately on testnet.

For proof of wallet interactions, see the [screenshots/](screenshots/) directory and the Stellar testnet contract explorer.

---

## 📸 Screenshots

See the [screenshots/](screenshots/) directory for:
- Dashboard UI (desktop)
- Mobile responsive view
- Transactions page
- Vercel Analytics dashboard
- Deployed contract on Stellar Expert
- Proof of 10+ wallet interactions

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📄 License

Apache License 2.0 — see [LICENSE](LICENSE).
