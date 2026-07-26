#!/usr/bin/env node
/**
 * capture-screenshots.mjs
 *
 * Logs into the live merchant dashboard and captures all required submission
 * screenshots into ./screenshots/. Requires the user to exist — registers a
 * fresh demo merchant on first use.
 *
 * Usage:
 *   cd merchant-dashboard
 *   npm run demo:install-browser   # one-time
 *   npm run demo:capture           # runs this script
 *
 * Output (in ./screenshots/):
 *   dashboard.png, transactions.png, analytics.png,
 *   wallet-interactions.png, feedback.png, mobile-view.png
 */

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(PROJECT_ROOT, 'screenshots');

const BASE_URL = 'https://merchant-dashboard-rosy.vercel.app';
const VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 375, height: 812 };

const DEMO_CREDS = {
  email: 'demo-screenshot@example.com',
  password: 'ScreenshotPass123!',
};

function randomWallet() {
  // 56-char Stellar public key (G + 55 base32 chars).
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const out = new Array(55);
  const buf = crypto.randomBytes(55);
  for (let i = 0; i < 55; i++) {
    out[i] = alphabet[buf[i] % alphabet.length];
  }
  return 'G' + out.join('');
}

function randomEmail() {
  const ts = Date.now().toString(36);
  const tail = crypto.randomBytes(3).toString('hex');
  return `grb-screen-${ts}-${tail}@example.com`;
}

async function ensureRegistered(page) {
  // First, try logging in as the demo account. If that fails, register a fresh
  // merchant with random credentials.
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"]', DEMO_CREDS.email);
  await page.fill('input[type="password"]', DEMO_CREDS.password);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL(
      (url) => {
        const p = url.pathname || '';
        return p !== '/login' && p !== '/register';
      },
      { timeout: 8000 }
    );
    console.log('  · logged in as', DEMO_CREDS.email);
    return DEMO_CREDS.email;
  } catch {
    console.log('  · login failed; registering a fresh merchant instead');
  }

  // Fall back to registration.
  const email = randomEmail();
  const wallet = randomWallet();
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  await page.fill('input[name="name"]', 'Demo Merchant');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="walletAddress"]', wallet);
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(
    (url) => {
      const p = url.pathname || '';
      return p !== '/register' && p !== '/login';
    },
    { timeout: 15000 }
  );
  console.log('  · registered', email);
  return email;
}

async function captureSet(page, label) {
  console.log(`Capturing ${label}…`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${label}.png`), fullPage: false });
}

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  console.log('Launching Chromium…');
  const browser = await chromium.launch({ headless: true });
  let context;
  let page;
  try {
    context = await browser.newContext({ viewport: VIEWPORT });
    page = await context.newPage();

    console.log('Authenticating…');
    await ensureRegistered(page);

    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await captureSet(page, 'dashboard');

    await page.goto(`${BASE_URL}/transactions`, { waitUntil: 'domcontentloaded' });
    await captureSet(page, 'transactions');

    await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'domcontentloaded' });
    await captureSet(page, 'analytics');

    await page.goto(`${BASE_URL}/wallet`, { waitUntil: 'domcontentloaded' });
    await captureSet(page, 'wallet-interactions');

    await page.goto(`${BASE_URL}/feedback`, { waitUntil: 'domcontentloaded' });
    await captureSet(page, 'feedback');

    await context.close();
    context = null;

    // ── Mobile view ─────────────────────────────────────
    console.log('Capturing mobile view…');
    const mobileContext = await browser.newContext({ viewport: MOBILE_VIEWPORT });
    const mobilePage = await mobileContext.newPage();
    await ensureRegistered(mobilePage);
    await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'mobile-view.png'),
      fullPage: false,
    });
    await mobileContext.close();

    console.log('All screenshots captured in', SCREENSHOTS_DIR);
  } finally {
    if (context) await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

main().catch((e) => {
  console.error('Screenshot capture failed:', e?.stack ?? e);
  process.exit(1);
});
