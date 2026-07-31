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
