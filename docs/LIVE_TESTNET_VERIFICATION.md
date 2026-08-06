# Live Testnet Verification Runbook

This runbook covers the two remaining operational checks that cannot be replaced by CI mocks: deploying the hardened Soroban contracts and completing one real Freighter-signed escrow transaction on Stellar Testnet.

## Safety rules

- Use Stellar Testnet only. Never paste a secret key, seed phrase, or Freighter recovery phrase into chat, an issue, a log, or a command argument that may be recorded.
- Keep the deployer/admin account separate from production credentials and minimally funded.
- The browser flow must run with `NEXT_PUBLIC_ENABLE_TEST_WALLET_MOCK=false` or unset.
- Use a small test amount and a token contract you have independently verified on Testnet.
- Approve every Freighter prompt yourself. The assistant does not need wallet secrets or custody access.

## 1. Deploy and initialize the hardened contracts

The preferred path is the manually triggered **Soroban Contracts** workflow:

1. Configure the GitHub Environment named `stellar-testnet` with required reviewers.
2. Add `STELLAR_TESTNET_DEPLOYER_PUBLIC_KEY` as the deployer `G...` address.
3. Add `STELLAR_TESTNET_DEPLOYER_SECRET` as the matching secret key in the protected Environment. Never place it in repository files or workflow arguments.
4. Run the workflow with `deploy_testnet=true`.
5. Approve the `stellar-testnet` Environment deployment.
6. Confirm the workflow summary reports both contract C-addresses and that escrow and settlement initialization completed.
7. Verify both C-addresses and the escrow and settlement `initialize` invocations in Stellar Expert.

The workflow runs contract CI first, deploys the exact verified WASM artifacts, and initializes both escrow and settlement with the deployer public address. If initializing manually instead, use the Stellar CLI from a trusted local shell:

```bash
stellar contract invoke \
  --id <NEW_ESCROW_CONTRACT_ID> \
  --source-account <LOCAL_KEY_NAME> \
  --network testnet \
  -- \
  initialize \
  --admin <DEPLOYER_PUBLIC_ADDRESS>

stellar contract invoke \
  --id <NEW_SETTLEMENT_CONTRACT_ID> \
  --source-account <LOCAL_KEY_NAME> \
  --network testnet \
  -- \
  initialize \
  --admin <DEPLOYER_PUBLIC_ADDRESS>
```

Do not replace the published README contract IDs until the new deployment and initialization have been verified. Then update the README explorer links, dashboard environment configuration, and deployment record together.

## 2. Complete one live Freighter escrow flow

Configure the local dashboard with the newly deployed escrow ID, a verified Testnet token C-address, and the canonical Testnet RPC:

```bash
cd merchant-dashboard
cp .env.example .env.local
# Set these in .env.local:
# NEXT_PUBLIC_NETWORK=testnet
# NEXT_PUBLIC_CONTRACT_ID=<NEW_INITIALIZED_ESCROW_CONTRACT_ID>
# NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
# NEXT_PUBLIC_ESCROW_TOKEN_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
# The value above is the canonical native-XLM Stellar Asset Contract on Testnet;
# replace it only if testing a separately verified token contract.
# NEXT_PUBLIC_ENABLE_TEST_WALLET_MOCK=false
npm ci
npm run dev
```

In Freighter:

1. Select Stellar Testnet.
2. Use a sender account funded with Testnet XLM for fees and the selected token for the escrow amount. With the native-XLM Asset Contract above, fund the sender with Testnet XLM.
3. Open `/escrow` and connect Freighter.
4. Confirm the displayed address matches the sender account.
5. Enter a known receiver, verified token contract, and small positive amount in token stroops.
6. Submit and approve the transaction in Freighter.
7. Capture the transaction hash, escrow ID, network, contract ID, token ID, and timestamp—never the secret key.
8. Verify the transaction and contract invocation in Stellar Expert.
9. Confirm the transaction reaches `SUCCESS` and the returned escrow ID is shown by the dashboard.

## Evidence checklist

Record the following in a private verification note or a review-safe artifact:

- [ ] New escrow C-address and Stellar Expert link
- [ ] Settlement C-address and Stellar Expert link
- [ ] Escrow initialization transaction link
- [ ] Settlement initialization transaction link
- [ ] Live escrow transaction hash and Stellar Expert link
- [ ] Returned escrow ID
- [ ] Testnet network confirmation
- [ ] Screenshot showing the Freighter approval/result without account secrets
- [ ] Confirmation that `NEXT_PUBLIC_ENABLE_TEST_WALLET_MOCK` was false or unset

A successful mocked Playwright test is useful CI evidence, but it is not evidence of a live Freighter signature or a deployed initialized contract.
