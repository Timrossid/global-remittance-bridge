'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalVolume: number;
  pendingSettlements: number;
  activeCustomers: number;
  completedCount: number;
  totalTransactions: number;
}

interface Transaction {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
  stellarTxHash?: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = 'indigo',
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className={`text-xs mt-2 font-medium px-2 py-0.5 rounded-full inline-block ${colorMap[color]}`}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [txnsError, setTxnsError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch((err) => setStatsError(err.message))
      .finally(() => setLoadingStats(false));

    api
      .getTransactions()
      .then((data: Transaction[]) => setTransactions(data.slice(0, 5)))
      .catch((err) => setTxnsError(err.message))
      .finally(() => setLoadingTxns(false));
  }, []);

  // Show error state if stats failed to load
  if (statsError && statsError.includes('Not authenticated')) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto mt-16">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Welcome to Global Remittance Bridge</h2>
          <p className="text-blue-700 mb-6">Please log in or register to access your merchant dashboard.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Sign In
            </Link>
            <Link href="/register" className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium text-sm">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your remittance activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-16" />
            </div>
          ))
        ) : statsError ? (
          <div className="col-span-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Could not load stats: {statsError}
          </div>
        ) : (
          <>
            <StatCard
              label="Total Volume"
              value={`$${(stats?.totalVolume ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sub="All time"
              color="indigo"
            />
            <StatCard
              label="Completed Payments"
              value={String(stats?.completedCount ?? 0)}
              sub="Settled"
              color="green"
            />
            <StatCard
              label="Pending Settlements"
              value={String(stats?.pendingSettlements ?? 0)}
              sub="Awaiting"
              color="yellow"
            />
            <StatCard
              label="Active Customers"
              value={String(stats?.activeCustomers ?? 0)}
              sub="Unique senders"
              color="blue"
            />
          </>
        )}
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
          <Link href="/transactions" className="text-sm text-indigo-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {loadingTxns ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : txnsError ? (
          <div className="p-6 text-red-600 text-sm">Could not load transactions: {txnsError}</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No transactions yet.</p>
            <p className="text-gray-400 text-xs mt-1">Transactions will appear here once customers send payments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 hidden md:table-cell">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500 hidden lg:table-cell">Stellar Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{tx.id.slice(0, 8)}…</td>
                    <td className="px-6 py-4 font-semibold">
                      {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tx.currency}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {tx.stellarTxHash ? (
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${tx.stellarTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-indigo-600 hover:underline"
                        >
                          {tx.stellarTxHash.slice(0, 12)}…
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
