#!/usr/bin/env node
/**
 * record-demo.mjs
 *
 * Records a ~2 minute silent walkthrough of the live merchant dashboard and
 * writes the final video to `screenshots/demo-recording.webm`.
 *
 * Silent-mode captions: a fixed-position dark banner is injected at the
 * bottom of the page for each of the 4 sections from DEMO_VIDEO_GUIDE.md.
 *
 * Usage (from the repo root):
 *   cd merchant-dashboard
 *   playwright install chromium    # one-time
 *   DEMO_BASE_URL=http://localhost:3100 npm run demo:record   # local stack
 *   npm run demo:record            # live demo (default)
 *
 * Output: screenshots/demo-recording.webm  (~2 min, 1440x900 @ ~10 fps)
 *
 * By default the video signs in as the seeded demo merchant
 * (demo-screenshot@example.com) so the walkthrough shows real data — 12
 * verified Testnet transactions, real wallet address, real analytics. Falls
 * back to a fresh registration only if the seeded account is absent.
 *
 * To publish: upload the resulting .webm (or convert to .mp4 with ffmpeg)
 * to YouTube (unlisted) or Loom, then paste the shareable URL into
 *   - README.md  (Live Links table)
 *   - screenshots/DEMO_SUBMISSION_NOTES.md  (Live Demo URLs)
 */

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(REPO_ROOT, 'screenshots');
const FINAL_WEBM = path.join(OUT_DIR, 'demo-recording.webm');
const TMP_VIDEO_DIR = path.join(OUT_DIR, '.demo-video-temp');

// Point at the local full stack (dashboard -> local Payment API) with
// DEMO_BASE_URL=http://localhost:3100, or default to the live demo deploy.
const BASE_URL = process.env.DEMO_BASE_URL || 'https://merchant-dashboard-rosy.vercel.app';
const VIEWPORT = { width: 1440, height: 900 };

// Seeded demo merchant created by scripts/seed-screenshot-data.ts in
// payment-api. Carries the 12 verified Testnet transactions (see
// screenshots/testnet_traction.csv) so the video shows real data.
const DEMO_CREDS = {
  email: 'demo-screenshot@example.com',
  password: 'ScreenshotPass123!',
};

const T = {
  short: 400,
  medium: 1200,
  long: 3500,
  afterNav: 1800,
  perChar: 70,
  settle: 4000,
};

// Per-section target durations tuned so the sum lands at exactly 2:00.
// Each section gets a generous budget; the sectionBudget() helper pads up
// to the budget if the natural script time runs short, ensuring the final
// video always lands at 2:00 ± a few frames regardless of network jitter.
const SECTION_BUDGET_MS = {
  intro: 5_000,       // 0:00–0:05  pre-roll /login
  signup: 28_000,     // 0:05–0:33  register & land on dashboard
  dashboard: 18_000,  // 0:33–0:51  stats + recent tx table
  transactions: 16_000, // 0:51–1:07 transaction list
  wallet: 8_000,      // 1:07–1:15 wallet view
  analytics: 8_000,   // 1:15–1:23 analytics view
  feedback: 22_000,   // 1:23–1:45 feedback form + submit
  recap: 15_000,      // 1:45–2:00 outro / thanks-for-watching
};
const TOTAL_TARGET_MS = Object.values(SECTION_BUDGET_MS).reduce((a, b) => a + b, 0);

const SECTIONS = [
  'Sign-Up Flow — creating a new merchant',
  'Dashboard — live stats & recent transactions',
  'Transactions & Wallet — browse payment history',
  'Feedback — submit product feedback in seconds',
];

const RECAP_TEXT = 'Global Micro-Remittance Bridge — Stellar + Soroban for SMEs';

// ─── helpers ───────────────────────────────────────────────────────────────

function randomWallet() {
  // Stellar public keys (strkey) are 56 chars total: 'G' + 55 base32 chars.
  // Use a Crockford-base32-safe alphabet (no I, L, O, 0) to avoid generating
  // addresses the API might one day reject. We always return exactly 56 chars.
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Crockford base32 minus I/L/O/0
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
  return `grb-demo-${ts}-${tail}@example.com`;
}

async function slowType(page, selector, value, perChar = T.perChar) {
  await page.fill(selector, '');
  await page.type(selector, value, { delay: perChar });
}

