import { useEffect } from 'react';

export function reportWebVitals(metric: { name: string; value: number; id: string }) {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify(metric);
  (navigator.sendBeacon && navigator.sendBeacon('/api/v1/analytics', body)) ||
    fetch('/api/v1/analytics', { body, method: 'POST', keepalive: true });
}

export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          reportWebVitals({
            name: entry.name,
            value: (entry as any).value || entry.startTime,
            id: entry.entryType,
          });
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      observer.observe({ type: 'first-input', buffered: true });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch {
      // PerformanceObserver not supported
    }
  }, []);
}
