# Screenshots

This directory contains the required submission screenshots for the Global Micro-Remittance Bridge project.

## Required Screenshots

- `dashboard.png` — main merchant dashboard UI (fresh capture, 2026-08-01)
- `transactions.png` — transactions page showing filters and transaction rows (fresh capture, 2026-08-01)
- `wallet.png` — Treasury Wallet page: volume, wallet address, KYC/network/settlement status (fresh capture, 2026-08-01)
- `analytics.png` — analytics or monitoring dashboard view (fresh capture, 2026-08-01)
- `mobile-view.png` — mobile-responsive dashboard layout (fresh capture, 2026-08-01)
- `escrow.png` — /escrow browser-signing page with Connect Freighter, pre-filled token, and contract cross-check (fresh capture, 2026-08-01)
- `contract-deployed-current.png` / `settlement-deployed-current.png` — deployed hardened contracts on Stellar Expert
- `contract-deployed.png` — historical pre-hardening deployment screenshot
- `wallet-interactions.png` — proof of Stellar wallet interactions
- `testnet_traction.csv` — 12 verified Stellar Testnet transaction hashes

## Capture Notes

Fresh captures are produced against the **real running full stack**: a dashboard dev
server wired to the local Payment API (`NEXT_PUBLIC_API_URL=http://localhost:3001`)
backed by local Postgres, logged in as the seeded demo merchant
(`demo-screenshot@example.com`), which surfaces the 12 verified Testnet hashes listed in
`testnet_traction.csv`. No route interception or mocked API responses are used — every
asset reflects the real running system. The root `README.md` inlines these images in
its **Screenshots** section; keep filenames stable so those image links keep resolving
on GitHub.

To re-capture: start the local Payment API (see `payment-api/`), start the dashboard
dev server with `NEXT_PUBLIC_API_URL=http://localhost:3001`, then from
`merchant-dashboard/` run `DEMO_BASE_URL=http://localhost:3100 npm run demo:capture`
(logs in as the seeded merchant; falls back to registering a fresh merchant).

## Analytics Page

The analytics dashboard is available at `/analytics` and shows:
- Daily transaction volume bar chart (30-day trend)
- Status breakdown donut chart (COMPLETED, PENDING, FAILED, CANCELLED)
- Currency distribution donut chart
- Summary statistics

This page is powered by the new `GET /merchants/me/analytics` API endpoint.

## Demo Asset Notes

- Use the live demo and the root README for project URLs and contract references.
- For the wallet interaction proof, the 12 verified Stellar testnet transaction hashes are listed in `testnet_traction.csv` and `DEMO_SUBMISSION_NOTES.md`.
- Record a 2-minute walkthrough of the end-to-end payment flow for the demo video (see `DEMO_VIDEO_GUIDE.md` and the automated `demo:record` script).
