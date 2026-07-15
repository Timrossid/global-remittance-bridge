# Demo Submission Notes

## Live Demo URLs

- **Merchant Dashboard:** https://merchant-dashboard-rosy.vercel.app
- **Payment API:** https://global-remittance-api.onrender.com
- **Stellar Testnet Explorer:** https://stellar.expert/explorer/testnet

## Getting Started (For Testers)

1. Visit https://merchant-dashboard-rosy.vercel.app
2. Click **Register** to create a merchant account
3. Fill in email, password, and merchant details
4. After registration, you'll be logged in and can access the dashboard

## Expected Wallet Interactions

Ask testers to complete these flows and record transaction hashes:

1. **Dashboard**: View stats, recent transactions, and merchant profile
2. **Wallet**: Connect a Stellar testnet wallet (e.g., via Albedo or account generation)
3. **Transactions**: Initiate a payment and track its status
4. **Feedback**: Submit feedback to test the form

Record Stellar testnet transaction hashes here:

1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. 

## Demo Video Script

Record a 2–3 minute video showing:

1. **Sign-up flow** (30s) — Register a new merchant account
2. **Dashboard overview** (30s) — Show stats and transaction list
3. **Payment initiation** (60s) — Initiate a transfer and track it
4. **Feedback submission** (30s) — Fill out the feedback form
5. **Wallet integration** (optional) — Show Stellar wallet connection

### Recording Tools
- **Loom:** https://loom.com (free, browser-based)
- **YouTube:** Upload unlisted or private video
- **OBS Studio:** Free open-source screen recorder

**Output:** MP4 or webm, 1080p or higher, upload to cloud storage and share the link

## Feedback Collection

The feedback page is live at: `/feedback`

- **Local feedback form:** Users can submit ratings and text feedback directly
- **Optional Google Form:** Set `NEXT_PUBLIC_FEEDBACK_FORM_URL` in the deployment to add an external form link

To add a Google Form:
1. Create a form at https://forms.google.com
2. Deploy with `NEXT_PUBLIC_FEEDBACK_FORM_URL="https://docs.google.com/forms/d/e/YOUR_GOOGLE_FORM_ID_HERE/viewform"`

## Troubleshooting

### "Error: API error" on dashboard
- **Cause:** Not authenticated. The dashboard requires login.
- **Fix:** Visit the **Register** or **Login** page first.

### API connection issues
- The backend may take 30-60 seconds to wake up from idle (Render free tier).
- Refresh the page and try again.

### Transaction doesn't appear
- Check that you're using the correct Stellar testnet network
- Verify the contract address: `CBL3I4IDMIUZJEJG56DV2VP6K7L2ROLT3JYCC53KNU7PPUX6DGPJJVKC`

## Submission Checklist

- [ ] 10+ wallet interactions recorded (Stellar testnet hashes)
- [ ] 6 screenshots captured (dashboard, transactions, wallet, feedback, contract, mobile)
- [ ] Demo video recorded (2–3 min, end-to-end flow)
- [ ] Feedback submissions tested (local form + optional Google Form link)
- [ ] All URLs and contract addresses verified
