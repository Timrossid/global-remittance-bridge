import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Global Remittance Bridge');
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-red-700')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Register here');
    await expect(page).toHaveURL('/register');
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('merchant', JSON.stringify({ id: 'test', name: 'Test', email: 'test@example.com' }));
    });
  });

  test('should display dashboard when authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Total Volume')).toBeVisible();
    await expect(page.locator('text=Completed Payments')).toBeVisible();
  });
});
