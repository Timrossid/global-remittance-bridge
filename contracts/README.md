# 📜 Soroban Smart Contracts

This repository contains the smart contracts that power the trust and settlement layer of the Global Micro-Remittance Bridge. These contracts are written in Rust and deployed on the Stellar Soroban smart contract platform.

## 🏗️ Architecture

The contract layer provides two primary functions:

1.  **Escrow (`/escrow`):** Acts as a trusted intermediary for funds. It holds funds from the sender until the conditions are met (e.g., service delivery) and then releases them to the receiver or refunds them to the sender.
2.  **Settlement (`/settlement`):** Handles the logic for calculating and distributing fees and payouts to merchants once a transaction is confirmed.

## 🛠️ Contracts

### 📦 Escrow Contract (`/escrow`)
Handles the secure holding of funds during a transaction.
- `create_escrow`: Locks funds for a specific receiver.
- `release_funds`: Releases funds to the receiver upon administrative confirmation.
- `refund_funds`: Returns funds to the sender if the transaction is cancelled.

### ⚖️ Settlement Contract (`/settlement`)
Manages the distribution of funds and fees.
- `process_settlement`: Payouts to merchants.
- `distribute_fees`: Transfers protocol fees to the treasury.

## 🚀 Development

### Prerequisites
- [Rust](https://www.rust-lang.org/)
- [Soroban CLI](https://soroban.stellar.org/docs/)

### Building
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Testing
```bash
cargo test
```

### Deployment
To deploy a contract to the testnet:
```bash
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/escrow.wasm --source GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX --network testnet
```

## 🛡️ Security
Contracts are designed to be minimal and follow best practices for resource management on Soroban. All critical state changes are gated by administrative authorization from the bridge API to prevent unauthorized fund movement.
