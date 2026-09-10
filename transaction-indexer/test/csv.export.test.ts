import { transactionsToCSV, downloadCSV } from '../src/common/export/csv.export';

describe('transactionsToCSV', () => {
  it('returns header-only CSV for empty input', () => {
    const result = transactionsToCSV([]);
    expect(result).toBe('id,amount,currency,status,stellarTxHash,createdAt\n');
  });

  it('converts transaction array to CSV rows', () => {
    const txs = [{ id: 'tx-1', amount: '100.50', currency: 'USDC', status: 'COMPLETED' }];
    const result = transactionsToCSV(txs);
    expect(result).toContain('tx-1');
    expect(result).toContain('100.50');
    expect(result).toContain('USDC');
  });

  it('escapes double-quotes in field values', () => {
    const txs = [{ id: 'tx-1', amount: '1"000', currency: 'XLM', status: 'PENDING' }];
    const result = transactionsToCSV(txs);
    expect(result).toContain('"1""000"');
  });
});

describe('downloadCSV', () => {
  it('returns Content-Disposition header with filename', () => {
    const result = downloadCSV('id,amount\n1,100', 'transactions.csv');
    expect(result.headers['Content-Type']).toBe('text/csv; charset=utf-8');
    expect(result.headers['Content-Disposition']).toBe('attachment; filename="transactions.csv"');
    expect(result.body).toContain('\uFEFF');
  });
});
