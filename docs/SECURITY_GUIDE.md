# Security Guide

This guide describes the controls currently implemented in the Global Micro-Remittance Bridge and the checks required before any production deployment. It is not an independent security audit or a Mainnet approval.

## Security boundaries

| Boundary | Control | Evidence |
|---|---|---|
| Browser to wallet | Private keys remain in Freighter; the dashboard receives only a public address and signed XDR. | `merchant-dashboard/lib/soroban.ts` |
| Browser network | Browser escrow flow accepts only Stellar Testnet and the canonical Testnet Soroban RPC endpoint. | `assertTestnetConfiguration()` |
| Contract administration | Escrow persists an administrator once, checks authentication and address equality, and supports authenticated rotation. | `contracts/escrow/src/lib.rs` |
| Contract state | Escrows transition only from `PENDING` to `RELEASED` or `REFUNDED`; terminal states reject repeat actions. | Escrow unit tests |
| API RPC handling | Soroban RPC errors and transaction polling failures are surfaced rather than silently treated as success. | `payment-api/src/common/soroban.service.ts` tests |
| Deployment | Contract CI must pass before artifacts are uploaded; deployment is manual, Testnet-only, and protected by a GitHub Environment. | `.github/workflows/soroban.yml` |
| Secrets | The deployer public key is passed as the source account; the private key is exposed only through `STELLAR_SIGN_WITH_KEY` in the approved job. | Testnet deployment workflow |

## Threat model and mitigations

### Unauthorized escrow release or refund

- `initialize(admin)` requires the administrator's authorization and can run only once.
- `release_funds` and `refund_funds` require both `admin.require_auth()` and equality with the persisted admin address.
- `transfer_admin` requires both the current persisted administrator and the replacement administrator to authenticate.
- The instance admin entry is extended with a bounded TTL whenever it is initialized, rotated, or used, reducing the risk of role expiry on long-lived deployments. TTL extension cannot recover an instance entry after it has fully expired, so operators must monitor rent/expiration and exercise the documented maintenance cadence.
- The dashboard does not expose release/refund as arbitrary browser actions.
- Test coverage includes missing initialization, missing authentication, wrong authenticated admin, one-time initialization, admin rotation, and terminal-state rejection.

### Malicious or misleading browser configuration

- The browser flow rejects non-Testnet network configuration.
- The RPC URL is checked against `https://soroban-testnet.stellar.org`.
- Stellar addresses and positive integer token amounts are validated before transaction construction.
- The CI wallet mock is gated by `NEXT_PUBLIC_ENABLE_TEST_WALLET_MOCK=true`; it must remain unset or false in production deployments.

### Compromised CI or deployment credentials

- Pull requests do not receive the `stellar-testnet` Environment secret.
- Deployment is available only through `workflow_dispatch` and requires the protected Environment's reviewers.
- The workflow deploys artifacts produced by the preceding contract CI job rather than rebuilding unreviewed code in the deploy job.
- Use a dedicated, minimally funded Testnet deployer account; rotate the key after suspected exposure.
- Never put Mainnet credentials in the `stellar-testnet` Environment.

### Database/indexer divergence

- The database is an application projection, not the source of truth for token movement.
- Transaction hashes and Soroban statuses must be reconciled against RPC/Horizon before marking payments complete.
- Operational monitoring should alert on transactions stuck in `PENDING`, RPC failures, and mismatched database/on-chain states.

## Automated checks currently available

```bash
# Contract formatting, tests, and static checks
cd contracts
cargo fmt --all -- --check
cargo test --workspace
cargo clippy --workspace --all-targets -- -D warnings

# API unit tests
cd ../payment-api
npm test

# Dashboard typecheck and browser tests
cd ../merchant-dashboard
npx tsc --noEmit
npx playwright test
```

The dashboard CI tests use deliberately scoped, non-production Testnet seams: one verifies authenticated `/escrow` wallet connection and function cross-check rendering, while the full-flow case mocks the Soroban RPC wire boundary and Freighter signing handoff. It exercises real SDK transaction construction, simulation assembly, signed-XDR parsing, submission, `NOT_FOUND` polling, and success rendering without a browser extension or real funds. It does not replace a manual Freighter/Testnet transaction check or an independent live RPC integration test.

The repository also runs automated dependency checks in `.github/workflows/security.yml`. Current npm scans report high-severity findings in dependency trees that require staged major-version migrations; these findings remain visible release blockers. Automated dependency scanning, Rust tests, and Clippy do not constitute the independent security review required by [`docs/SECURITY_REVIEW_SCOPE.md`](SECURITY_REVIEW_SCOPE.md).

## Pre-Mainnet gates

These items must be completed and recorded separately before Mainnet:

- Redeploy the hardened escrow WASM and call `initialize` with a dedicated administrator.
- Confirm instance TTL extension behavior and establish an operational cadence for monitoring contract storage rent/expiration.
- Verify `transfer_admin`, release, refund, and terminal-state behavior on Testnet using the deployed WASM.
- Add a reviewed administrator rotation/recovery runbook and key custody policy.
- Complete a manual Freighter/Testnet verification of the browser transaction flow; deterministic mocked RPC coverage for simulation, signing, submission, and polling is covered by CI.
- Run dependency and container vulnerability scans and remediate high-severity findings.
- Perform an independent Soroban and application security review; repository tests and Clippy are not an audit.
- Define incident response, deploy rollback, transaction reconciliation, and secret rotation procedures.
- Obtain separate Mainnet Environment approvals and use separate Mainnet credentials.

## Reporting

Do not publish sensitive exploit details in a public issue. Follow the repository security policy in `SECURITY.md` and provide reproducible steps, affected component, and impact assessment through the private reporting channel.
