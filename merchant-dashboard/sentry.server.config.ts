// This file configures the initialization of Sentry on the server.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  // Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Disable the SDK when no DSN is configured so local development stays clean.
  enabled: !!dsn,
});
