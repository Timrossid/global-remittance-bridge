# Tests

Project-wide test documentation and fixtures.

## Structure

- `unit/` — reserved for unit tests that don't belong inside a single service package.
- `integration/` — cross-service integration scenarios.
- `data/` — small reference fixtures committed to git. Large datasets are gitignored.

## Running all tests

```bash
bash scripts/test-all.sh

# Skip E2E browser tests
bash scripts/test-all.sh --skip-e2e

# Skip Soroban contract tests (no Rust toolchain)
bash scripts/test-all.sh --skip-contracts
```

## Per-service tests

Each service also ships its own test suite:

```bash
# Payment API (Jest)
cd payment-api && npm test

# Merchant dashboard (Playwright)
cd merchant-dashboard && npm test

# Soroban contracts (cargo test)
cd contracts && cargo test --workspace
```
