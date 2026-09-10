#!/bin/bash
set -euo pipefail

echo "Starting secret rotation..."

# Rotate database password
echo "Rotating database password..."
NEW_DB_PASSWORD=$(openssl rand -base64 32)
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD="$NEW_DB_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -

# Rotate JWT secret
echo "Rotating JWT secret..."
NEW_JWT_SECRET=$(openssl rand -base64 64)
kubectl create secret generic payment-api-secret \
  --from-literal=JWT_SECRET="$NEW_JWT_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart deployments to pick up new secrets
echo "Restarting deployments..."
kubectl rollout restart deployment/payment-api -n remittance-bridge
kubectl rollout restart deployment/postgres -n remittance-bridge

echo "Secret rotation completed"
