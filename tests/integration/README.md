# Integration Tests

Cross-service tests that verify the full stack works together.

## Structure

- `unit/` — unit tests live inside each service package.
- `integration/` — cross-service integration test scenarios.
- `data/` — small reference fixtures committed to git.

## Running

```bash
# All tests (unit + integration + E2E)
bash scripts/test-all.sh

# Skip E2E browser tests
bash scripts/test-all.sh --skip-e2e

# Skip Soroban contract tests (no Rust toolchain)
bash scripts/test-all.sh --skip-contracts
```

## Adding a new scenario

1. Create a new directory under `tests/integration/<scenario-name>/`.
2. Add any fixtures to `tests/data/`.
3. Wire the scenario into `scripts/test-all.sh` if it should run in CI.
