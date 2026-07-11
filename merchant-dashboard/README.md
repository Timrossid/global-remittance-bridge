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

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run start
```

## 🎨 Design Philosophy

Designed for non-technical SME owners. Focuses on clarity, trust, and mobile responsiveness to allow business owners to track payments on the go.
