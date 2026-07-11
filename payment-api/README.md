# ⚙️ Payment API

The core backend orchestration layer for the Global Micro-Remittance Bridge. Built with NestJS, Prisma, and PostgreSQL.

## 🏗️ Architecture

The Payment API serves as the central brain of the ecosystem, coordinating between:
- **Merchants:** Managing onboarding, KYC, and wallet addresses.
- **Customers:** Processing payment initiations.
- **Stellar Network:** Interfacing with the blockchain for fund transfers and contract interactions.
- **Anchor Adapters:** Routing payments through various fiat on/off ramps.
- **Transaction Indexer:** Receiving updates from the indexer to reconcile on-chain state.

## 🚀 Features

- **Merchant Onboarding:** API for SME registration and KYC management.
- **Payment Orchestration:** Manages the lifecycle of payments from initiation to settlement.
- **Stellar/Soroban Integration:** Direct communication with the Stellar network for fund transfers and smart contract calls.
- **Anchor Management:** Dynamic routing to the best fiat on/off ramps.
- **Notification System:** Automated alerts via Email, SMS, and Webhooks.

## 🛠️ Tech Stack

- **Framework:** NestJS
- **ORM:** Prisma (PostgreSQL)
- **Blockchain:** `@stellar/stellar-sdk` & `soroban-client`
- **Cache/Queue:** Redis, BullMQ
- **Auth:** JWT / Passport

## 🚦 Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL`: PostgreSQL connection string (Transaction mode for app, Session mode for migrations).
- `DIRECT_URL`: PostgreSQL connection string (Session mode).
- `JWT_SECRET`: Secret for signing JWT tokens.
- `STELLAR_SECRET`: Secret key for the bridge administrative account.
- `SOROBAN_RPC_URL`: URL of the Soroban RPC server (e.g., Testnet).
- `ESCROW_CONTRACT_ID`: The deployed address of the Escrow contract.
- `REDIS_URL`: Redis connection string for BullMQ.

### Running the App

**Development:**
```bash
npm run start:dev
```

**Production (Docker):**
```bash
docker build -t payment-api .
docker run -p 3000:3000 --env-file .env payment-api
```

## 🛣️ API Endpoints

### Merchants
- `POST /merchants/onboard` - Register a new SME.
- `GET /merchants/me` - Get authenticated merchant profile.
- `GET /merchants/me/stats` - Get dashboard statistics (volume, customers, etc.).
- `PUT /merchants/:id/kyc` - Update KYC status.

### Payments
- `POST /payments/create` - Initiate a new remittance transaction.
- `POST /payments/transfer` - Trigger an immediate Stellar transfer.
- `POST /payments/escrow` - Create a secure escrow on the Soroban blockchain.
- `GET /payments/:id` - Retrieve transaction details.
- `GET /merchants/:id/transactions` - List all transactions for a merchant.

### Anchors & Settlements
- `GET /anchors/quote` - Get the best FX rate from available anchors.
- `POST /settlements/process` - Trigger a settlement batch for a merchant.
