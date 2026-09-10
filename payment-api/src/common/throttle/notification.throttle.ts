type ThrottleEntry = { lastSent: number; count: number };

const store = new Map<string, ThrottleEntry>();

export function isThrottled(key: string, windowMs: number, maxPerWindow: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.lastSent > windowMs) {
    store.set(key, { lastSent: now, count: 1 });
    return false;
  }
  entry.count += 1;
  if (entry.count > maxPerWindow) return true;
  store.set(key, entry);
  return false;
}

export function resetThrottle(key: string) {
  store.delete(key);
}
