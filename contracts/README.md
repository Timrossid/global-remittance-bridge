# 📜 Soroban Smart Contracts

This repository contains the smart contracts that power the trust and settlement layer of the Global Micro-Remittance Bridge. These contracts are written in Rust and deployed on the Stellar Soroban smart contract platform.

## 🏗️ Architecture

The contract layer provides two primary functions:

1.  **Escrow (`/escrow`):** Acts as a trusted intermediary for funds. It holds funds from the sender until the conditions are met (e.g., service delivery) and then releases them to the receiver or refunds them to the sender.
2.  **Settlement (`/settlement`):** Handles the logic for calculating and distributing fees and payouts to merchants once a transaction is confirmed.

## 🛠️ Contracts

### 📦 Escrow Contract (`/escrow`)
Handles the secure holding of funds during a transaction.
- `initialize`: Persists the first administrator once after deployment.
- `transfer_admin`: Rotates the persisted administrator through a two-party authenticated recovery flow; both old and new administrators must sign.
- `create_escrow`: Locks funds for a specific receiver after the contract has been initialized.
- `release_funds`: Releases funds to the receiver when the persisted administrator authenticates.
- `refund_funds`: Returns funds to the sender when the persisted administrator authenticates.

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
cargo build --target wasm32v1-none --release
```

### Testing
```bash
cargo test
```

The workspace includes contract-specific Rust tests under `escrow/src/test.rs` and `settlement/src/test.rs`. They cover token movement, state transitions, one-time initialization, persisted-admin checks, authenticated admin rotation, fee calculations, and invalid amounts. Run them before every deployment.

### Deployment
To deploy a contract to the testnet:
```bash
stellar contract deploy --wasm target/wasm32v1-none/release/escrow.wasm --source deployer --network testnet
```

## 🛡️ Security
The escrow release/refund paths require both Soroban authentication and equality with the persisted administrator. Administrative rotation is explicit through `transfer_admin`; there is no emergency bypass or automatic recovery. The published Testnet contract IDs predate this hardening and must be redeployed and initialized before relying on the stronger role checks. See `docs/SECURITY_GUIDE.md` for threat controls and review gates.
