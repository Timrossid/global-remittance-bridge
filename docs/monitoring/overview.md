# 📊 Monitoring & Analytics Overview

The Global Micro-Remittance Bridge utilizes a distributed monitoring strategy to ensure transaction integrity and system health.

## 🔍 Components

### 1. Transaction Indexer (`transaction-indexer`)
The primary component for blockchain monitoring.
- **Role:** Synchronizes Stellar network events with the internal PostgreSQL database.
- **Mechanism:** Periodly polls the Stellar Horizon server for payments associated with registered merchant wallets.
- **Detection:** Uses transaction memos as unique identifiers to reconcile on-chain payments with internal transaction records.
- **Log Monitoring:** High-level logging of new transactions, errors, and polling cycles.

### 2. Payment API Logs (`payment-api`)
Provides audit trails for all business-critical actions.
- **Audit Logs:** Tracks all user actions (onboarding, payments, KYC updates) in the `AuditLog` table.
- **Error Tracking:** Detailed error logging for Stellar interactions and database operations.
- **Notification Logs:** Tracks the success/failure of Email, SMS, and Webhook notifications.

### 3. Dashboard Analytics (`merchant-dashboard`)
Provides visual insights for SME users.
- **Real-time Metrics:** Displays total volume, pending settlements, and active customer counts.
- **Transaction History:** Provides a searchable, filterable history of all payments.

## 🛠️ Monitoring Workflow

1.  **Initiation:** A payment is created in the `payment-api`.
2.  **Network Event:** The payment is submitted to the Stellar network.
3.  **Detection:** The `transaction-indexer` detects the payment on the blockchain via Horizon.
4.  **Reconciliation:** The indexer matches the transaction memo to the internal ID and updates the status to `COMPLETED`.
5.  **Alerting:** The `payment-api` triggers notifications (Webhooks, SMS, Email) based on the status change.

## 📈 Future Enhizations

- **Prometheus/Grafana:** Implementation of a centralized metrics dashboard for infrastructure health.
- **ELK Stack:** Centralized log aggregation and advanced alerting for production environments.
- **Real-time WebSockets:** Pushing transaction updates directly to the Merchant Dashboard.
