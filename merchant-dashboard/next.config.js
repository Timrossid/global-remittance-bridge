/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

// Org/project come from env vars so they match the owner's Sentry account.
const org = process.env.SENTRY_ORG || '';
const project = process.env.SENTRY_PROJECT || '';
const authToken = process.env.SENTRY_AUTH_TOKEN || '';

// Only enable Sentry source-map/release upload when org, project AND token are
// all configured. With no auth token the plugin safely skips CLI release
// management, so local builds / incomplete Vercel setup never hard-fail.
const sentryWebpackPluginOptions = {
  org: org || 'sentry-org-placeholder',
  project: project || 'sentry-project-placeholder',
  authToken: org && project && authToken ? authToken : undefined,
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);