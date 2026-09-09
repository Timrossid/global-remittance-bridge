#!/usr/bin/env bash
# scripts/test-all.sh
# Run the full test suite for the project.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKIP_E2E=false
SKIP_CONTRACTS=false

for arg in "$@"; do
  case $arg in
    --skip-e2e) SKIP_E2E=true ;;
    --skip-contracts) SKIP_CONTRACTS=true ;;
  esac
done

echo "==> Running full test suite"
echo ""

echo "==> [1/4] Payment API unit tests"
cd "$PROJECT_ROOT/payment-api"
npm ci --ignore-scripts
npm test

echo ""
echo "==> [2/4] Merchant dashboard lint + typecheck"
cd "$PROJECT_ROOT/merchant-dashboard"
npm ci --ignore-scripts
npm run lint
npx tsc --noEmit

if [ "$SKIP_CONTRACTS" = false ]; then
  echo ""
  echo "==> [3/4] Soroban contract tests"
  cd "$PROJECT_ROOT/contracts"
  cargo test --workspace
else
  echo ""
  echo "==> [3/4] Soroban contract tests (skipped)"
fi

if [ "$SKIP_E2E" = false ]; then
  echo ""
  echo "==> [4/4] Dashboard E2E tests (Playwright)"
  cd "$PROJECT_ROOT/merchant-dashboard"
  npx playwright install --with-deps chromium
  env \
    NEXT_PUBLIC_API_URL='http://127.0.0.1:3001' \
    NEXT_PUBLIC_NETWORK=testnet \
    NEXT_PUBLIC_CONTRACT_ID=CD2YDPGFZCSXY3UAFJSO47GC5S3KDVECPL5SCCQQXIPTEBLDWMYPG44D \
    NEXT_PUBLIC_ESCROW_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
    NEXT_PUBLIC_ENABLE_TEST_WALLET_MOCK=true \
    npm test
else
  echo ""
  echo "==> [4/4] Dashboard E2E tests (skipped)"
fi

echo ""
echo "==> All test suites passed."
