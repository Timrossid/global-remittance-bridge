# Database Queries to Find the Screenshot Merchant

Use these SQL queries against your deployed PostgreSQL database (Supabase / Render) to identify the merchant account used for the screenshots.

> **Note:** Replace `your_database_name` with the actual database name if needed. These queries assume the Prisma-generated table names: `"Merchant"` and `"Transaction"`.

---

## 1. Find the most active merchant (likely the screenshot merchant)

```sql
SELECT 
  m."id" AS merchantId,
  m."name",
  m."email",
  m."walletAddress",
  m."kycStatus",
  m."createdAt",
  COUNT(t."id") AS transaction_count,
  SUM(CAST(t."amount" AS NUMERIC)) AS total_volume
FROM "Merchant" m
LEFT JOIN "Transaction" t ON t."merchantId" = m."id"
GROUP BY m."id", m."name", m."email", m."walletAddress", m."kycStatus", m."createdAt"
ORDER BY transaction_count DESC, total_volume DESC
LIMIT 5;
```

**How to use:** Run this first. The top result is likely the merchant used for screenshots if it was the most active test account.

---

## 2. Find merchants with transactions created around the screenshot date

If you know roughly when the screenshots were captured (e.g., July 2026), filter by date:

```sql
SELECT 
  m."id" AS merchantId,
  m."name",
  m."email",
  m."walletAddress",
  COUNT(t."id") AS tx_count,
  MAX(t."createdAt") AS latest_tx
FROM "Merchant" m
JOIN "Transaction" t ON t."merchantId" = m."id"
WHERE t."createdAt" >= '2026-07-01'::timestamp
  AND t."createdAt" <  '2026-08-01'::timestamp
GROUP BY m."id", m."name", m."email", m."walletAddress"
ORDER BY latest_tx DESC;
```

---

## 3. Find the merchant linked to a specific Stellar transaction hash

If you identified a transaction hash from the screenshots (e.g., visible in the transaction table), look it up directly:

```sql
SELECT 
  m."id" AS merchantId,
  m."name",
  m."email",
  m."walletAddress",
  t."id" AS transaction_id,
  t."amount",
  t."currency",
  t."status",
  t."stellarTxHash",
  t."createdAt"
FROM "Transaction" t
JOIN "Merchant" m ON m."id" = t."merchantId"
WHERE t."stellarTxHash" = 'PASTE_HASH_HERE';
```

**Example with one of the hashes from `DEMO_SUBMISSION_NOTES.md`:**

```sql
SELECT 
  m."id" AS merchantId,
  m."name",
  m."email",
  m."walletAddress"
FROM "Transaction" t
JOIN "Merchant" m ON m."id" = t."merchantId"
WHERE t."stellarTxHash" = '53c5c09e7153e5fc731b8a917e157fd2c09ca5b79fbc51ffb4fc6cfddf163426';
```

---

## 4. Find merchants with COMPLETED transactions and high volume

```sql
SELECT 
  m."id" AS merchantId,
  m."name",
  m."email",
  m."walletAddress",
  COUNT(t."id") AS completed_tx_count,
  SUM(CAST(t."amount" AS NUMERIC)) AS completed_volume
FROM "Merchant" m
JOIN "Transaction" t ON t."merchantId" = m."id"
WHERE t."status" = 'COMPLETED'
GROUP BY m."id", m."name", m."email", m."walletAddress"
ORDER BY completed_volume DESC
LIMIT 10;
```

---

## 5. Check if a specific wallet address was used

If you can read a wallet address from the screenshot (e.g., from the wallet page or profile), search for it directly:

```sql
SELECT 
  "id" AS merchantId,
  "name",
  "email",
  "walletAddress",
  "kycStatus",
  "createdAt"
FROM "Merchant"
WHERE "walletAddress" = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
```

---

## 6. Full merchant profile with latest transactions

```sql
SELECT 
  m."id" AS merchantId,
  m."name",
  m."email",
  m."walletAddress",
  m."kycStatus",
  m."createdAt",
  t."id" AS transaction_id,
  t."amount",
  t."currency",
  t."status",
  t."stellarTxHash",
  t."createdAt" AS tx_createdAt
FROM "Merchant" m
LEFT JOIN "Transaction" t ON t."merchantId" = m."id"
ORDER BY m."createdAt" DESC, t."createdAt" DESC
LIMIT 20;
```

---

## 7. Count total merchants and transactions (sanity check)

```sql
SELECT 
  (SELECT COUNT(*) FROM "Merchant") AS total_merchants,
  (SELECT COUNT(*) FROM "Transaction") AS total_transactions,
  (SELECT COUNT(*) FROM "Transaction" WHERE stellarTxHash IS NOT NULL) AS on_chain_txs;
```

---

## How to Run These Queries

### Option A: Supabase Dashboard
1. Go to your Supabase project → **SQL Editor**
2. Paste the query
3. Click **Run**

### Option B: psql (command line)
```bash
psql "postgresql://username:password@host:6543/database?sslmode=require" -c "$(cat queries.sql)"
```

### Option C: Prisma Studio
```bash
cd payment-api
npx prisma studio
# Then use the built-in query editor or filter visually
```

### Option D: Render Shell
1. Go to your Render service → **Shell**
2. Run:
```bash
psql $DATABASE_URL -c "SELECT ..."
```

---

## Expected Output Format

A typical result for query #1 would look like:

| merchantId | name | email | walletAddress | transaction_count | total_volume |
|---|---|---|---|---|---|
| `abc123...` | `Demo Merchant` | `demo@test.com` | `GABC...` | 12 | 1500.50 |

The `merchantId` column is the UUID you need.

---

## Fallback: If No Rows Are Returned

If the above queries return no rows, the database may not have on-chain hashes indexed yet, or the tables are empty. Use these fallback queries to inspect what data exists.

### F1. List all merchants

```sql
SELECT 
  "id" AS merchantId,
  "name",
  "email",
  "walletAddress",
  "kycStatus",
  "createdAt"
FROM "Merchant"
ORDER BY "createdAt" DESC
LIMIT 20;
```

### F2. List all transactions without requiring stellarTxHash

```sql
SELECT 
  t."id" AS transaction_id,
  t."amount",
  t."currency",
  t."status",
  t."stellarTxHash",
  t."merchantId",
  m."name" AS merchant_name,
  t."createdAt"
FROM "Transaction" t
JOIN "Merchant" m ON m."id" = t."merchantId"
ORDER BY t."createdAt" DESC
LIMIT 50;
```

### F3. Find the most recently created merchant

```sql
SELECT 
  "id" AS merchantId,
  "name",
  "email",
  "walletAddress",
  "kycStatus",
  "createdAt"
FROM "Merchant"
ORDER BY "createdAt" DESC
LIMIT 1;
```

### F4. Count rows in key tables

```sql
SELECT 
  (SELECT COUNT(*) FROM "Merchant") AS total_merchants,
  (SELECT COUNT(*) FROM "Transaction") AS total_transactions,
  (SELECT COUNT(*) FROM "Transaction" WHERE "stellarTxHash" IS NOT NULL) AS on_chain_txs;
```

---

## Notes

- Table names are case-sensitive in PostgreSQL when quoted in Prisma schema. Use `"Merchant"` and `"Transaction"` exactly as shown.
- The `"stellarTxHash"` column is unique and nullable. If a transaction has a hash, it means it was indexed from the Stellar network.
- The `"createdAt"` timestamps are in UTC.
- If all tables are empty, the screenshot merchant may have been created in a different database environment (local dev vs production).
