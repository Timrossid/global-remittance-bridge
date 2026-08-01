# Screenshots

This directory contains the required submission screenshots for the Global Micro-Remittance Bridge project.

## Required Screenshots

- `dashboard.png` — main merchant dashboard UI (fresh capture, 2026-08-01)
- `transactions.png` — transactions page showing filters and transaction rows (fresh capture, 2026-08-01)
- `wallet.png` — Treasury Wallet page: volume, wallet address, KYC/network/settlement status (fresh capture, 2026-08-01)
- `analytics.png` — analytics or monitoring dashboard view (fresh capture, 2026-08-01)
- `mobile-view.png` — mobile-responsive dashboard layout (fresh capture, 2026-08-01)
- `contract-deployed-current.png` / `settlement-deployed-current.png` — deployed hardened contracts on Stellar Expert
- `contract-deployed.png` — historical pre-hardening deployment screenshot
- `wallet-interactions.png` — proof of Stellar wallet interactions
- `testnet_traction.csv` — 12 verified Stellar Testnet transaction hashes

## Capture Notes

Fresh captures are produced by rendering the merchant dashboard against Stellar Testnet
with the live hardened escrow contract, seeding the pages with the 12 verified Testnet
hashes listed in `testnet_traction.csv` (via Playwright route interception so no live
database is mutated). The root `README.md` inlines these images in its **Screenshots**
section; keep filenames stable so those image links keep resolving on GitHub.

To re-capture, start the dashboard dev server (`npm run dev` in `merchant-dashboard/`)
and render the `/`, `/transactions`, `/wallet`, and `/analytics` routes with the API
responses mocked from `testnet_traction.csv`.

## Analytics Page

The analytics dashboard is available at `/analytics` and shows:
- Daily transaction volume bar chart (30-day trend)
- Status breakdown donut chart (COMPLETED, PENDING, FAILED, CANCELLED)
- Currency distribution donut chart
- Summary statistics

This page is powered by the new `GET /merchants/me/analytics` API endpoint.

## Demo Asset Notes

- Use the live demo and the root README for project URLs and contract references.
- For the wallet interaction proof, collect 10+ Stellar testnet transaction hashes and include them in your submission notes or a supporting document.
- Record a 2–3 minute walkthrough of the end-to-end payment flow for the demo video.
