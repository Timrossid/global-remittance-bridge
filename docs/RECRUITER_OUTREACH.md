# 📣 Recruiter Outreach Pack

Copy-paste templates for inviting real testers to the Global Remittance Bridge on
Stellar Testnet. Send alongside [`ONBOARDING_TESTER_GUIDE.md`](ONBOARDING_TESTER_GUIDE.md).

> **Live app:** https://merchant-dashboard-rosy.vercel.app
> **Feedback survey:** https://forms.gle/QgempCFKcho8PwgA7
> **Repo:** https://github.com/Timrossid/global-remittance-bridge

---

## 1 · Stellar community (Discord / Forum / r/Stellar) — short announcement

```
🚀 Looking for 10+ beta testers for an open-source micro-remittance bridge on Stellar!

Global Remittance Bridge lets SMEs receive low-cost international payments via
Soroban smart contracts. We just shipped a working testnet demo and want REAL
feedback before going further.

3-minute test:
1. Grab a free Stellar testnet wallet (Freighter)
2. Register on the dashboard → https://merchant-dashboard-rosy.vercel.app
3. Do one testnet transaction (30 seconds)
4. Tell us what's good/missing/broken → https://forms.gle/QgempCFKcho8PwgA7

Everything runs on Stellar TESTNET — no real money. Full walkthrough:
https://github.com/Timrossid/global-remittance-bridge/blob/master/docs/ONBOARDING_TESTER_GUIDE.md

Every piece of feedback gets shipped. Thanks in advance! ⭐
```

---

## 2 · LinkedIn post (fintech / web3 audience)

```
We built an open-source remittance bridge on @Stellar's testnet and we need beta testers.

Why it matters: cross-border payments today are slow, expensive, and locked behind
legacy banking. Our Soroban smart contracts handle escrow + settlement with a 0.5%
protocol fee and near-instant settlement — no bank account required for the merchant.

The demo is live (testnet only, free to try):
   https://merchant-dashboard-rosy.vercel.app

Take 3 minutes:
  • Register with a Stellar testnet wallet (Freighter)
  • Make one test payment
  • Rate it + tell us what's missing at https://forms.gle/QgempCFKcho8PwgA7

Your feedback goes straight into the roadmap — we're logging every suggestion and
shipping improvements weekly. Open source, Apache 2.0:
   https://github.com/Timrossid/global-remittance-bridge

#Stellar #Soroban #Web3 #Remittance #Fintech #OpenSource
```

---

## 3 · Direct DM / email (personal, use when you know the person)

```
Hey {Name},

I've been building an open-source micro-remittance bridge on the Stellar network
(testnet) and I'm recruiting ~10 real testers to try it out — would you take 3-4
minutes?

1. Install the free Freighter wallet (Stellar testnet) — https://freighter.app
2. Register at https://merchant-dashboard-rosy.vercel.app
3. Do one testnet payment (30 sec)
4. Fill this 1-minute survey → https://forms.gle/QgempCFKcho8PwgA7

{OPTIONAL, if you generated prefilled links: Here's your survey link with your
details pre-filled: {PREFILLED_URL}}

No real money involved — it's all Stellar testnet. Your honest feedback (even
"it's confusing") is exactly what I need. Happy to share what we build from it!

Thanks,
{Your name}
```

---

## 4 · GitHub Discussion / README note

```
# 🧪 Help us test Global Remittance Bridge

We're collecting 10+ real user tests before our next milestone. If you're
interested in cross-border payments, Stellar, or Soroban smart contracts — 3
minutes of your time helps a lot.

Steps: https://github.com/Timrossid/global-remittance-bridge/blob/master/
docs/ONBOARDING_TESTER_GUIDE.md
Survey: https://forms.gle/QgempCFKcho8PwgA7

We track every piece of feedback in our README with the commit that implements it.
```

---

## Tracking tip

Recommended: keep a `testers.csv` sheet with columns `id,name,email,wallet,formUrl`
and mark each person's status (invited → registered → onchain tx → survey →
improvement shipped). When survey responses come back, use
`payment-api/scripts/export-feedback-to-xlsx.ts` to build the Excel export and fill
the README tables.