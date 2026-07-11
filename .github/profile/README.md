# Global Micro-Remittance Bridge

Instant cross-border settlement for SMEs using Stellar.

## 🚀 Project Introduction
The Global Micro-Remittance Bridge is an open-source infrastructure designed to enable Small and Medium Enterprises (SMEs) to receive affordable, instant international payments. By leveraging the Stellar network and Soroban smart contracts, we eliminate traditional banking friction and high fees.

## 👁️ Vision
Our vision is to democratize global trade by providing a seamless, transparent, and low-cost payment layer that allows any business, regardless of size or location, to operate globally.

## 🏗️ Architecture
**User Flow:**
`Customer` → `Frontend` → `Payment API` → `Anchor Adapter` → `Stellar Network` → `Soroban Escrow` → `Settlement Engine` → `Merchant Wallet`

*(Detailed architecture diagrams can be found in the [docs repository](../../docs/architecture))*

## 📦 Repositories
- [**.github**](https://github.com/Global-Micro-Remittance-Bridge/.github) - Community health files and organization profile
- [**docs**](https://github.com/Global-Micro-Remittance-Bridge/docs) - Documentation, whitepaper, architecture and developer guides
- [**contracts**](https://github.com/Global-Micro-Remittance-Bridge/contracts) - Soroban smart contracts for escrow and settlement
- [**payment-api**](https://github.com/Global-Micro-Remittance-Bridge/payment-api) - Backend payment platform built with NestJS
- [**merchant-dashboard**](https://github.com/Global-Micro-Remittance-Bridge/merchant-dashboard) - Merchant portal built with Next.js
- [**anchor-adapter**](https://github.com/Global-Micro-Remittance-Bridge/anchor-adapter) - Integration layer for Stellar Anchors
- [**transaction-indexer**](https://github.com/Global-Micro-Remittance-Bridge/transaction-indexer) - Stellar blockchain indexing service
- [**notification-service**](https://github.com/Global-Micro-Remittance-Bridge/notification-service) - Email, SMS and webhook notifications
- [**sdk**](https://github.com/Global-Micro-Remittance-Bridge/sdk) - Official SDKs for developers
- [**website**](https://github.com/Global-Micro-Remittance-Bridge/website) - Marketing website and documentation portal
- [**demo-app**](https://github.com/Global-Micro-Remittance-Bridge/demo-app) - Example merchant implementation
- [**examples**](https://github.com/Global-Micro-Remittance-Bridge/examples) - Sample integrations and code snippets
- [**infrastructure**](https://github.com/Global-Micro-Remittance-Bridge/infrastructure) - Docker, Terraform, deployment and DevOps

## 🛠️ Tech Stack
- **Blockchain:** Stellar, Soroban (Rust)
- **Backend:** NestJS, PostgreSQL, Prisma, Redis
- **Frontend:** Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **DevOps:** Docker, Terraform, GitHub Actions, Kubernetes

## 🗺️ Roadmap
- [ ] **v0.1 MVP:** Core payment flow, basic escrow contracts, merchant onboarding.
- [ ] **v0.2 Multi-Anchor:** Integration with multiple Stellar anchors (Circle, MoneyGram, etc.).
- [ ] **v0.3 Advanced Escrow:** Dispute resolution and time-locks.
- [ ] **v0.4 SDK Release:** Official TypeScript and Python SDKs.
- [ ] **v1.0 Mainnet:** Production launch and security audit.

## 🤝 Contributing
We welcome contributors! Please check our [CONTRIBUTING.md](../../.github/CONTRIBUTING.md) to get started.

## 📜 License
This project is licensed under the MIT License for most repositories, and Apache License 2.0 for smart contracts. See individual repositories for details.

## 📧 Contact
For inquiries, please open an issue in the [.github](https://github.com/Global-Micro-Remittance-Bridge/.github) repository.
