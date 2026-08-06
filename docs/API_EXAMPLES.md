# API Examples

Practical curl examples for the Payment API. Replace `<TOKEN>` and `<API_URL>` with your values.

## Register a merchant

```bash
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "email": "merchant@acme.com",
    "password": "securepass123",
    "walletAddress": "GABC..."
  }'
```

## Login

```bash
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "merchant@acme.com", "password": "securepass123" }'
# Save the returned access_token as TOKEN
```

## Get dashboard stats

```bash
curl $API_URL/merchants/me/stats \
  -H "Authorization: Bearer $TOKEN"
```

## Get transaction history

```bash
curl $API_URL/merchants/me/transactions \
  -H "Authorization: Bearer $TOKEN"
```

## Initiate a Stellar transfer

```bash
curl -X POST $API_URL/payments/transfer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 10.00, "asset": "XLM" }'
```

## Create a Soroban escrow

```bash
curl -X POST $API_URL/payments/escrow \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderAddress": "GSENDER...",
    "tokenAddress": "CTOKEN...",
    "amount": 10000000
  }'
```

## Update payment status

```bash
curl -X PUT $API_URL/payments/$TX_ID/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "COMPLETED" }'
```

## Get a quote from the anchor

```bash
curl "$API_URL/anchors/quote?from=USD&to=USDC&amount=100"
```
