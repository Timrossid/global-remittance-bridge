# System Architecture

This document provides a high-level overview of the Global Micro-Remittance Bridge architecture.

## 🏗️ Architectural Overview

The Bridge is designed as a distributed system comprising several decoupled microservices and components, enabling scalability, resilience, and ease of maintenance.

### 🧩 Core Components

1.  **Payment API (`payment-api`)**: The central orchestration engine. It manages user onboarding, KYC processes, payment initiation, and transaction status tracking.
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

- **Trustless Escrow:** Funds are held by smart contracts, not the bridge operator.
- **Auditability:** All critical actions are logged and can be reconciled with on-chain data.
- **Compliance:** Integrated KYC/AML checks ensure adherence to international regulations.
