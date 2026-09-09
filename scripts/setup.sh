#!/usr/bin/env bash
# scripts/setup.sh
# One-command project setup for new contributors.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "==> Global Micro-Remittance Bridge — project setup"
echo "    Project root: $PROJECT_ROOT"

echo ""
echo "==> Installing payment-api dependencies..."
cd "$PROJECT_ROOT/payment-api"
npm ci
npx prisma generate

echo ""
echo "==> Installing merchant-dashboard dependencies..."
cd "$PROJECT_ROOT/merchant-dashboard"
npm ci

echo ""
echo "==> Installing Rust contract dependencies..."
cd "$PROJECT_ROOT/contracts"
cargo fetch

echo ""
echo "==> Setting up environment files..."
cd "$PROJECT_ROOT"

if [ ! -f payment-api/.env ]; then
  cp payment-api/.env.example payment-api/.env
  echo "    Created payment-api/.env"
else
  echo "    payment-api/.env already exists, skipping."
fi

if [ ! -f merchant-dashboard/.env.local ]; then
  cp merchant-dashboard/.env.example merchant-dashboard/.env.local
  echo "    Created merchant-dashboard/.env.local"
else
  echo "    merchant-dashboard/.env.local already exists, skipping."
fi

echo ""
echo "==> Building Soroban contracts (WASM)..."
cd "$PROJECT_ROOT/contracts"
stellar contract build

echo ""
echo "==> Setup complete."
echo ""
echo "Next steps:"
echo "  1. Edit payment-api/.env    — set DATABASE_URL, JWT_SECRET, STELLAR_SECRET"
echo "  2. Edit merchant-dashboard/.env.local — set NEXT_PUBLIC_API_URL if needed"
echo "  3. Start PostgreSQL and Redis"
echo "  4. Run migrations:  cd payment-api && npx prisma migrate deploy"
echo "  5. Start the API:   cd payment-api && npm run start:dev"
echo "  6. Start the dashboard: cd merchant-dashboard && npm run dev"
