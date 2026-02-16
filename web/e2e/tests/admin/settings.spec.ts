import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin Settings Page', () => {
  test('Shows Setari Platforma title', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Setari' }).click();
    await expect(page).toHaveURL('/setari');
    await expect(
      page.getByRole('heading', { name: 'Setari Platforma' }),
    ).toBeVisible();
  });

  test('Shows platform configuration info', async ({ page }) => {
    await loginAsAdmin(page);
    await page.locator('aside').getByRole('link', { name: 'Setari' }).click();
    await expect(page).toHaveURL('/setari');
    await expect(page.getByText('Configuratie platforma')).toBeVisible();
    await expect(page.getByText('15%')).toBeVisible();
    await expect(page.getByText('RON')).toBeVisible();
  });
});
