import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin Bookings Page', () => {
  test('Shows Comenzi title', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Comenzi' }).click();
    await expect(page).toHaveURL('/comenzi');
    await expect(
      page.getByRole('heading', { name: 'Comenzi' }),
    ).toBeVisible();
  });

  test('Shows status filter tabs', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Comenzi' }).click();
    await expect(page).toHaveURL('/comenzi');
    await expect(page.getByRole('button', { name: 'Toate' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'In asteptare' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Confirmate' }),
    ).toBeVisible();
  });

  test('Tab clicking works', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Comenzi' }).click();
    await expect(page).toHaveURL('/comenzi');
    await page.getByRole('button', { name: 'Finalizate' }).click();
    // The tab should change - no crash
    await expect(
      page.getByRole('button', { name: 'Finalizate' }),
    ).toBeVisible();
  });

  test('Shows results or empty state', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Comenzi' }).click();
    await expect(page).toHaveURL('/comenzi');
    await page.waitForTimeout(2000);
    await expect(page.locator('main')).toBeVisible();
  });
});
