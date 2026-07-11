# 🔍 Transaction Indexer

Blockchain monitoring service that synchronizes Stellar network events with the internal database.

## 🎯 Purpose
Since blockchain transactions are asynchronous, the indexer watches the network and updates the internal `Transaction` status to `COMPLETED` once a payment is confirmed on-chain.

## 🛠️ How it Works
1. **Polling:** Periodically polls the Stellar Horizon server for the latest payments to registered merchant wallets.
2. **Verification:** Checks the transaction hash against the database.
3. **Update:** Updates the `PaymentAPI` database to reflect the final settlement.

## 🚀 Running the Indexer
```bash
npm install
node src/index.js
```

## ⚙️ Config
Managed via `.env`:
- `DATABASE_URL`: Connection to the main PostgreSQL DB.
- `INDEX_INTERVAL`: Polling frequency.
