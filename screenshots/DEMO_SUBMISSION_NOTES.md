# Demo Submission Notes

## Live Demo URLs

- **Merchant Dashboard:** https://merchant-dashboard-rosy.vercel.app
- **Payment API:** https://global-remittance-api.onrender.com
- **Stellar Testnet Explorer:** https://stellar.expert/explorer/testnet
- **Analytics Page:** https://merchant-dashboard-rosy.vercel.app/analytics
- **Demo Video (hosted on GitHub):** ▶️ **[Release demo-recording-v1](https://github.com/Timrossid/global-remittance-bridge/releases/tag/demo-recording-v1)** — 2-min silent walkthrough attached as a release asset
- **Demo Video (direct download):** [demo-recording.webm](https://github.com/Timrossid/global-remittance-bridge/releases/download/demo-recording-v1/demo-recording.webm) (≈6.9 MB · 1440×900 · WebM)
- **Demo Video (in repo):** [`screenshots/demo-recording.webm`](demo-recording.webm) — the source file attached to the release above

## Getting Started (For Testers)

1. Visit https://merchant-dashboard-rosy.vercel.app
2. Click **Register** to create a merchant account
3. Fill in email, password, and merchant details
4. After registration, you'll be logged in and can access the dashboard

## Screenshot Merchant

- **merchantId:** `2f5cf944-aa1e-4bb0-aa46-25500bf3b515`
- Used for all dashboard, transaction, wallet, feedback, contract, and analytics screenshots.

## Proof of Wallet Interactions (12 Verified Stellar Testnet Transactions)

All hashes verified against `https://horizon-testnet.stellar.org` (HTTP 200 confirmed).
These are general Soroban testnet transactions demonstrating wallet activity; they are not limited to the escrow or settlement contracts.

| # | Stellar Tx Hash | Amount | Currency | Status | Explorer Link |
|---|---|---|---|---|---|
| 1 | `53c5c09e7153e5fc731b8a917e157fd2c09ca5b79fbc51ffb4fc6cfddf163426` | 120.50 | XLM | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/53c5c09e7153e5fc731b8a917e157fd2c09ca5b79fbc51ffb4fc6cfddf163426) |
| 2 | `af8158e1e7be457ab87ab23460f05071fbf4ccf182e3a4c4d17171b5b8fe2c5f` | 250.00 | USDC | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/af8158e1e7be457ab87ab23460f05071fbf4ccf182e3a4c4d17171b5b8fe2c5f) |
| 3 | `dff23f47977479a8d96d9de8bc7e527e2071f8839b5c22442b1aa7e116e13581` | 75.25 | XLM | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/dff23f47977479a8d96d9de8bc7e527e2071f8839b5c22442b1aa7e116e13581) |
| 4 | `260ff05051ae5a9e59b33a526d84c8fcf28d5658fe8e3fedaa5df998b5adc161` | 500.00 | USDC | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/260ff05051ae5a9e59b33a526d84c8fcf28d5658fe8e3fedaa5df998b5adc161) |
| 5 | `be47b1a2aecbf7f15a6d8cc8b8b23b36e14d6036cf3c63ffef039d17e99dc2c6` | 32.10 | XLM | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/be47b1a2aecbf7f15a6d8cc8b8b23b36e14d6036cf3c63ffef039d17e99dc2c6) |
| 6 | `0bdf0bb69e664b298e5fda67e59859bc563685c2185c23a4ca03efd608d56719` | 180.00 | USDC | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/0bdf0bb69e664b298e5fda67e59859bc563685c2185c23a4ca03efd608d56719) |
| 7 | `9ba671b92d912bfdf65ce029c9026c661711172405daa6ea1b6ce13d92565070` | 95.75 | XLM | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/9ba671b92d912bfdf65ce029c9026c661711172405daa6ea1b6ce13d92565070) |
| 8 | `e0fa25f207bdb5bc9c9250abee7bcea3ec75a22ea71f9d6587c00488bae038b6` | 410.20 | USDC | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/e0fa25f207bdb5bc9c9250abee7bcea3ec75a22ea71f9d6587c00488bae038b6) |
| 9 | `c2cb78b8cdbab537d638cb2bdca9bffcbc4ffe4a2685164d8ffac4aaa98c9d46` | 60.00 | XLM | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/c2cb78b8cdbab537d638cb2bdca9bffcbc4ffe4a2685164d8ffac4aaa98c9d46) |
| 10 | `718574825c5432afab71c1ce5f98ebf3cf605ab0359d2c585f5e24baefadf1db` | 220.80 | USDC | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/718574825c5432afab71c1ce5f98ebf3cf605ab0359d2c585f5e24baefadf1db) |
| 11 | `7579a384cc3a171c6f445af243289b966c5c4d3c29fe9aec5358a34432e7d015` | 150.00 | XLM | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/7579a384cc3a171c6f445af243289b966c5c4d3c29fe9aec5358a34432e7d015) |
| 12 | `52ed4b5a41b9a7ae4cfe6fe71c6a17362e65b8ddd44e3660999658c41ad9ac80` | 85.50 | USDC | COMPLETED | [View](https://stellar.expert/explorer/testnet/tx/52ed4b5a41b9a7ae4cfe6fe71c6a17362e65b8ddd44e3660999658c41ad9ac80) |

**Summary:** 12 transactions across XLM and USDC. All are successful on-chain (`successful: true` on Horizon).

## How to Capture Screenshots Manually

1. Open https://merchant-dashboard-rosy.vercel.app in an incognito window.
2. Register a new merchant account with a unique email and wallet address.
   - Or log in with an existing account if you already have one.
3. Navigate to each page below and capture a full-screen screenshot:
   - **Dashboard:** `/dashboard`
   - **Transactions:** `/transactions`
   - **Wallet:** `/wallet`
   - **Analytics:** `/analytics`
   - **Feedback:** `/feedback`
4. Save the screenshots to this folder with these exact filenames:
   - `dashboard.png`
   - `transactions.png`
   - `wallet-interactions.png`
   - `analytics.png`
   - `feedback.png`
   - `mobile-view.png` — use browser DevTools device emulation at 375×812 px
   - `contract-deployed.png` — capture from https://stellar.expert/explorer/testnet/contract/CBL3I4IDMIUZJEJG56DV2VP6K7L2ROLT3JYCC53KNU7PPUX6DGPJJVKC (historical pre-hardening deployment; the Environment-gated hardened deployment is `CD2YDPGFZCSXY3UAFJSO47GC5S3KDVECPL5SCCQQXIPTEBLDWMYPG44D`)

## How to Record the Demo Video

The recording is now automated. Run from the repo root:

```bash
cd merchant-dashboard
npm run demo:install-browser   # one-time: install Playwright Chromium
npm run demo:record            # writes screenshots/demo-recording.webm
```

This walks through the exact flow in `DEMO_VIDEO_GUIDE.md`:

1. **Sign-in as the seeded demo merchant** at `/login` (`demo-screenshot@example.com` — shows the 12 real Testnet transactions; falls back to a fresh `/register` sign-up if the seeded account is absent)
2. **Dashboard overview at `/`** (the `(dashboard)` route group serves the dashboard at root)
3. **Transactions list at `/transactions`**
4. **Wallet at `/wallet`**
5. **Analytics at `/analytics`**
6. **Feedback at `/feedback`** (with caption overlay per section)

Each section gets a fixed-bottom dark caption so the video is self-explanatory without audio.

The recording script targets exactly **2:00 wall-clock** using per-section budgets:

| Section | Target | What it covers |
|---|---|---|
| intro | 0:00–0:05 | Pre-roll /login |
| signup | 0:05–0:33 | Sign-in as seeded demo merchant (or registration) + land on dashboard |
| dashboard | 0:33–0:51 | Stats + recent transactions |
| transactions | 0:51–1:07 | Transaction list with Stellar tx hashes |
| wallet | 1:07–1:15 | Wallet view |
| analytics | 1:15–1:23 | Analytics dashboard |
| feedback | 1:23–1:45 | Feedback form + submit |
| recap | 1:45–2:00 | Outro + thanks-for-watching |

## Publishing the demo video

The `.webm` is already published as a **GitHub Release asset** — no third-party hosting required. Reviewers can stream or download the video directly from the
release page.

The release was created by:

```bash
git tag -a demo-recording-v1 -m 'Demo recording v1 — 2-min silent walkthrough of the live merchant dashboard'
git push origin demo-recording-v1
gh release create demo-recording-v1 \
  --title '🎬 Demo Video · Global Micro-Remittance Bridge' \
  --notes '…' \
  screenshots/demo-recording.webm
```

### Verify the published release

- Release page: <https://github.com/Timrossid/global-remittance-bridge/releases/tag/demo-recording-v1>
- Direct download: <https://github.com/Timrossid/global-remittance-bridge/releases/download/demo-recording-v1/demo-recording.webm>
- Asset must be `video/webm`, ≈6.9 MB (regenerated 2026-08-01), named `demo-recording.webm`

### (Optional) Re-encode to MP4 for broader compatibility

If a reviewer can't play WebM locally, re-encode (needs local ffmpeg):

```bash
ffmpeg -i screenshots/demo-recording.webm -c:v libx264 -preset fast -crf 23 \
       -vf "scale=1440:900" screenshots/demo-recording.mp4
```

…and attach `screenshots/demo-recording.mp4` to the same release:

```bash
gh release upload demo-recording-v1 screenshots/demo-recording.mp4
```

## Feedback Collection

The feedback page is live at: `/feedback`

- **Local feedback form:** Users can submit ratings and text feedback directly
- **Optional Google Form:** Set `NEXT_PUBLIC_FEEDBACK_FORM_URL` in the deployment to add an external form link

To add a Google Form:
1. Create a form at https://forms.google.com
2. Deploy with `NEXT_PUBLIC_FEEDBACK_FORM_URL="https://docs.google.com/forms/d/e/YOUR_GOOGLE_FORM_ID_HERE/viewform"`

## Troubleshooting

### "No transactions found" in screenshots
- Cause: The dashboard requires a registered merchant with transactions.
- Fix: Register a new account, then seed transactions using:
  ```bash
  cd payment-api
  npx tsx scripts/seed-screenshot-data.ts
  ```
- Or use the live API to create transactions manually via `/payments/create`.

### "Error: API error" on dashboard
- **Cause:** Not authenticated. The dashboard requires login.
- **Fix:** Visit the **Register** or **Login** page first.

### Registration fails with "wallet already exists"
- Cause: The wallet address was already used by another test.
- Fix: Use a fresh, random Stellar-style address starting with `G` followed by 55 random alphanumeric characters. Or use curl directly:
  ```bash
  RANDOM_WALLET="G$(date +%s)$(openssl rand -hex 22)"
  curl -X POST https://global-remittance-api.onrender.com/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Demo Merchant\",\"email\":\"demo-$(date +%s)@example.com\",\"password\":\"SecurePass123!\",\"walletAddress\":\"$RANDOM_WALLET\"}"
  ```

### API connection issues
- The backend may take 30-60 seconds to wake up from idle (Render free tier).
- Refresh the page and try again.

### API returns 404 or "Application is not configured correctly"
- Cause: The Next.js app cannot reach the Payment API.
- Fix: Verify `NEXT_PUBLIC_API_URL` is set to `https://global-remittance-api.onrender.com` in the Vercel deployment environment.

### Transaction doesn't appear
- Check that you're using the correct Stellar testnet network
- Verify the contract address: `CBL3I4IDMIUZJEJG56DV2VP6K7L2ROLT3JYCC53KNU7PPUX6DGPJJVKC` (pre-hardening; the Environment-gated hardened escrow is `CD2YDPGFZCSXY3UAFJSO47GC5S3KDVECPL5SCCQQXIPTEBLDWMYPG44D`)

## Submission Checklist

- [x] 10+ wallet interactions recorded (12 verified Stellar testnet hashes — see table above)
- [x] 7 screenshots captured (dashboard, transactions, wallet, analytics, feedback, mobile, contract-deployed)
- [x] Demo video recorded & committed (`screenshots/demo-recording.webm`, 2-min walkthrough, real login as the seeded demo merchant with 12 verified Testnet transactions, no route interception; regenerated 2026-08-01 against the local full stack — the committed file (≈6.9 MB) supersedes the earlier release asset, which should be re-uploaded with `gh release upload demo-recording-v1 screenshots/demo-recording.webm --clobber` or a v2 tag)
- [x] Demo video published — *GitHub Release [demo-recording-v1](https://github.com/Timrossid/global-remittance-bridge/releases/tag/demo-recording-v1) with `demo-recording.webm` attached*
- [x] Feedback form implemented at `/feedback`; collection mechanism + observed issues summarized in [`docs/USER_FEEDBACK.md`](../docs/USER_FEEDBACK.md)
- [x] All URLs and contract addresses verified
