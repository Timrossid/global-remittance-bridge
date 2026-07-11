# ⚖️ Settlement Contract Documentation

The `SettlementContract` manages the post-transaction logic, specifically the distribution of funds and protocol fees.

## 📋 Contract Overview

- **Purpose:** Automate the payout of funds to merchants and the collection of protocol fees.
- **Platform:** Stellar Soroban
- **Language:** Rust

## 🛠️ Function Reference

### `process_settlement`

Handles the payout to a merchant.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `merchant` | `Address` | The merchant account receiving the payout. |
| `amount` | `i128` | The total amount to be processed. |

**Authorization:** Typically called by the bridge administrative service.

---

### `distribute_fees`

Transfers protocol fees to the treasury account.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `treasury` | `Address` | The treasury account receiving the fees. |
| `fee_amount` | `i128` | The amount of fees to distribute. |

**Authorization:** Typically called by the bridge administrative service.

## 🧪 Usage Example (Pseudo-code)

```rust
// 1. Process Settlement
contract.process_settlement(merchant_address, amount);

// 2. Distribute Fees
contract.distribute_fees(treasury_address, fee_amount);
```
