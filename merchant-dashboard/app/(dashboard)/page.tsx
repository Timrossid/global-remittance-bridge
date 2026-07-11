'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
  totalVolume: number;
  pendingSettlements: number;
  activeCustomers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Merchant Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-gray-500 text-sm font-medium">Total Volume</h2>
          <p className="text-2xl font-bold">${stats?.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-gray-500 text-sm font-medium">Pending Settlements</h2>
          <p className="text-2xl font-bold">{stats?.pendingSettlements}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-gray-500 text-sm font-medium">Active Customers</h2>
          <p className="text-2xl font-bold">{stats?.activeCustomers}</p>
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-600">Transaction ID</th>
                <th className="p-4 font-medium text-gray-600">Amount</th>
                <th className="p-4 font-medium text-gray-600">Status</th>
                <th className="p-4 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">TX-98234</td>
                <td className="p-4">$450.00</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Completed</span></td>
                <td className="p-4">2026-07-09</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">TX-98235</td>
                <td className="p-4">$1,200.00</td>
                <td className="p-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Pending</span></td>
                <td className="p-4">2026-07-09</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
