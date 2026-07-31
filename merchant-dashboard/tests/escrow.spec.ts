import { expect, test } from '@playwright/test';
import { Networks, TransactionBuilder } from '@stellar/stellar-sdk';

const sender = 'GCFIRY65OQE7DFP5KLNS2PF2LVZMUZYJX4OZIEQ36N2IQANUB5XVYOJR';
const receiver = 'GCATS5YOVB6ROX2WUNKGNQ2MP3GMXDMKSG2O4N5CLX3A6W4PZGZZI55U';
const token = 'CABQGAYDAMBQGAYDAMBQGAYDAMBQGAYDAMBQGAYDAMBQGAYDAMBQGCK3';
const transactionHash = 'mock-soroban-transaction-hash';

// Produced by SorobanDataBuilder().build().toXDR('base64') in the installed SDK.
const emptySorobanTransactionDataXdr = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
// Produced by nativeToScVal(999n, { type: 'u64' }).toXDR('base64').
const escrowIdScValXdr = 'AAAABQAAAAAAAAPn';

test('simulates, signs, submits, and polls a mocked Soroban escrow transaction', async ({ page }) => {
  await page.addInitScript(
    ({ senderAddress, networkPassphrase, simulationDataXdr, escrowIdXdr, hash }) => {
      localStorage.setItem('token', 'playwright-test-token');
      localStorage.setItem('merchant', JSON.stringify({ name: 'Playwright Merchant' }));

      const calls: string[] = [];
      let pollCount = 0;
      let signedTransactionXdr = '';
      let submittedTransactionXdr = '';
      const account = { sequence: '123456789' };

      window.__SOROBAN_TEST_WALLET__ = {
        address: senderAddress,
        networkPassphrase,
        signTransaction: async (transactionXdr, options) => {
          calls.push(`signTransaction:${options.address}:${options.networkPassphrase}`);
          if (!transactionXdr) throw new Error('Expected a prepared transaction XDR.');
          signedTransactionXdr = transactionXdr;
          return { signedTxXdr: transactionXdr };
        },
      };

      window.__SOROBAN_TEST_RPC__ = {
        getAccount: async (address) => {
          calls.push(`getAccount:${address}`);
          return account;
        },
        simulateTransaction: async (transactionXdr) => {
          calls.push(`simulateTransaction:${transactionXdr.length}`);
          if (!transactionXdr) throw new Error('Expected a transaction for simulation.');
          return {
            transactionDataXdr: simulationDataXdr,
            minResourceFee: '100',
            resultXdr: escrowIdXdr,
          };
        },
        sendTransaction: async (transactionXdr) => {
          calls.push(`sendTransaction:${transactionXdr.length}`);
          if (!transactionXdr) throw new Error('Expected a signed transaction for submission.');
          submittedTransactionXdr = transactionXdr;
          return { status: 'PENDING', hash };
        },
        getTransaction: async (submittedHash) => {
          calls.push(`getTransaction:${submittedHash}`);
          pollCount += 1;
          if (pollCount === 1) return { status: 'NOT_FOUND' };
          return { status: 'SUCCESS', returnValueXdr: escrowIdXdr };
        },
      };

      window.__SOROBAN_TEST_RPC_CALLS__ = calls;
      window.__SOROBAN_TEST_SIGNED_XDR__ = () => signedTransactionXdr;
      window.__SOROBAN_TEST_SUBMITTED_XDR__ = () => submittedTransactionXdr;
    },
    {
      senderAddress: sender,
      networkPassphrase: 'Test SDF Network ; September 2015',
      simulationDataXdr: emptySorobanTransactionDataXdr,
      escrowIdXdr: escrowIdScValXdr,
      hash: transactionHash,
    },
  );

  await page.goto('/escrow');
  await page.getByRole('button', { name: 'Connect Freighter' }).click();
  await expect(page.getByText('Freighter connected. Review the escrow details before signing.')).toBeVisible();

  await page.getByLabel('Receiver address').fill(receiver);
  await page.getByLabel('Token contract address').fill(token);
  await page.getByLabel('Amount in token stroops').fill('5000000');
  await page.getByRole('button', { name: 'Create escrow with Freighter' }).click();

  await expect(page.getByText('Escrow created successfully on Stellar Testnet.')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Escrow ID: 999')).toBeVisible();
  await expect(page.getByText(`View transaction: ${transactionHash}`)).toBeVisible();

  const { calls, signedXdr, submittedXdr } = await page.evaluate(() => ({
    calls: window.__SOROBAN_TEST_RPC_CALLS__,
    signedXdr: window.__SOROBAN_TEST_SIGNED_XDR__?.(),
    submittedXdr: window.__SOROBAN_TEST_SUBMITTED_XDR__?.(),
  }));
  expect(signedXdr).toBeTruthy();
  expect(submittedXdr).toBe(signedXdr);
  const signedTransaction = TransactionBuilder.fromXDR(signedXdr!, Networks.TESTNET);
  expect(signedTransaction.toXDR()).toBe(signedXdr);
  expect(signedTransaction.operations).toHaveLength(1);
  const [operation] = signedTransaction.operations;
  expect(operation.type).toBe('invokeHostFunction');
  if (operation.type !== 'invokeHostFunction') throw new Error('Expected an invokeHostFunction operation.');
  expect(operation.func.invokeContract().functionName().toString()).toBe('create_escrow');
  expect(calls).toEqual([
    `getAccount:${sender}`,
    expect.stringMatching(/^simulateTransaction:[1-9][0-9]*$/),
    `signTransaction:${sender}:Test SDF Network ; September 2015`,
    expect.stringMatching(/^sendTransaction:[1-9][0-9]*$/),
    `getTransaction:${transactionHash}`,
    `getTransaction:${transactionHash}`,
  ]);
});
