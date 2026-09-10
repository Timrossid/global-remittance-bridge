import { isThrottled, resetThrottle } from '../../src/common/throttle/notification.throttle';

describe('notification throttle', () => {
  beforeEach(() => {
    for (const key of ['user-1', 'user-2']) resetThrottle(key);
  });

  it('allows first send', () => {
    expect(isThrottled('user-1', 60000, 3)).toBe(false);
  });

  it('blocks after exceeding maxPerWindow', () => {
    expect(isThrottled('user-1', 60000, 2)).toBe(false);
    expect(isThrottled('user-1', 60000, 2)).toBe(false);
    expect(isThrottled('user-1', 60000, 2)).toBe(true);
  });

  it('resets after window expires', async () => {
    expect(isThrottled('user-2', 50, 1)).toBe(false);
    expect(isThrottled('user-2', 50, 1)).toBe(true);
    await new Promise((r) => setTimeout(r, 60));
    expect(isThrottled('user-2', 50, 1)).toBe(false);
  });
});
