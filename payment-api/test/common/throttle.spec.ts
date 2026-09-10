import { isThrottled, resetThrottle } from '../../src/common/throttle/notification.throttle';

describe('notification throttle', () => {
  beforeEach(() => {
    resetThrottle('k1');
    resetThrottle('k2');
  });

  it('allows first send', () => {
    expect(isThrottled('k1', 60000, 3)).toBe(false);
  });

  it('blocks after exceeding maxPerWindow', () => {
    expect(isThrottled('k1', 60000, 2)).toBe(false);
    expect(isThrottled('k1', 60000, 2)).toBe(false);
    expect(isThrottled('k1', 60000, 2)).toBe(true);
  });

  it('resets after window expires', async () => {
    expect(isThrottled('k2', 50, 1)).toBe(false);
    expect(isThrottled('k2', 50, 1)).toBe(true);
    await new Promise((r) => setTimeout(r, 60));
    expect(isThrottled('k2', 50, 1)).toBe(false);
  });
});
