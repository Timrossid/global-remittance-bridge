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
 *   npm run demo:record            # or: node scripts/record-demo.mjs
 *
 * Output: screenshots/demo-recording.webm  (~2 min, 1440x900 @ ~10 fps)
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

const BASE_URL = 'https://merchant-dashboard-rosy.vercel.app';
const VIEWPORT = { width: 1440, height: 900 };

const T = {
  short: 250,
  medium: 700,
  long: 1500,
  afterNav: 900,
  perChar: 35,
  settle: 2400,
};

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

async function ensureRegistered(page) {
  // Try up to 3 fresh registrations; the dashboard lives at `/` (root URL)
  // because the app uses a `(dashboard)` route group in Next.js.
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
      return { email, wallet, registered: true };
    } catch (err) {
      console.log(`  · registration attempt ${i + 1} failed: ${err.message?.slice(0, 80) ?? err}`);
    }
  }
  // Anonymous fallback: still produces a usable demo (the landing page
  // explains the product even without an authenticated session).
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.settle);
  return { email: '', wallet: '', registered: false };
}

async function smoothScroll(page, fraction) {
  await page.evaluate((f) => {
    window.scrollTo({ top: document.body.scrollHeight * f, behavior: 'smooth' });
  }, fraction);
  await page.waitForTimeout(700);
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

  // ── INTRO ────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);

  // ── SECTION 1: Sign-Up Flow ──────────────────────────────
  await showCaption(page, `① ${SECTIONS[0]}`, 'Stellar wallet, email, password — fresh merchant in ~30 s', 1500);
  const merchant = await ensureRegistered(page);
  console.log('  → registration:', merchant);
  await hideCaption(page);

  // ── SECTION 2: Dashboard Overview ────────────────────────
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.settle);
  await showCaption(page, `② ${SECTIONS[1]}`, 'Volume, settlement status, and recent activity at a glance', 1600);
  await smoothScroll(page, 0.55);
  await smoothScroll(page, 0);
  await hideCaption(page);

  // ── SECTION 3: Transactions & Wallet ─────────────────────
  await page.goto(`${BASE_URL}/transactions`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);
  await showCaption(page, `③ ${SECTIONS[2]}`, 'Every shipment linked to its on-chain Stellar transaction hash', 1700);
  await smoothScroll(page, 0.4);
  await smoothScroll(page, 0);

  await page.goto(`${BASE_URL}/wallet`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);
  await hideCaption(page);

  // ── SECTION 4: Feedback ─────────────────────────────────
  await page.goto(`${BASE_URL}/analytics`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);

  await page.goto(`${BASE_URL}/feedback`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.long);
  await showCaption(page, `④ ${SECTIONS[3]}`, 'Real users, real signal — straight from the dashboard', 1700);
  try {
    await page.fill('textarea', 'Love the real-time Stellar tracking and the clean dashboard UX!', {
      timeout: 4000,
    });
    await page.waitForTimeout(700);
  } catch {
    /* form may use a different selector on this deployment */
  }
  try {
    const fiveStar = page.locator('[data-rating="5"], button:has-text("5")').first();
    if (await fiveStar.isVisible({ timeout: 1500 })) await fiveStar.click();
  } catch {}
  try {
    await page.locator('button:has-text("Submit")').first().click({ timeout: 2000 });
    await page.waitForTimeout(1500);
  } catch {}
  await hideCaption(page);

  // ── RECAP / OUTRO ────────────────────────────────────────
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(T.settle);
  await showCaption(page, RECAP_TEXT, 'github.com/Timrossid/global-remittance-bridge', 2200);
  await hideCaption(page);

  // ── FINALIZE THE VIDEO ───────────────────────────────────
  console.log('▶ Finalizing the video recording…');
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
  console.log('   registered demo merchant:', merchant.email || '(anonymous fallback)');
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
