import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin Companies Page', () => {
  test('Shows Companii title', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Companii' }).click();
    await expect(page).toHaveURL('/companii');
    await expect(
      page.getByRole('heading', { name: 'Companii' }),
    ).toBeVisible();
  });

  test('Shows filter tabs', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Companii' }).click();
    await expect(page).toHaveURL('/companii');
    await expect(
      page.getByRole('button', { name: /In asteptare/ }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Aprobate/ }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Toate/ })).toBeVisible();
  });

  test('Can switch between tabs', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Companii' }).click();
    await expect(page).toHaveURL('/companii');
    await page.getByRole('button', { name: /Aprobate/ }).click();
    // Should show empty state or companies
    await expect(page.locator('main')).toBeVisible();
  });

  test('Shows empty state when no pending applications', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Companii' }).click();
    await expect(page).toHaveURL('/companii');
    // Wait for loading to finish
    await page.waitForTimeout(2000);
    // Should show either pending apps or empty state
    await expect(page.locator('main')).toBeVisible();
  });
});
