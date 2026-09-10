FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY package.json package-lock.json tsconfig.json next.config.js ./
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY public ./public
RUN npm run build

FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
