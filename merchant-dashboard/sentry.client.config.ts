// This file configures the initialization of Sentry on the client.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  // Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Capture unhandled rejections and exceptions.
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  // Set `tracePropagationTargets` to control for which URLs distributed tracing
  // should be enabled.
  tracePropagationTargets: ['localhost', /^https:\/\/merchant-dashboard-rosy\.vercel\.app/],
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  // Disable the SDK when no DSN is configured so local development stays clean.
  enabled: !!dsn,
});
