// This file configures the initialization of Sentry for edge features (middleware, edge routes).
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  tracesSampleRate: 1,
  enabled: !!dsn,
});
