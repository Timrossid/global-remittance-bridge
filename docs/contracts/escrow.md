# 🔒 Escrow Contract Documentation

The `EscrowContract` is a Soroban vault that holds funds until an explicitly persisted administrator releases or refunds them. The contract keeps its instance entry alive with a bounded TTL extension when the role is initialized, rotated, or used. The contract is not trustless governance: the administrator is a privileged role and must be initialized, protected, rotated, and monitored before production use.

## 📋 Contract Overview

- **Purpose:** Hold funds from a sender and release or refund them under a persisted, authenticated administrator role.
- **Platform:** Stellar Soroban
- **Language:** Rust

## 🛠️ Function Reference

### `initialize`

Sets the administrator once after deployment. The address must authenticate, and a second initialization attempt fails.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `admin` | `Address` | Initial administrator for release, refund, and admin rotation. |

### `transfer_admin`

Rotates the persisted administrator. Both the current administrator and the replacement administrator must authenticate, preventing an accidental transfer to an unacknowledged address.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `current_admin` | `Address` | Existing persisted administrator. |
| `new_admin` | `Address` | Replacement administrator. |

### `create_escrow`

Creates a new escrow instance and locks the specified amount of tokens.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `sender` | `Address` | The account initiating the escrow. |
| `receiver` | `Address` | The account that will receive the funds. |
| `token` | `Address` | The address of the SPL token to be escrowed. |
| `amount` | `i128` | The amount of tokens to lock. |

**Returns:** `u64` (The unique Escrow ID)

**Authorization:** Requires `sender` authorization. The contract must already be initialized with `initialize(admin)`; otherwise the call is rejected before token transfer.

---

### `release_funds`

Releases the escrowed funds to the designated receiver.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `admin` | `Address` | The administrative account authorized to release funds. |
| `escrow_id` | `u64` | The unique ID of the escrow instance. |

**Authorization:** Requires `admin` authorization and equality with the persisted administrator configured by `initialize`.

---

### `refund_funds`

Returns the escrowed funds back to the original sender.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `admin` | `Address` | The administrative account authorized to refund funds. |
| `escrow_id` | `u64` | The unique ID of the escrow instance. |

**Authorization:** Requires `admin` authorization and equality with the persisted administrator configured by `initialize`.

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
