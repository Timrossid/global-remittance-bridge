# System Architecture

This document provides the current high-level overview of the Global Micro-Remittance Bridge architecture. Detailed trust boundaries, sequences, administrative lifecycle, and deployment promotion are in [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md).

## 🏗️ Architectural Overview

The Bridge is designed as a distributed system comprising several decoupled microservices and components, enabling scalability, resilience, and ease of maintenance.

### 🧩 Core Components

1.  **Payment API (`payment-api`)**: The central orchestration engine. It manages onboarding, merchant records, payment initiation, Soroban RPC calls, and transaction status tracking. KYC/AML fields and workflows are represented in the application model but are not a substitute for a production compliance program.
2.  **Transaction Indexer (`transaction-indexer`)**: A specialized service that monitors the Stellar blockchain. It listens for relevant events and synchronizes them with the internal system state.
3.  **Merchant Dashboard (`merchant-dashboard`)**: A web-based interface providing SMEs with real-time visibility into their transactions, treasury, and customer base.
4.  **Smart Contracts (`contracts/`)**: Secure, trustless logic implemented on the Stellar Soroban platform to handle escrow and automated settlements.
5.  **SDK (`sdk/`)**: A developer-friendly library to facilitate seamless integration of the Bridge into existing merchant infrastructures.

## 🔄 High-Level Data Flow

1.  **Payment Initiation:** A merchant via the `merchant-dashboard` or an external system via the `payment-api` initiates a payment request.
2.  **Stellar Transaction:** The `payment-api` submits a transaction to the Stellar network, which triggers the `EscrowContract`.
3.  **Blockchain Monitoring:** The `transaction-indexer` detects the transaction on-chain and verifies its completion.
4.  **State Reconciliation:** The indexer updates the internal database, and the `payment-api` triggers the appropriate notifications.
5.  **Settlement:** Once conditions are met, the `SettlementContract` automates the distribution of funds and protocol fees.

## 🛡️ Security & Compliance

- **Escrow role boundary:** The hardened escrow persists one administrator, checks authentication and role equality for release/refund, and supports explicit admin rotation.
- **Wallet boundary:** Browser signing is delegated to Freighter; private keys do not enter the dashboard or API browser flow.
- **Auditability:** Transaction hashes and contract state can be reconciled against Soroban RPC/Horizon; database records are projections.
- **Compliance limitation:** KYC/AML fields and onboarding states exist in the application model, but legal, jurisdiction-specific compliance controls remain a pre-Mainnet workstream.
- **Review status:** Automated tests and static checks are evidence of engineering controls, not an independent security audit.
