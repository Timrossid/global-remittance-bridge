# EscrowContract Storage Keys

## Instance (singleton)

| Key | Type | Description |
|-----|------|-------------|
| `admin` | `Address` | Current escrow admin (set in `initialize`) |

## Persistent (per escrow)

| Key | Type | Description |
|-----|------|-------------|
| `next_id` | `u64` | Monotonically increasing escrow ID counter |
| `(escrow_id, sender)` | `Address` | Original sender |
| `(escrow_id, receiver)` | `Address` | Designated receiver |
| `(escrow_id, token)` | `Address` | Soroban token contract |
| `(escrow_id, amount)` | `i128` | Locked amount in token stroops |
| `(escrow_id, status)` | `u32` | Pending=0, Released=1, Refunded=2, Expired=3 |

## TTL policy

- Instance TTL: threshold 1,000, extend to 100,000
- Persistent TTL per field: threshold 1,000, extend to 100,000
- `next_id` TTL is extended every time a new escrow is created

## Events

| Topic | Payload |
|-------|---------|
| `init` | `Address` (admin) |
| `admin_xfer` | `Address, Address` (old, new) |
| `escrow_created` | `u64, Address, Address, Address, i128` |
| `escrow_released` | `u64, Address, i128` |
| `escrow_refunded` | `u64, Address, i128` |
| `escrow_expired` | (not yet emitted — add in v2) |
