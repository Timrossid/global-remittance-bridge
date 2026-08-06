import { expect, test } from '@playwright/test';

test('renders the merchant sign-in flow', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle(/Merchant Dashboard/i);
  await expect(page.getByRole('heading', { name: 'Global Remittance Bridge' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register here' })).toHaveAttribute('href', '/register');
});

test('connects a mocked Testnet wallet on the escrow page', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'playwright-test-token');
    localStorage.setItem('merchant', JSON.stringify({ name: 'Playwright Merchant' }));
    (window as Window & {
      __SOROBAN_TEST_WALLET__?: { address: string; networkPassphrase: string };
    }).__SOROBAN_TEST_WALLET__ = {
      address: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
      networkPassphrase: 'Test SDF Network ; September 2015',
    };
  });

  await page.goto('/escrow');
  await page.getByRole('button', { name: 'Connect Freighter' }).click();

  await expect(page.getByText('Freighter connected. Review the escrow details before signing.')).toBeVisible();
  await expect(page.getByText('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF')).toBeVisible();
  await expect(page.getByText('Testnet only')).toBeVisible();
  await expect(page.getByText('initialize(admin)')).toBeVisible();
  await expect(page.getByText('create_escrow(sender, receiver, token, amount) -> u64')).toBeVisible();
});
