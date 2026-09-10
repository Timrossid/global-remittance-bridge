import { transactionsToCSV, downloadCSV } from '../../src/common/export/csv.export';

describe('CSV export', () => {
  it('returns header-only CSV for empty input', () => {
    expect(transactionsToCSV([])).toBe('id,amount,currency,status,stellarTxHash,createdAt\n');
  });

  it('converts transactions to CSV rows', () => {
    const result = transactionsToCSV([{ id: 'tx-1', amount: '100', currency: 'USDC', status: 'COMPLETED' }]);
    expect(result).toContain('tx-1');
    expect(result).toContain('USDC');
  });

  it('escapes double-quotes', () => {
    const result = transactionsToCSV([{ id: 'tx-1', amount: '1"000', currency: 'XLM', status: 'PENDING' }]);
    expect(result).toContain('"1""000"');
  });

  it('downloadCSV returns BOM and headers', () => {
    const { headers, body } = downloadCSV('id\n1', 'out.csv');
    expect(headers['Content-Type']).toBe('text/csv; charset=utf-8');
    expect(headers['Content-Disposition']).toBe('attachment; filename="out.csv"');
    expect(body.startsWith('\uFEFF')).toBe(true);
  });
});
