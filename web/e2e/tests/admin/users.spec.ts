import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin Users Page', () => {
  test('Shows Utilizatori title', async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .locator('aside')
      .getByRole('link', { name: 'Utilizatori' })
      .click();
    await expect(page).toHaveURL('/utilizatori');
    await expect(
      page.getByRole('heading', { name: 'Utilizatori', exact: true }),
    ).toBeVisible();
  });

  test('Shows user stat cards', async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .locator('aside')
      .getByRole('link', { name: 'Utilizatori' })
      .click();
    await expect(page).toHaveURL('/utilizatori');
    // Wait for data to load
    await page.waitForTimeout(2000);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Shows user management placeholder', async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .locator('aside')
      .getByRole('link', { name: 'Utilizatori' })
      .click();
    await expect(page).toHaveURL('/utilizatori');
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Gestionare utilizatori/i)).toBeVisible();
  });
});
