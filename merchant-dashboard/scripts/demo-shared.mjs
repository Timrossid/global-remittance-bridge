/**
 * demo-shared.mjs
 *
 * Constants shared between the demo Playwright scripts
 * (capture-screenshots.mjs and record-demo.mjs) so timing behavior stays
 * in lockstep.
 */

// Pause after the /login page reaches networkidle before filling the auth
// form. Required on the Next.js dev server: filling right after
// domcontentloaded can race React hydration, which resets the controlled
// inputs before submit and fails the login.
export const HYDRATION_PAUSE_MS = 1500;
