'use client';
import React from 'react';

const STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];

export function StatusFilter({ onFilter }: { onFilter: (status: string) => void }) {
  return (
    <select
      onChange={(e) => onFilter(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
    >
      <option value="">All statuses</option>
      {STATUSES.map((status) => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>
  );
}