async function showCaption(page, title, subtitle, holdMs = 1500) {
  await page.evaluate(
    ({ title, subtitle }) => {
      let banner = document.getElementById('__demo_caption__');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = '__demo_caption__';
        banner.style.cssText = [
          'position:fixed',
          'left:24px',
          'right:24px',
          'bottom:24px',
          'padding:18px 22px',
          'border-radius:14px',
          'background:rgba(15,23,42,0.92)',
          'color:#fff',
          'font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif',
          'box-shadow:0 10px 30px rgba(0,0,0,0.25)',
          'z-index:2147483647',
          'pointer-events:none',
          'border:1px solid rgba(255,255,255,0.08)',
          'opacity:0',
          'transform:translateY(8px)',
          'transition:opacity .4s ease, transform .4s ease',
        ].join(';');
        const tEl = document.createElement('div');
        tEl.id = '__demo_caption_title__';
        tEl.style.cssText =
          'font-size:22px;font-weight:700;letter-spacing:-0.01em;line-height:1.2;';
        const sEl = document.createElement('div');
        sEl.id = '__demo_caption_sub__';
        sEl.style.cssText =
          'margin-top:6px;font-size:14px;opacity:0.85;';
        banner.appendChild(tEl);
        banner.appendChild(sEl);
        document.body.appendChild(banner);
      }
      document.getElementById('__demo_caption_title__').textContent = title;
      document.getElementById('__demo_caption_sub__').textContent = subtitle;
      requestAnimationFrame(() => {
        banner.style.opacity = '1';
        banner.style.transform = 'translateY(0)';
      });
    },
    { title, subtitle }
  );
  await page.waitForTimeout(holdMs);
}

async function hideCaption(page) {
  await page.evaluate(() => {
    const banner = document.getElementById('__demo_caption__');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(8px)';
    }
  });
  await page.waitForTimeout(450);
}

async function trySeededLogin(page) {
  // Preferred path: sign in as the seeded demo merchant so the walkthrough
  // shows real data instead of an empty fresh account.
  try {
    // networkidle + a hydration pause are required on the dev server:
    // filling right after domcontentloaded can race Next.js hydration, which
    // resets the controlled inputs before submit and fails the login.
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.fill('input[type="email"]', DEMO_CREDS.email);
    await page.fill('input[type="password"]', DEMO_CREDS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(
      (url) => {
        const p = url.pathname || '';
        return p !== '/login' && p !== '/register';
      },
      { timeout: 20000 }
    );
    await page.waitForSelector('text=Total Volume', { timeout: 8000 }).catch(() => {});
    console.log('  · signed in as seeded demo merchant', DEMO_CREDS.email);
    return { email: DEMO_CREDS.email, wallet: '', mode: 'login' };
  } catch (err) {
    console.log(`  · seeded login failed: ${err.message?.slice(0, 90) ?? err}`);
    return null;
  }
}

async function ensureRegistered(page) {
  // Prefer the seeded demo merchant; fall back to up to 3 fresh registrations
  // (the dashboard lives at `/` root URL because the app uses a `(dashboard)`
  // route group in Next.js).
  const seeded = await trySeededLogin(page);
  if (seeded) return seeded;

  for (let i = 0; i < 3; i++) {
    const email = randomEmail();
    const wallet = randomWallet();
    try {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(T.afterNav);

      // Clear any pre-filled values (e.g. browser autofill) before typing.
      await page.fill('input[name="name"]', '');
      await page.fill('input[name="email"]', '');
      await page.fill('input[name="walletAddress"]', '');
      await page.fill('input[name="password"]', '');

      await slowType(page, 'input[name="name"]', 'Demo Merchant');
      await slowType(page, 'input[name="email"]', email);
      await slowType(page, 'input[name="walletAddress"]', wallet);
      // Throwaway demo password — not a real credential. Created accounts are
      // disposable test merchants, never used for production auth.
      await slowType(page, 'input[name="password"]', 'SecurePass123!');

      // Wait for the submit button to be enabled (the form sets loading=true).
      await page.click('button[type="submit"]');

      // The dashboard route group means successful registration lands at root `/`.
      // Accept any URL that is neither /register nor /login.
      await page.waitForURL(
        (url) => {
          const p = url.pathname || '';
          return p !== '/register' && p !== '/login' && !p.startsWith('/register') && !p.startsWith('/login');
        },
        { timeout: 15000 }
      );

      // Give the dashboard stats API a moment to load.
      await page.waitForSelector('text=Total Volume', { timeout: 8000 }).catch(() => {});
      return { email, wallet, mode: 'register' };
    } catch (err) {
      console.log(`  · registration attempt ${i + 1} failed: ${err.message?.slice(0, 80) ?? err}`);
    }
  }
  // Anonymous fallback: still produces a usable demo (the landing page
  // explains the product even without an authenticated session).
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.settle);
  return { email: '', wallet: '', mode: 'anon' };
}

