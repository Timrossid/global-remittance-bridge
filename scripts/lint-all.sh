#!/usr/bin/env bash
# scripts/lint-all.sh
# Run all linters across the project.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "==> Running all linters"
echo ""

echo "==> [1/3] payment-api ESLint"
cd "$PROJECT_ROOT/payment-api"
npm run lint

echo ""
echo "==> [2/3] merchant-dashboard ESLint"
cd "$PROJECT_ROOT/merchant-dashboard"
npm run lint

echo ""
echo "==> [3/3] Rust contracts formatting check"
cd "$PROJECT_ROOT/contracts"
cargo fmt --all -- --check

echo ""
echo "==> All linters passed."
