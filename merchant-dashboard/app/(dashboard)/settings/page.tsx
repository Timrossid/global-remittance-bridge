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

export default function SettingsPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMe()
      .then(setMerchant)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Failed to load settings: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and integration settings</p>
      </div>

      {/* Profile section */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Business Name</label>
            <p className="text-gray-900 font-medium">{merchant?.name}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
            <p className="text-gray-900">{merchant?.email}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">KYC Status</label>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                merchant?.kycStatus === 'APPROVED'
                  ? 'bg-green-100 text-green-700'
                  : merchant?.kycStatus === 'REJECTED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {merchant?.kycStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet section */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Wallet</h2>
        </div>
        <div className="px-6 py-4">
          <label className="block text-xs font-medium text-gray-400 mb-1">Stellar Wallet Address</label>
          <code className="block text-sm text-gray-800 bg-gray-50 p-3 rounded-lg break-all border">
            {merchant?.walletAddress}
          </code>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${merchant?.walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
          >
            View on Stellar Expert ↗
          </a>
        </div>
      </div>

      {/* Integration section */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Integration</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">API Base URL</label>
            <code className="block text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">
              {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
            </code>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Network</label>
            <p className="text-gray-800 text-sm capitalize">
              {process.env.NEXT_PUBLIC_NETWORK || 'testnet'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Escrow Contract ID</label>
            <code className="block text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border break-all">
              {process.env.NEXT_PUBLIC_CONTRACT_ID || 'Not configured'}
            </code>
          </div>
          <div className="pt-2">
            <a
              href="https://github.com/Timrossid/global-remittance-bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              View integration docs on GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
