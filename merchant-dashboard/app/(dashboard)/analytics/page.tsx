'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AnalyticsData {
  dailyVolume: { day: string; volume: number; count: number }[];
  statusCounts: Record<string, number>;
  currencyCounts: Record<string, number>;
  totalAnalyzed: number;
}

function BarChart({ data, maxValue }: { data: { day: string; volume: number }[]; maxValue: number }) {
  const displayData = data.filter((_, i) => i % Math.ceil(data.length / 14) === 0);
  
  return (
    <div className="flex items-end gap-1 h-40 w-full">
      {displayData.map((item, i) => {
        const heightPercent = maxValue > 0 ? (item.volume / maxValue) * 100 : 0;
        const safeHeight = Math.max(heightPercent, 2);
        return (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors"
              style={{ height: `${safeHeight}%` }}
              title={`${item.day}: $${item.volume.toFixed(2)}`}
            />
            <span className="text-[10px] text-gray-400 rotate-45 origin-top-left whitespace-nowrap">
              {new Date(item.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
        No data
      </div>
    );
  }

  let currentAngle = 0;
  const segments = Object.entries(data).map(([label, value]) => {
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { label, value, angle, startAngle, color: colors[label] || '#9ca3af' };
  });

  const gradientStops = segments
    .map((seg) => `${seg.color} ${seg.startAngle}deg ${seg.startAngle + seg.angle}deg`)
    .join(', ');

  return (
    <div className="relative w-32 h-32">
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(${gradientStops})`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{total}</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    COMPLETED: '#22c55e',
    PENDING: '#eab308',
    FAILED: '#ef4444',
    CANCELLED: '#9ca3af',
  };

  const currencyColors: Record<string, string> = {
    USDC: '#3b82f6',
    XLM: '#8b5cf6',
    EUR: '#10b981',
    NGN: '#f59e0b',
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Transaction trends and distribution</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 sm:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Failed to load analytics: {error}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Volume over time */}
          <div className="bg-white rounded-xl border p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Daily Volume (30 days)</h2>
            <p className="text-xs text-gray-400 mb-4">
              {data.totalAnalyzed} transactions analyzed
            </p>
            {data.dailyVolume.length > 0 && (
              <BarChart data={data.dailyVolume} maxValue={Math.max(...data.dailyVolume.map((d) => d.volume), 1)} />
            )}
          </div>

          {/* Status breakdown */}
          <div className="bg-white rounded-xl border p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Status Breakdown</h2>
            <p className="text-xs text-gray-400 mb-4">Transaction distribution by status</p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <DonutChart data={data.statusCounts} colors={statusColors} />
              <div className="flex flex-wrap gap-3">
                {Object.entries(data.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColors[status] || '#9ca3af' }}
                    />
                    <span className="text-xs text-gray-600">
                      {status.charAt(0) + status.slice(1).toLowerCase()}: {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Currency breakdown */}
          <div className="bg-white rounded-xl border p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Currency Distribution</h2>
            <p className="text-xs text-gray-400 mb-4">Transaction counts by asset</p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <DonutChart data={data.currencyCounts} colors={currencyColors} />
              <div className="flex flex-wrap gap-3">
                {Object.entries(data.currencyCounts).map(([currency, count]) => (
                  <div key={currency} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: currencyColors[currency] || '#9ca3af' }}
                    />
                    <span className="text-xs text-gray-600">
                      {currency}: {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="bg-white rounded-xl border p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total transactions</span>
                <span className="font-medium text-gray-900">{data.totalAnalyzed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed</span>
                <span className="font-medium text-green-600">{data.statusCounts.COMPLETED || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-yellow-600">{data.statusCounts.PENDING || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Failed</span>
                <span className="font-medium text-red-600">{data.statusCounts.FAILED || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cancelled</span>
                <span className="font-medium text-gray-600">{data.statusCounts.CANCELLED || 0}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
