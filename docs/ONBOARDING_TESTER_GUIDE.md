# 🧪 How to Test Global Remittance Bridge (3 minutes)

This is the recruiter-facing onboarding doc. Send it to testers so they can jump in,
do a real testnet wallet interaction, and submit feedback — without getting stuck.

> **Live app:** <https://merchant-dashboard-rosy.vercel.app>
> **Feedback survey:** <https://forms.gle/QgempCFKcho8PwgA7>

---

## What you'll do
1. Create a **free** Stellar testnet wallet (30 sec)
2. Register on the **bridge dashboard** (30 sec)
3. Trigger a **testnet payment** (30 sec) — this is the on-chain "wallet interaction"
4. Tell us what you think via the **feedback survey** (1 min)

That's it. No real money, no bank. Everything runs on Stellar's free test network.

---

## Step 1 — Get a testnet wallet (30 sec)
Install the **Freighter** browser wallet extension (Chrome/Edge/Firefox):

- Chrome/Edge: https://chrome.google.com/webstore/detail/freighter or the
  Firefox add-on store.
- Create a new account and switch the network to **Testnet**.
- **Copy your public key** — it starts with `G` and is ~56 characters (e.g. `GBT...`).
  You'll paste this into the dashboard.

> Need testnet XLM (free) to fund your account? Use the Stellar "Friendbot":
> visit https://laboratory.stellar.org/account → "Create account" or the
> Friendbot endpoint. Fund a small balance so your test transaction succeeds.

## Step 2 — Register on the dashboard (30 seconds)
1. Open <https://merchant-dashboard-rosy.vercel.app>
2. Click **Register**.
3. Enter a **business name**, **email**, a password, and **your Stellar wallet address** (from step 1).
4. Submit — you're now signed in.

## Step 3 — Do a wallet interaction (30 seconds)
- Go to **Escrow** in the sidebar, connect Freighter, and create a test escrow.
- Or open **Transactions** / **Wallet** and trigger or view a settlement.
- You don't need to transfer large amounts — any **successful Testnet transaction** counts.

## Step 4 — Submit feedback (1 minute)
Fill the survey: <https://forms.gle/QgempCFKcho8PwgA7>

Please include:
- Your **name** and **email** (so we can follow up),
- your **wallet address** (so we can verify your on-chain activity),
- your **rating** (1–5) and any likes/misses/bugs/improvements.

---

## Why this matters (for the tester)
- You help shape a real open-source cross-border payments product.
- Most buggy/friction-free test = the product improves + you get recognized.

## Common "I'm stuck" fixes
| Problem | Fix |
|---|---|
| "wallet already exists" | Use a brand-new wallet address (Register generates one; paste a fresh G... key) |
| Nothing loads | The app may be cold-starting; refresh after ~5 s |
| No testnet funds | Use the Stellar Laboratory Friendbot funder (step 1 note above) |
| Can't find Freighter | Search "Freighter wallet" in your browser's extension store |

---

### Owner checklist (before sending to people)
1. Confirmed the dashboard + API are live. ✅
2. Replaced the placeholder form link with your real prefilled link.
3. Sent each tester a unique prefilled link (see `generate-testers-form-links.js`).

_Written by the Global Remittance Bridge team — thanks for helping us ship a better product!_