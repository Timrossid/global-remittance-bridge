'use client';
import React from 'react';

export function DateRangeFilter({ onFilter }: { onFilter: (start: Date, end: Date) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        onChange={(e) => {
          const start = new Date(e.target.value);
          const end = new Date();
          end.setHours(23, 59, 59, 999);
          onFilter(start, end);
        }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
      <span className="text-gray-400 text-sm">to</span>
      <input
        type="date"
        onChange={(e) => {
          const end = new Date(e.target.value);
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          onFilter(start, end);
        }}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
    </div>
  );
}