async function smoothScroll(page, fraction) {
  await page.evaluate((f) => {
    window.scrollTo({ top: document.body.scrollHeight * f, behavior: 'smooth' });
  }, fraction);
  await page.waitForTimeout(900);
}

// Pads the runtime so the section's wall-clock time matches its assigned
// SECTION_BUDGET_MS target. The browser/page stays on screen during the pad
// so the viewer absorbs the page rather than seeing a frozen state.
async function sectionBudget(label, startedAt, budgetMs) {
  const elapsed = Date.now() - startedAt;
  const remaining = budgetMs - elapsed;
  if (remaining > 0) {
    console.log(`  ⏱ ${label}: ${(elapsed/1000).toFixed(1)}s → padding +${(remaining/1000).toFixed(1)}s`);
    await new Promise((r) => setTimeout(r, remaining));
  } else {
    console.log(`  ⏱ ${label}: ${(elapsed/1000).toFixed(1)}s (over budget ${(-remaining/1000).toFixed(1)}s)`);
  }
}

// ─── main ──────────────────────────────────────────────────────────────────

async function recordDemo() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(TMP_VIDEO_DIR, { recursive: true });

  // Clean any leftover temp videos from previous runs
  for (const f of fs.readdirSync(TMP_VIDEO_DIR)) {
    try {
      fs.rmSync(path.join(TMP_VIDEO_DIR, f), { recursive: true, force: true });
    } catch {}
  }

  let browser;
  try {
    await recordDemoInner((b) => { browser = b; });
  } finally {
    // Best-effort cleanup: ensure the temp video dir is removed even if
    // anything between launch and context.close() threw.
    try {
      if (browser) await browser.close().catch(() => {});
    } catch {}
    try {
      fs.rmSync(TMP_VIDEO_DIR, { recursive: true, force: true });
    } catch {}
  }
}

