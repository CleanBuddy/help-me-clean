import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin Dashboard Page', () => {
  test('Shows Platform Overview title', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText('Platform Overview')).toBeVisible();
  });

  test('Shows stat cards', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText('Total Clienti')).toBeVisible();
    await expect(page.getByText('Total Companii')).toBeVisible();
    await expect(page.getByText('Total Rezervari')).toBeVisible();
    await expect(page.getByText('Venit Total')).toBeVisible();
  });

  test('Shows chart sections', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText('Venit pe luni')).toBeVisible();
    await expect(page.getByText('Rezervari dupa status')).toBeVisible();
  });
});
