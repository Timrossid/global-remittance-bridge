'use client';

import React, { FormEvent, useState } from 'react';
import {
  createEscrowFromBrowser,
  ESCROW_CONTRACT_CROSS_CHECK,
  getBrowserWallet,
} from '@/lib/soroban';

const configuredContractId = process.env.NEXT_PUBLIC_CONTRACT_ID || '';
const configuredTokenId = process.env.NEXT_PUBLIC_ESCROW_TOKEN_ID || '';

export default function EscrowPage() {
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [token, setToken] = useState(configuredTokenId);
  const [amountStroops, setAmountStroops] = useState('');
  const [walletNetwork, setWalletNetwork] = useState('');
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ hash: string; escrowId?: string } | null>(null);

  async function connectWallet() {
    setLoadingWallet(true);
    setError(null);
    setMessage(null);
    try {
      const wallet = await getBrowserWallet();
      setSender(wallet.address);
      setWalletNetwork('Stellar Testnet');
      setMessage('Freighter connected. Review the escrow details before signing.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to connect Freighter.');
    } finally {
      setLoadingWallet(false);
    }
  }

  async function submitEscrow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setResult(null);

    try {
      const created = await createEscrowFromBrowser({
        contractId: configuredContractId,
        sender,
        receiver: receiver.trim(),
        token: token.trim(),
        amountStroops: amountStroops.trim(),
      });
      setResult({ hash: created.hash, escrowId: created.escrowId });
      setMessage('Escrow created successfully on Stellar Testnet.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create escrow.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
            Browser signing
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
            Testnet only
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create an escrow</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
          Prepare and sign the escrow contract directly from your browser with Freighter. Your private key never enters the dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)] gap-6">
        <form onSubmit={submitEscrow} className="bg-white rounded-2xl shadow-sm border p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900">Escrow details</h2>
              <p className="text-xs text-gray-500 mt-1">The connected wallet must sign as the sender.</p>
            </div>
            <button
              type="button"
              onClick={connectWallet}
              disabled={loadingWallet || submitting}
              className="shrink-0 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loadingWallet ? 'Connecting…' : sender ? 'Reconnect wallet' : 'Connect Freighter'}
            </button>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-900">
            {sender ? (
              <>
                <p className="font-semibold">Connected on {walletNetwork || 'Stellar Testnet'}</p>
                <code className="block mt-1 break-all text-indigo-700">{sender}</code>
              </>
            ) : (
              <p>Connect Freighter to populate the sender address and verify the wallet is on Testnet.</p>
            )}
          </div>

          <label htmlFor="escrow-receiver" className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1.5">Receiver address</span>
            <input
              id="escrow-receiver"
              required
              value={receiver}
              onChange={(event) => setReceiver(event.target.value)}
              placeholder="G..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label htmlFor="escrow-token" className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1.5">Token contract address</span>
            <input
              id="escrow-token"
              required
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="C..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <span className="block mt-1.5 text-[11px] text-gray-400">Enter the Soroban token contract and use its smallest unit.</span>
          </label>

          <label htmlFor="escrow-amount" className="block">
            <span className="block text-xs font-semibold text-gray-600 mb-1.5">Amount in token stroops</span>
            <input
              id="escrow-amount"
              required
              inputMode="numeric"
              pattern="[0-9]+"
              value={amountStroops}
              onChange={(event) => setAmountStroops(event.target.value.replace(/[^0-9]/g, ''))}
              placeholder="1000000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          {message && <div role="status" aria-live="polite" className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">{message}</div>}
          {error && <div role="alert" aria-live="assertive" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

          {result && (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs">
              <p className="font-semibold text-gray-700">On-chain result</p>
              {result.escrowId && <p className="mt-1 text-gray-600">Escrow ID: <code>{result.escrowId}</code></p>}
              <a
                className="mt-1 block break-all text-indigo-600 hover:underline"
                href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View transaction: {result.hash}
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !sender || !configuredContractId}
            className="w-full rounded-lg bg-gray-900 text-white px-4 py-3 text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Simulating, signing, and submitting…' : 'Create escrow with Freighter'}
          </button>

          {!configuredContractId && (
            <p className="text-xs text-red-600">The dashboard is missing NEXT_PUBLIC_CONTRACT_ID.</p>
          )}
        </form>

        <aside className="space-y-6">
          <div className="bg-gray-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">Contract cross-check</p>
            <h2 className="mt-2 font-semibold">Escrow functions matched</h2>
            <p className="mt-2 text-xs leading-5 text-gray-300">
              These browser actions are mapped directly to the public functions in contracts/escrow/src/lib.rs.
            </p>
            <div className="mt-5 space-y-3">
              {ESCROW_CONTRACT_CROSS_CHECK.map((item) => (
                <div key={item.functionName} className="border-t border-white/10 pt-3 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs text-indigo-200">{item.functionName}</code>
                    <span className={`text-[10px] font-bold uppercase ${item.browserCallable ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {item.browserCallable ? 'browser call' : 'admin flow'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-400">{item.signature}</p>
                  <p className="mt-1 text-[11px] text-gray-300">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <h2 className="font-semibold text-amber-900 text-sm">Before you sign</h2>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-amber-800 list-disc pl-4">
              <li>Confirm Freighter is set to Stellar Testnet.</li>
              <li>Use test assets only. This flow does not support Mainnet.</li>
              <li>Review the receiver, token contract, and smallest-unit amount in the wallet prompt.</li>
              <li>Only the connected sender wallet signs; private keys stay in Freighter.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
