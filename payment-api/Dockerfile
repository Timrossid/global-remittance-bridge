# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Copy the full monorepo so cross-package imports (anchor-adapter) resolve
COPY . .

WORKDIR /app/payment-api

# Install all deps (including devDeps needed for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Build — output goes to /app/payment-api/dist/payment-api/src/main.js
RUN npm run build

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app/payment-api

RUN apk add --no-cache libc6-compat openssl

# Copy only what's needed to run
COPY --from=builder /app/payment-api/package*.json ./
COPY --from=builder /app/payment-api/dist ./dist
COPY --from=builder /app/payment-api/prisma ./prisma
COPY --from=builder /app/payment-api/node_modules ./node_modules
COPY --from=builder /app/payment-api/deploy.sh ./deploy.sh

# Re-generate Prisma client for this platform
RUN npx prisma generate && chmod +x deploy.sh

EXPOSE 3001

CMD ["sh", "deploy.sh"]
