export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelay?: number; maxDelay?: number } = {},
): Promise<T> {
  const { retries = 3, baseDelay = 1000, maxDelay = 8000 } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === retries) break;
      const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
