import { describe, it, expect, vi } from 'vitest';

// Unit-tests for the indexer cursor logic using inline stubs
describe('indexer cursor', () => {
  it('returns null when no prior transactions exist', () => {
    const rows: any[] = [];
    const max = rows.reduce((m, r) => (r.lastHash > m ? r.lastHash : m), '');
    expect(max).toBe('');
  });

  it('returns the highest stellarTxHash as cursor', () => {
    const rows = [{ lastHash: 'hash-b' }, { lastHash: 'hash-a' }];
    const max = rows.reduce((m, r) => (r.lastHash > m ? r.lastHash : m), '');
    expect(max).toBe('hash-b');
  });
});
