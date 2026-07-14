#!/bin/sh
# deploy.sh — handles both fresh and existing (Supabase) databases
# P3005 means the DB has tables but no _prisma_migrations history (baseline needed)

echo "==> Running database migrations..."

# Temporarily allow failures so we can inspect the exit code
set +e
npx prisma migrate deploy
MIGRATE_EXIT=$?
set -e

if [ $MIGRATE_EXIT -eq 0 ]; then
  echo "==> Migrations applied successfully."
else
  echo "==> migrate deploy failed (exit $MIGRATE_EXIT) — baselining existing database..."
  # Mark the initial migration as already applied without re-running the SQL
  npx prisma migrate resolve --applied 0001_initial
  echo "==> Baseline recorded. Re-running migrate deploy..."
  npx prisma migrate deploy
  echo "==> Migrations complete."
fi

echo "==> Starting server..."
exec node dist/payment-api/src/main.js
