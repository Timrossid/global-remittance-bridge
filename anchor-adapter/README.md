# 🔌 Anchor Adapter

Integration layer that standardizes communication with various Stellar Anchors.

## 🎯 Purpose
Every anchor (Circle, MoneyGram, etc.) has a different API. This repository provides a unified interface so the `payment-api` doesn't need to handle anchor-specific logic.

## 🛠️ Architecture
Using the **Adapter Pattern**, we define a common interface `IAnchorAdapter`:
- `getQuote()`: Standardized FX pricing.
- `initiateDeposit()`: Uniform deposit flow.
- `initiateWithdrawal()`: Uniform withdrawal flow.
- `checkKycStatus()`: Unified KYC verification.

## 📦 Supported Adapters
- **Circle:** Fully implemented mock adapter.
- **MoneyGram:** Placeholder for future implementation.

## 🚀 Usage
Implemented as a library used by the `payment-api`. New adapters can be added by implementing the `IAnchorAdapter` interface in the `/src` directory.
