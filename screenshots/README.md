# Screenshots

This directory contains screenshots demonstrating the Global Micro-Remittance Bridge in action.

## Required Screenshots (for Level 4 Submission)

### 1. Product UI (`dashboard.png`)
Capture the main merchant dashboard showing:
- Stats cards (Total Volume, Completed Payments, Pending Settlements, Active Customers)
- Recent transactions table with real transaction data
- Navigation sidebar

**How to capture:** Log in at https://merchant-dashboard-rosy.vercel.app, navigate to the dashboard root `/`.

---

### 2. Mobile Responsive Design (`mobile-view.png`)
Demonstrate the responsive mobile layout:
- Dashboard on a 375px viewport (iPhone-sized)
- Hamburger menu navigation
- Stats cards stacked vertically

**How to capture:** Open Chrome DevTools → Toggle Device Toolbar → Select iPhone 12 Pro.

---

### 3. Transactions Page (`transactions.png`)
Show the full transactions list:
- Filter tabs (All, Completed, Pending, Failed)
- Transaction rows with Stellar tx hash links to stellar.expert
- Status badges

**How to capture:** Navigate to `/transactions` after onboarding.

---

### 4. Analytics / Monitoring (`analytics.png`)
Show Vercel Analytics dashboard:
- Page views over time
- Unique visitors
- Top pages

**How to capture:** Log into vercel.com → Your project → Analytics tab.

---

### 5. Stellar Testnet Contract (`contract-deployed.png`)
Show the deployed Soroban escrow contract on Stellar Expert:
- Contract address
- Invocation history showing real wallet interactions

**How to capture:** Visit `https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>`

---

### 6. Wallet Interactions (`wallet-interactions.png`)
Show proof of 10+ wallet interactions on Stellar testnet:
- Transaction list from Stellar Expert for your contract
- Each row represents a real user wallet interaction

---

## Naming Convention

| Filename | Content |
|---|---|
| `dashboard.png` | Main dashboard desktop view |
| `mobile-view.png` | Dashboard on mobile viewport |
| `transactions.png` | Transactions list page |
| `analytics.png` | Vercel Analytics dashboard |
| `contract-deployed.png` | Stellar Expert contract page |
| `wallet-interactions.png` | Proof of 10+ wallet interactions |
| `login.png` | Login page |
| `register.png` | Registration page |

---

*Add your actual screenshots to this directory before submitting.*
