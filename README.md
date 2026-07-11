# 🌎 Global Micro-Remittance Bridge

The Global Micro-Remittance Bridge is an open-source infrastructure designed to enable Small and Medium Enterprises (SMEs) to receive affordable, instant international payments. By leveraging the Stellar network and Soroban smart contracts, we eliminate traditional banking friction and high fees.

## 🚀 Key Features

- **Trustless Escrow:** Secure fund holding using Soroban smart contracts.
- **Real-time Settlement:** Automated payouts to merchants via Stellar.
- **Merchant Dashboard:** Comprehensive management portal for SMEs.
- **Scalable API:** Robust backend orchestration for high-volume transactions.
- **Developer SDK:** Easy integration for any merchant platform.

## 📂 Repository Structure

The project is organized as a monorepo containing the following core components:

- [`contracts/`](contracts/): Soroban smart contracts for escrow and settlement.
- [`payment-api/`](payment-api/): Core backend orchestration and business logic.
- [`merchant-dashboard/`](merchant-dashboard/): Frontend portal for SME users.
- [`transaction-indexer/`](transaction-indexer/): Blockchain event monitor and synchronizer.
- [`sdk/`](sdk/): Developer tools and libraries.
- [`website/`](website/): Marketing and developer documentation site.
- [`infrastructure/`](infrastructure/): DevOps and deployment configurations.
- [`docs/`](docs/): Detailed technical and business documentation.
- [`demo-app/`](demo-app/): Reference implementation for merchants.
- [`anchor-adapter/`](anchor-adapter/): Integration layer for fiat on/off ramps.
- [`notification-service/`](notification-service/): Multi-channel notification engine.

## 🛠️ Tech Stack

- **Blockchain:** Stellar Network (Soroban Smart Contracts)
- **Backend:** NestJS, Node.js, TypeScript, PostgreSQL, Redis
- **Frontend:** Next.js, Tailwind CSS, TypeScript
- **DevOps:** Docker, GitHub Actions, Terraform

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
