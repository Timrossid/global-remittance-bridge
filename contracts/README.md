# Soroban Smart Contracts

Rust Soroban contracts for the Global Micro-Remittance Bridge.

## Workspace members

| Contract | Path | Purpose |
|----------|------|---------|
| `escrow` | `contracts/escrow/` | Holds funds in escrow until release or refund |
| `settlement` | `contracts/settlement/` | Splits gross settlement between merchant and protocol treasury |

## Prerequisites

- Rust stable with `wasm32v1-none` target
- Stellar CLI 27.0.0

## Build and test

```bash
cd contracts
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
stellar contract build
```

## Deployment

Contracts are deployed to Stellar testnet via the protected `stellar-testnet`
GitHub Environment. See `.github/workflows/soroban.yml`.

## Key features

- **Escrow**: admin-based release/refund, TTL-managed persistent storage, event emission, version metadata, expire_escrow, storage cleanup on terminal transitions.
- **Settlement**: multi-sig admin list, 50 BPS (0.5%) protocol fee, event emission, version metadata.
