import { retryWithBackoff } from '../../src/common/utils/retry.util';

describe('retryWithBackoff', () => {
  it('returns on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retryWithBackoff(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure then succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('recovered');
    const result = await retryWithBackoff(fn, { retries: 3, baseDelay: 10 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws last error after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent'));
    await expect(retryWithBackoff(fn, { retries: 2, baseDelay: 10 })).rejects.toThrow('persistent');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
