import { useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export function useTableSort<T>(initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const requestSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }

    setData((prev) => {
      const sorted = [...prev].sort((a: any, b: any) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal === bVal) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? cmp : -cmp;
      });
      return sorted;
    });
  };

  return { data, sortKey, sortDirection, requestSort };
}
