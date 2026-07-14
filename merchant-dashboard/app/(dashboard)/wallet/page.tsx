'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Merchant {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  kycStatus: string;
}

export default function WalletPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [stats, setStats] = useState<{ totalVolume: number; completedCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([api.getMe(), api.getStats()])
      .then(([m, s]) => {
        setMerchant(m);
        setStats(s);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function copyAddress() {
    if (merchant?.walletAddress) {
      navigator.clipboard.writeText(merchant.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Failed to load wallet: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Treasury Wallet</h1>
        <p className="text-gray-500 text-sm mt-1">Your Stellar wallet and settlement overview</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 rounded-2xl shadow-lg mb-6">
        <p className="text-indigo-200 text-sm mb-1">Total Received Volume</p>
        <h2 className="text-4xl font-bold">
          ${(stats?.totalVolume ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </h2>
        <p className="text-indigo-300 text-xs mt-2">{stats?.completedCount ?? 0} completed payments</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`https://stellar.expert/explorer/testnet/account/${merchant?.walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition"
          >
            View on Explorer
          </a>
          <a
            href="/transactions"
            className="bg-indigo-500/50 text-white border border-indigo-400 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-500/70 transition"
          >
            Transaction History
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet address */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Wallet Address</h3>
          {merchant?.walletAddress ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                <code className="text-xs flex-1 text-gray-700 break-all">{merchant.walletAddress}</code>
              </div>
              <button
                onClick={copyAddress}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy address'}
              </button>
            </>
          ) : (
            <p className="text-gray-400 text-sm">No wallet address configured.</p>
          )}
        </div>

        {/* KYC & settlement method */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">KYC Status</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  merchant?.kycStatus === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : merchant?.kycStatus === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {merchant?.kycStatus ?? 'PENDING'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Network</span>
              <span className="font-medium text-gray-800">Stellar Testnet</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Settlement</span>
              <span className="font-medium text-gray-800">Automatic (on-chain)</span>
            </div>
          </div>
        </div>

        {/* Stellar network info */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Stellar Network</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Network</p>
              <p className="font-medium mt-1">Testnet</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Asset</p>
              <p className="font-medium mt-1">USDC / XLM</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Contract</p>
              <p className="font-mono text-xs mt-1 text-indigo-600">
                {process.env.NEXT_PUBLIC_CONTRACT_ID
                  ? `${process.env.NEXT_PUBLIC_CONTRACT_ID.slice(0, 10)}…`
                  : 'Not configured'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Explorer</p>
              <a
                href="https://stellar.expert/explorer/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline text-xs mt-1 block"
              >
                stellar.expert ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
