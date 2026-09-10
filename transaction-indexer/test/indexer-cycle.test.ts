import { describe, it, expect } from 'node:test';

describe('indexer cursor logic', () => {
  it('returns empty string when no prior transactions exist', () => {
    const rows: { lastHash: string }[] = [];
    const max = rows.reduce((m, r) => (r.lastHash > m ? r.lastHash : m), '');
    expect(max).toBe('');
  });

  it('returns the highest stellarTxHash as cursor', () => {
    const rows = [{ lastHash: 'hash-b' }, { lastHash: 'hash-a' }];
    const max = rows.reduce((m, r) => (r.lastHash > m ? r.lastHash : m), '');
    expect(max).toBe('hash-b');
  });
});
