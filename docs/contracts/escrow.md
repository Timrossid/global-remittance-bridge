# 🔒 Escrow Contract Documentation

The `EscrowContract` is a secure vault that facilitates trustless cross-border payments by holding funds in escrow until specific conditions are met.

## 📋 Contract Overview

- **Purpose:** Securely hold funds from a sender and release them to a receiver or refund them to the sender.
- **Platform:** Stellar Soroban
- **Language:** Rust

## 🛠️ Function Reference

### `create_escrow`

Creates a new escrow instance and locks the specified amount of tokens.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `sender` | `Address` | The account initiating the escrow. |
| `receiver` | `Address` | The account that will receive the funds. |
| `token` | `Address` | The address of the SPL token to be escrowed. |
| `amount` | `i128` | The amount of tokens to lock. |

**Returns:** `u64` (The unique Escrow ID)

**Authorization:** Requires `sender` authorization.

---

### `release_funds`

Releases the escrowed funds to the designated receiver.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `admin` | `Address` | The administrative account authorized to release funds. |
| `escrow_id` | `u64` | The unique ID of the escrow instance. |

**Authorization:** Requires `admin` authorization.

---

### `refund_funds`

Returns the escrowed funds back to the original sender.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `admin` | `Address` | The administrative account authorized to refund funds. |
| `escrow_id` | `u64` | The unique ID of the escrow instance. |

**Authorization:** Requires `admin` authorization.

## 🔄 State Machine

The escrow follows a simple state machine:

1.  **PENDING (0):** The initial state. Funds are locked and awaiting action.
2.  **RELEASED (1):** Funds have been successfully transferred to the receiver.
3.  **REFUNDED (2):** Funds have been returned to the sender.

## 🧪 Usage Example (Pseudo-code)

```rust
// 1. Create Escrow
let escrow_id = contract.create_escrow(sender, receiver, token, amount);

// 2. Release Funds (Admin)
contract.release_funds(admin, escrow_id);
```
