/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

const sentryWebpackPluginOptions = {
  org: 'global-remittance-bridge',
  project: 'merchant-dashboard',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Suppresses build errors when no auth token is configured (local dev).
  silent: !process.env.SENTRY_AUTH_TOKEN,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
