# 💻 Merchant Dashboard

The frontend portal for SMEs to manage their global remittances and treasury. Built with Next.js 14.

## 🏗️ Architecture

The dashboard is a modern web application that communicates with the **Payment API** to provide real-time insights and control.

- **Client-side:** Next.js (App Router) for fast, SEO-friendly rendering.
- **State Management:** React Hooks & Context API.
- **Stylification:** Tailwind CSS & shadcn/ui for a professional, consistent look.
- **API Layer:** Custom fetch wrapper with JWT authentication.

## 🚀 Features

- **Treasury Overview:** Real-time view of total volume, pending settlements, and active customers.
- **Wallet Management:** Access to Stellar wallet address and withdrawal controls.
- **Transaction Tracking:** Detailed history of all incoming international payments.
- **KYC Portal:** Simple interface for uploading documents and tracking verification status.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styl styling:** Tailwind CSS, shadcn/ui
- **Icons:** Lucide React
- **Data Fetching:** Fetch API with custom authentication middleware

## 🚦 Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in:
- `NEXT_PUBLIC_API_URL`: The URL of the deployed Payment API.
- `NEXT_PUBLIC_NETWORK`: Stellar network (e.g., `testnet`).
- `NEXT_PUBLIC_CONTRACT_ID`: The deployed address of the Escrow contract.
- `NEXT_PUBLIC_SOROBAN_RPC_URL`: Soroban RPC endpoint used by the browser escrow flow (Testnet default: `https://soroban-testnet.stellar.org`).
- `NEXT_PUBLIC_ESCROW_TOKEN_ID`: Testnet token contract C-address used by the browser escrow form. For a native-XLM smoke test, use `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`.

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run start
```

## 🔐 Browser Escrow Flow

The `/escrow` page provides a direct, user-initiated Stellar Testnet flow through Freighter:

1. Connect Freighter and verify it is on Testnet.
2. Enter the receiver, token contract, and amount in token stroops.
3. The dashboard builds and simulates `create_escrow(sender, receiver, token, amount)`.
4. Freighter signs the prepared transaction; the browser submits it to Soroban RPC and polls for confirmation.

The page cross-checks all escrow entry points against `contracts/escrow/src/lib.rs`: `initialize` and `transfer_admin` are deployment/recovery actions, `create_escrow` is exposed for the connected sender, and `release_funds`/`refund_funds` require the persisted administrator and are not exposed as arbitrary browser actions. Private keys never enter the dashboard. Use Testnet assets only. The published Testnet contract IDs predate the persisted-admin hardening and must be redeployed and initialized before relying on it. CI verifies the connection/UI path with a non-production mock; live transaction execution still requires manual Freighter/Testnet verification.

## 🎨 Design Philosophy

Designed for non-technical SME owners. Focuses on clarity, trust, and mobile responsiveness to allow business owners to track payments on the go.