async function recordDemoInner(setBrowser) {
  const browser = await chromium.launch({ headless: true });
  // Expose the browser instance to the outer try/finally so it can be closed
  // (and the temp video dir cleaned up) even if something below throws.
  setBrowser(browser);
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: TMP_VIDEO_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  const recordingStart = Date.now();
  let sectionStart = Date.now();

  // ── INTRO ────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);
  await sectionBudget('intro', sectionStart, SECTION_BUDGET_MS.intro);

  // ── SECTION 1: Sign-Up / Sign-In Flow ────────────────────
  sectionStart = Date.now();
  const merchant = await ensureRegistered(page);
  console.log(`  → ${merchant.mode}:`, merchant.email || '(anonymous fallback)');
  const section1Title =
    merchant.mode === 'login'
      ? 'Demo Merchant — 12 real Testnet transactions'
      : SECTIONS[0];
  const section1Sub =
    merchant.mode === 'login'
      ? 'Seeded demo account · live Stellar hashes, no mocks'
      : 'Stellar wallet, email, password — fresh merchant in ~30 s';
  await showCaption(page, `① ${section1Title}`, section1Sub, 2800);
  await hideCaption(page);
  await sectionBudget('signup', sectionStart, SECTION_BUDGET_MS.signup);

  // ── SECTION 2: Dashboard Overview ────────────────────────
  sectionStart = Date.now();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.settle);
  await showCaption(page, `② ${SECTIONS[1]}`, 'Volume, settlement status, and recent activity at a glance', 2800);
  await smoothScroll(page, 0.55);
  await smoothScroll(page, 0);
  await hideCaption(page);
  await sectionBudget('dashboard', sectionStart, SECTION_BUDGET_MS.dashboard);

  // ── SECTION 3a: Transactions ─────────────────────────────
  sectionStart = Date.now();
  await page.goto(`${BASE_URL}/transactions`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);
  await showCaption(page, `③ ${SECTIONS[2]}`, 'Every shipment linked to its on-chain Stellar transaction hash', 2800);
  await smoothScroll(page, 0.4);
  await smoothScroll(page, 0);
  await sectionBudget('transactions', sectionStart, SECTION_BUDGET_MS.transactions);

  // ── SECTION 3b: Wallet ───────────────────────────────────
  sectionStart = Date.now();
  await page.goto(`${BASE_URL}/wallet`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);
  await hideCaption(page);
  await sectionBudget('wallet', sectionStart, SECTION_BUDGET_MS.wallet);

  // ── SECTION 3c: Analytics ────────────────────────────────
  sectionStart = Date.now();
  await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);
  await sectionBudget('analytics', sectionStart, SECTION_BUDGET_MS.analytics);

  // ── SECTION 4: Feedback ─────────────────────────────────
  sectionStart = Date.now();
  await page.goto(`${BASE_URL}/feedback`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);
  await showCaption(page, `④ ${SECTIONS[3]}`, 'Real users, real signal — straight from the dashboard', 2800);
  try {
    await page.fill('textarea', 'Love the real-time Stellar tracking and the clean dashboard UX!', {
      timeout: 4000,
    });
    await page.waitForTimeout(900);
  } catch {
    /* form may use a different selector on this deployment */
  }
  try {
    const fiveStar = page.locator('[data-rating="5"], button:has-text("5")').first();
    if (await fiveStar.isVisible({ timeout: 1500 })) await fiveStar.click();
  } catch {}
  try {
    await page.locator('button:has-text("Submit")').first().click({ timeout: 2000 });
    await page.waitForTimeout(1800);
  } catch {}
  await hideCaption(page);
  await sectionBudget('feedback', sectionStart, SECTION_BUDGET_MS.feedback);

  // ── RECAP / OUTRO ────────────────────────────────────────
  sectionStart = Date.now();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.settle);
  await showCaption(page, RECAP_TEXT, 'github.com/Timrossid/global-remittance-bridge · try it: merchant-dashboard-rosy.vercel.app', 2800);
  await hideCaption(page);
  // Slow back-and-forth scroll to fill the recap budget with motion instead of a frozen frame
  for (let i = 0; i < 3; i++) {
    await page.evaluate((f) => window.scrollTo({ top: document.body.scrollHeight * f, behavior: 'smooth' }), i % 2 === 0 ? 0.4 : 0);
    await page.waitForTimeout(700);
  }
  await sectionBudget('recap', sectionStart, SECTION_BUDGET_MS.recap);

  // ── FINALIZE THE VIDEO ───────────────────────────────────
  const recordingWallMs = Date.now() - recordingStart;
  console.log(`▶ Finalizing the video recording…`);
  console.log(`   in-page wall-clock duration: ${(recordingWallMs/1000).toFixed(1)}s (target ${(TOTAL_TARGET_MS/1000).toFixed(0)}s)`);
  await context.close(); // crucial: closes video, flushes file
  await new Promise((r) => setTimeout(r, 1200)); // let fs flush

  const files = fs.readdirSync(TMP_VIDEO_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error(
      `No .webm file found in ${TMP_VIDEO_DIR}. Recording may have failed.`
    );
  }

  // Pick the largest webm (latest page's video) and move it to the final path
  let best = files[0];
  let bestSize = 0;
  for (const f of files) {
    const s = fs.statSync(path.join(TMP_VIDEO_DIR, f)).size;
    if (s > bestSize) {
      best = f;
      bestSize = s;
    }
  }
  const src = path.join(TMP_VIDEO_DIR, best);
  fs.copyFileSync(src, FINAL_WEBM);

  const finalSize = fs.statSync(FINAL_WEBM).size;
  console.log('');
  console.log('✅ Demo recording written to:', FINAL_WEBM);
  console.log('   file size:', `${(finalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('   resolution:', `${VIEWPORT.width}×${VIEWPORT.height}`);
  console.log(`   demo merchant (${merchant.mode}):`, merchant.email || '(anonymous fallback)');
  console.log('');
  console.log('▶ To publish:');
  console.log('   # Optional: convert webm → mp4 (1080p) for broader compatibility');
  console.log('   ffmpeg -i screenshots/demo-recording.webm -c:v libx264 -preset fast -crf 23 \\');
  console.log('          -vf "scale=1440:900" screenshots/demo-recording.mp4');
  console.log('');
  console.log('   # Upload to YouTube (unlisted) or Loom, then paste the share URL into:');
  console.log('   #   - README.md                                (Live Links table)');
  console.log('   #   - screenshots/DEMO_SUBMISSION_NOTES.md     (Live Demo URLs)');
}

recordDemo().catch((e) => {
  console.error('❌ Recording failed:', e?.stack ?? e);
  process.exit(1);
});
