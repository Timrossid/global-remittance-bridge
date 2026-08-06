# API Guide

The Payment API is a NestJS REST service that powers the Global Micro-Remittance Bridge.

**Base URL (local):** `http://localhost:3001`  
**Base URL (production):** `https://global-remittance-api.onrender.com`

All protected endpoints require:
```http
Authorization: Bearer <jwt_token>
```

---

## Authentication

### Register a new merchant

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Acme Corp",
  "email": "merchant@acme.com",
  "password": "securepass123",
  "walletAddress": "GABC..."
}
```

Response `201`:
```json
{
  "access_token": "eyJ...",
  "merchant_id": "uuid",
  "merchant": { "id": "...", "name": "Acme Corp", "email": "...", "walletAddress": "G..." }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{ "email": "merchant@acme.com", "password": "securepass123" }
```

Response `200`:
```json
{ "access_token": "eyJ...", "merchant": { ... } }
```

---

## Merchant

### Get profile
```http
GET /merchants/me
Authorization: Bearer <token>
```

### Get dashboard stats
```http
GET /merchants/me/stats
Authorization: Bearer <token>
```

Response:
```json
{
  "totalVolume": 4500.00,
  "pendingSettlements": 2,
  "completedCount": 18,
  "activeCustomers": 7,
  "totalTransactions": 20
}
```

### Get transaction history
```http
GET /merchants/me/transactions
Authorization: Bearer <token>
```

---

## Payments

### Create a payment record
```http
POST /payments/create
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "USDC",
  "merchantId": "uuid",
  "customerId": "uuid"
}
```

### Initiate a Stellar transfer (server-signed)
```http
POST /payments/transfer
Authorization: Bearer <token>
Content-Type: application/json

{ "amount": 50.00, "asset": "XLM" }
```

### Create a Soroban escrow payment
```http
POST /payments/escrow
Authorization: Bearer <token>
Content-Type: application/json

{
  "senderAddress": "G...",
  "tokenAddress": "C...",
  "amount": 10000000
}
```

### Get a payment
```http
GET /payments/:id
```

### Update payment status
```http
PUT /payments/:id/status
Content-Type: application/json

{ "status": "COMPLETED" }
```

---

## Anchors (Fiat On/Off-Ramp)

### Get a conversion quote
```http
GET /anchors/quote?from=USD&to=USDC&amount=100
```

### Initiate a deposit
```http
POST /anchors/deposit
Authorization: Bearer <token>
Content-Type: application/json

{ "anchor": "CIRCLE", "amount": 100, "asset": "USDC", "userId": "uuid" }
```

---

## Error Codes

| Code | Meaning |
|---|---|
| `400` | Bad Request — missing or invalid fields |
| `401` | Unauthorized — missing or expired JWT |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — email or wallet already registered |
| `500` | Internal Server Error |
