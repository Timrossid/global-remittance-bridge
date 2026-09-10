'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('[SW] Registered:', registration.scope);
      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    register();
  }, []);

  return null;
}
