# Independent Security Review Scope

This document defines the review package required before any Mainnet deployment. It is a preparation checklist, not an audit report and not evidence that an external review has already been completed.

## Review scope

An independent reviewer with Soroban/Rust and application-security experience should assess:

### Soroban contracts

- Escrow initialization, administrator authorization, and authenticated `transfer_admin` rotation.
- `create_escrow`, `release_funds`, and `refund_funds` authorization and state transitions.
- Token transfer correctness, amount validation, replay/duplicate action behavior, and storage key separation.
- Instance and persistent storage TTL assumptions, rent/expiration recovery, and operational maintenance.
- Settlement fee calculation, merchant/treasury transfers, admin fee distribution, and amount edge cases.
- Cross-contract and token-contract trust assumptions, event/indexing behavior, and denial-of-service risks.

### Browser and wallet integration

- Testnet-only network/RPC enforcement and configuration validation.
- Freighter address/network checks, signed-XDR handling, transaction simulation/assembly, submission, and polling.
- Browser error handling, transaction-status ambiguity, replay behavior, and user confirmation boundaries.
- Confirmation that the CI wallet/RPC mocks cannot be enabled in production builds.

### Payment API and operations

- Soroban RPC error handling and transaction reconciliation.
- Authentication, authorization, secret handling, refresh-token lifecycle, and database access controls.
- Deployment workflow permissions, artifact provenance, Environment protection, secret exposure, and rollback procedures.
- Dependency, container, logging, monitoring, incident-response, and key-rotation practices.

## Evidence package

Provide the reviewer with:

- The pinned commit under review and reproducible build/test commands.
- `contracts/` source, `Cargo.lock`, WASM hashes, and the Rust test/Clippy output.
- `merchant-dashboard/lib/soroban.ts`, browser tests, and the live Testnet runbook.
- Payment API source, Prisma schema/migrations, dependency lockfile, and API test output.
- `.github/workflows/soroban.yml`, `security.yml`, build/test/lint workflows, and deployment configuration.
- Threat model, architecture diagrams, contract IDs, initialization evidence, and sanitized Testnet transaction links.

Never include private keys, seed phrases, Freighter recovery material, database passwords, or unredacted production logs.

## Acceptance gates

Before Mainnet consideration, record:

1. A signed or attributable independent review report with findings and severity.
2. Remediation commits for all critical/high findings, or documented risk acceptance by project maintainers.
3. Regression tests for each fixed finding.
4. Verified Testnet redeployment and initialization of the reviewed WASM hashes.
5. Separate Mainnet credentials, Environment approvals, monitoring, rollback, and incident-response sign-off.

Until these artifacts exist, the project must describe the security review as **pending** and must not claim audit completion or Mainnet readiness.
