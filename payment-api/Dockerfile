FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm ci && npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/main.js"]
