'use client';

import {
  Address,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from '@stellar/stellar-sdk';
import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from '@stellar/freighter-api';

const DEFAULT_TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org';
export const TESTNET_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || DEFAULT_TESTNET_RPC_URL;

export const ESCROW_FUNCTIONS = {
  createEscrow: 'create_escrow',
  releaseFunds: 'release_funds',
  refundFunds: 'refund_funds',
} as const;

export const ESCROW_CONTRACT_CROSS_CHECK = [
  {
    source: 'contracts/escrow/src/lib.rs',
    functionName: ESCROW_FUNCTIONS.createEscrow,
    signature: 'create_escrow(sender, receiver, token, amount) -> u64',
    browserCallable: true,
    note: 'The connected wallet signs as sender.',
  },
  {
    source: 'contracts/escrow/src/lib.rs',
    functionName: ESCROW_FUNCTIONS.releaseFunds,
    signature: 'release_funds(admin, escrow_id)',
    browserCallable: false,
    note: 'The supplied admin must authenticate; the current contract does not persist an admin role, so keep this behind a reviewed admin flow.',
  },
  {
    source: 'contracts/escrow/src/lib.rs',
    functionName: ESCROW_FUNCTIONS.refundFunds,
    signature: 'refund_funds(admin, escrow_id)',
    browserCallable: false,
    note: 'The supplied admin must authenticate; the current contract does not persist an admin role, so keep this behind a reviewed admin flow.',
  },
] as const;

export interface EscrowCreateInput {
  contractId: string;
  sender: string;
  receiver: string;
  token: string;
  amountStroops: string;
}

export interface EscrowCreateResult {
  hash: string;
  status: string;
  escrowId?: string;
}

function assertTestnetConfiguration() {
  if ((process.env.NEXT_PUBLIC_NETWORK || 'testnet').toLowerCase() !== 'testnet') {
    throw new Error('Browser escrow creation is enabled only on Stellar Testnet.');
  }

  const configuredRpc = new URL(TESTNET_RPC_URL);
  const defaultRpc = new URL(DEFAULT_TESTNET_RPC_URL);
  if (configuredRpc.origin !== defaultRpc.origin || configuredRpc.pathname !== defaultRpc.pathname) {
    throw new Error('Browser escrow creation only accepts the Stellar Testnet Soroban RPC endpoint.');
  }
}

function readFreighterError(result: { error?: { message?: string } }) {
  return result.error?.message;
}

async function connectFreighter(): Promise<{ address: string; networkPassphrase: string }> {
  const connection = await isConnected();
  if (connection.error) {
    throw new Error(readFreighterError(connection) || 'Freighter is not available. Install the Freighter wallet extension.');
  }

  const addressResult = connection.isConnected ? await getAddress() : await requestAccess();
  if (addressResult.error || !addressResult.address) {
    throw new Error(readFreighterError(addressResult) || 'Wallet access was not granted.');
  }

  const network = await getNetworkDetails();
  if (network.error) {
    throw new Error(readFreighterError(network) || 'Unable to read the wallet network.');
  }
  if (network.networkPassphrase !== Networks.TESTNET) {
    throw new Error('Freighter is connected to a non-Testnet network. Switch Freighter to Testnet and try again.');
  }

  return { address: addressResult.address, networkPassphrase: network.networkPassphrase };
}

export async function getBrowserWallet(): Promise<{ address: string; networkPassphrase: string }> {
  assertTestnetConfiguration();
  return connectFreighter();
}

export async function createEscrowFromBrowser(input: EscrowCreateInput): Promise<EscrowCreateResult> {
  assertTestnetConfiguration();

  if (!input.contractId) throw new Error('NEXT_PUBLIC_CONTRACT_ID is not configured.');
  if (!input.sender || !input.receiver || !input.token) {
    throw new Error('Sender, receiver, and token contract addresses are required.');
  }
  if (!/^[0-9]+$/.test(input.amountStroops) || input.amountStroops === '0') {
    throw new Error('Amount must be a positive integer in token stroops.');
  }

  try {
    Address.fromString(input.sender);
    Address.fromString(input.receiver);
    Address.fromString(input.token);
    Address.fromString(input.contractId);
  } catch {
    throw new Error('Enter valid Stellar account and contract addresses.');
  }

  const wallet = await connectFreighter();
  if (wallet.address !== input.sender) {
    throw new Error('The connected Freighter address does not match the selected sender.');
  }

  const server = new rpc.Server(TESTNET_RPC_URL);
  const sourceAccount = await server.getAccount(input.sender);
  const escrow = new Contract(input.contractId);
  const operation = escrow.call(
    ESCROW_FUNCTIONS.createEscrow,
    Address.fromString(input.sender).toScVal(),
    Address.fromString(input.receiver).toScVal(),
    Address.fromString(input.token).toScVal(),
    nativeToScVal(BigInt(input.amountStroops), { type: 'i128' }),
  );

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: '100',
    networkPassphrase: wallet.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(180)
    .build();

  const simulation = await server.simulateTransaction(transaction);
  if ('error' in simulation) {
    throw new Error(`Soroban simulation failed: ${simulation.error}`);
  }

  const preparedTransaction = rpc.assembleTransaction(transaction, simulation).build();
  // The connected sender is the transaction invoker and satisfies the contract's
  // sender.require_auth() through the signed transaction envelope. A future
  // non-invoker admin flow must use Freighter signAuthEntry separately.
  const signed = await signTransaction(preparedTransaction.toXDR(), {
    address: wallet.address,
    networkPassphrase: wallet.networkPassphrase,
  });
  if (signed.error || !signed.signedTxXdr) {
    throw new Error(readFreighterError(signed) || 'The wallet did not return a signed transaction.');
  }

  const signedTransaction = TransactionBuilder.fromXDR(signed.signedTxXdr, wallet.networkPassphrase);
  const submission = await server.sendTransaction(signedTransaction);
  if (submission.status === 'ERROR') {
    throw new Error(`Soroban submission failed: ${submission.status}`);
  }

  let result = await server.getTransaction(submission.hash);
  for (let attempt = 0; attempt < 20 && result.status === 'NOT_FOUND'; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    result = await server.getTransaction(submission.hash);
  }

  if (result.status !== 'SUCCESS') {
    throw new Error(`Soroban transaction ended with status: ${result.status}`);
  }

  let escrowId: string | undefined;
  if ('returnValue' in result && result.returnValue) {
    const value = scValToNative(result.returnValue);
    escrowId = typeof value === 'bigint' ? value.toString() : String(value);
  }

  return { hash: submission.hash, status: result.status, escrowId };
}
