export function transactionsToCSV(transactions: Record<string, unknown>[]): string {
  if (transactions.length === 0) return 'id,amount,currency,status,stellarTxHash,createdAt\n';
  const headers = Object.keys(transactions[0]).filter((k) => !['password', 'secret'].includes(k.toLowerCase()));
  const escape = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const rows = [
    headers.join(','),
    ...transactions.map((tx) => headers.map((h) => escape(tx[h])).join(',')),
  ];
  return rows.join('\n') + '\n';
}

export function downloadCSV(csv: string, filename: string): { headers: Record<string, string>; body: string } {
  return {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: '\uFEFF' + csv,
  };
}
