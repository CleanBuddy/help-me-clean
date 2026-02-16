import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin Dashboard Navigation', () => {
  test('Unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/autentificare/);
  });

  test('Protected pages redirect to login', async ({ page }) => {
    await page.goto('/companii');
    await expect(page).toHaveURL(/\/autentificare/);
  });

  test('Sidebar navigation to Companii works', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Companii' }).click();
    await expect(page).toHaveURL('/companii');
  });

  test('Sidebar navigation to Comenzi works', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Comenzi' }).click();
    await expect(page).toHaveURL('/comenzi');
  });

  test('Sidebar navigation to Utilizatori works', async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .locator('aside')
      .getByRole('link', { name: 'Utilizatori' })
      .click();
    await expect(page).toHaveURL('/utilizatori');
  });

  test('Sidebar navigation to Setari works', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Setari' }).click();
    await expect(page).toHaveURL('/setari');
  });
});
