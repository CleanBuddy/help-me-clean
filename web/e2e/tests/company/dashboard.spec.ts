import { test, expect } from '@playwright/test';
import { loginAsCompanyAdmin } from './helpers';

test.describe('Dashboard page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCompanyAdmin(page);
  });

  test('Shows welcome message', async ({ page }) => {
    await expect(
      page.getByText(/Bun venit/),
    ).toBeVisible();
  });

  test('Shows overview description', async ({ page }) => {
    await expect(
      page.getByText(/privire de ansamblu/),
    ).toBeVisible();
  });

  test('Shows stat cards', async ({ page }) => {
    // Wait for data to load (cards should appear)
    await expect(
      page.getByText('Comenzi finalizate'),
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText('Venit saptamana'),
    ).toBeVisible();

    await expect(
      page.getByText('Rating mediu'),
    ).toBeVisible();

    await expect(
      page.getByText('Raza serviciu'),
    ).toBeVisible();
  });
});
