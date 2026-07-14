#!/bin/sh
# deploy.sh — run before starting the API in production
# Handles two cases:
#   1. Fresh database (no tables): migrate deploy creates everything
#   2. Existing database (P3005 baseline error): resolve the initial migration
#      as already applied, then deploy any future ones

set -e

echo "Running Prisma migrations..."

# Try a normal migrate deploy first
if npx prisma migrate deploy; then
  echo "Migrations applied successfully."
else
  EXIT_CODE=$?
  echo "migrate deploy failed (exit $EXIT_CODE) — attempting baseline..."

  # Mark the initial migration as already applied without running the SQL
  npx prisma migrate resolve --applied 0001_initial

  echo "Baseline applied. Running migrate deploy again..."
  npx prisma migrate deploy
fi

echo "Starting server..."
exec node dist/payment-api/src/main.js
