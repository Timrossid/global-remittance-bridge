import { paginate } from '../../src/common/pagination/paginate';

describe('paginate', () => {
  const items = Array.from({ length: 50 }, (_, i) => ({ id: `item-${i}` }));

  it('returns first page with default limit', () => {
    const result = paginate(items, 1, 20);
    expect(result.data).toHaveLength(20);
    expect(result.pageInfo.total).toBe(50);
    expect(result.pageInfo.totalPages).toBe(3);
  });

  it('caps limit at 200', () => {
    const result = paginate(items, 1, 999);
    expect(result.data).toHaveLength(50);
  });

  it('defaults page to 1', () => {
    const result = paginate(items, 0, 10);
    expect(result.pageInfo.page).toBe(1);
    expect(result.data).toHaveLength(10);
  });

  it('returns empty data for out-of-range page', () => {
    const result = paginate(items, 10, 10);
    expect(result.data).toHaveLength(0);
  });
});
