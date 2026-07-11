# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy the entire monorepo to allow for cross-package imports
COPY . .

# Install dependencies specifically for the payment-api
RUN cd payment-api && npm install

# Copy prisma schema and generate client
RUN cd payment-api && npx prisma generate --schema=prisma/schema.prisma

# Build the payment-api
RUN cd payment-api && npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files for production from the builder stage
COPY --from=builder /app/payment-api/package*.json ./payment-api/
COPY --from=builder /app/payment-api/dist ./payment-api/dist
COPY --from=builder /app/payment-api/prisma ./payment-api/prisma
COPY --from=builder /app/node_modules ./node_modules

# Generate prisma client in the production stage
RUN cd payment-api && npx prisma generate --schema=prisma/schema.prisma

# Set workdir to the api folder for execution
WORKDIR /app/payment-api

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
