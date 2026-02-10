import { test, expect } from '@playwright/test';
import { loginAsCompanyAdmin } from './helpers';

test.describe('Orders page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCompanyAdmin(page);
    await page.getByText('Comenzi').first().click();
    await page.waitForURL('/comenzi');
  });

  test('Shows page title', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Comenzi' }),
    ).toBeVisible();
  });

  test('Shows filter tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Toate' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'In asteptare' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmate' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'In desfasurare' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finalizate' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Anulate' })).toBeVisible();
  });

  test('Shows results count or empty state', async ({ page }) => {
    // Wait for loading to finish
    await page.waitForTimeout(2000);

    // Either shows count text or empty state
    const countText = page.getByText(/\d+ comenzi gasite/);
    const emptyState = page.getByText('Nicio comanda');
    const hasCount = await countText.isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasCount || hasEmpty).toBe(true);
  });

  test('Can click filter tabs', async ({ page }) => {
    const pendingTab = page.getByRole('button', { name: 'In asteptare' });
    await pendingTab.click();

    // Tab should be active (has primary color classes)
    await expect(pendingTab).toHaveClass(/bg-primary/);
  });
});
