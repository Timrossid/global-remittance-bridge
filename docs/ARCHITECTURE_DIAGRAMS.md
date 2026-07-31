# Architecture Diagrams

These diagrams describe the current Testnet-oriented implementation. They distinguish browser wallet signing from server-side orchestration and identify the trust boundaries that must be reviewed before Mainnet use.

## Component and trust-boundary diagram

```mermaid
flowchart LR
    merchant[Merchant browser] -->|HTTPS + JWT API calls| dashboard[Next.js merchant dashboard]
    dashboard -->|public read/API requests| api[NestJS Payment API]
    dashboard -->|build + simulate + sign| freighter[Freighter wallet]
    freighter -->|signed transaction only| rpc[Soroban RPC - Testnet]
    api -->|server-side Soroban/Horizon operations| rpc
    api --> db[(PostgreSQL / Prisma)]
    indexer[Transaction indexer] -->|Horizon polling| horizon[Stellar Horizon]
    horizon --> db
    rpc --> escrow[Escrow contract]
    rpc --> settlement[Settlement contract]
    api --> notify[Notifications]

    subgraph Browser trust boundary
      merchant
      dashboard
      freighter
    end

    subgraph Application trust boundary
      api
      db
      notify
    end

    subgraph Stellar network boundary
      rpc
      horizon
      escrow
      settlement
    end
```

### Trust-boundary rules

- Private wallet keys stay inside Freighter and are never sent to the dashboard, API, or CI.
- Browser contract calls are restricted to Testnet by configuration and endpoint checks.
- The API may hold a server signing key for its existing backend payment path; that key must not be reused as the browser wallet identity.
- Soroban contract state and transaction results are authoritative for on-chain settlement; database rows are an indexed application view and must be reconciled.
- CI deployment secrets are scoped to the protected `stellar-testnet` GitHub Environment and are not available to pull requests.

## Payment and escrow sequence

```mermaid
sequenceDiagram
    participant M as Merchant
    participant D as Dashboard
    participant F as Freighter
    participant R as Soroban RPC
    participant E as Escrow Contract
    participant I as Indexer
    participant DB as Application DB

    M->>D: Open /escrow
    D->>F: Check wallet and Testnet network
    M->>D: Enter receiver, token, amount
    D->>R: Build and simulate create_escrow
    R-->>D: Footprint, resources, return data
    D->>F: Request transaction signature
    F-->>D: Signed XDR
    D->>R: sendTransaction
    R->>E: Execute create_escrow
    E->>E: require_auth(sender)
    E->>E: Transfer tokens and persist PENDING escrow
    R-->>D: Transaction hash and status
    I->>R: Observe transaction/result
    I->>DB: Reconcile on-chain status
    D->>R: Poll getTransaction
    R-->>D: SUCCESS + escrow ID
```

## Administrative lifecycle

```mermaid
stateDiagram-v2
    [*] --> Uninitialized
    Uninitialized --> Initialized: initialize(admin) + admin auth
    Initialized --> Initialized: transfer_admin(current_admin,new_admin) + current admin auth
    Initialized --> EscrowPending: create_escrow(sender,...) + sender auth
    EscrowPending --> Released: release_funds(admin,id) + persisted admin auth
    EscrowPending --> Refunded: refund_funds(admin,id) + persisted admin auth
    Released --> [*]
    Refunded --> [*]
```

`initialize` is one-time. `transfer_admin` is the only role-change path. Existing published Testnet contracts may predate this lifecycle and must be redeployed and initialized before relying on it.

## Deployment promotion path

```mermaid
flowchart TD
    change[Contract change] --> ci[ Soroban CI: fmt, check, test, clippy, WASM build ]
    ci --> artifact[Immutable workflow artifact]
    artifact --> review{Protected stellar-testnet Environment approval}
    review -->|prepare_testnet| package[Review-only WASM package]
    review -->|deploy_testnet| deploy[Deploy exact artifacts to Stellar Testnet]
    deploy --> verify[Record C-addresses and verify explorer state]
    verify --> config[Update Testnet application configuration]
    mainnet[Mainnet promotion] -.-> audit[Independent audit + separate approvals]
```
