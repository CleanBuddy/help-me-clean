import { test, expect } from '@playwright/test';
import { loginAsCompanyAdmin } from './helpers';

test.describe('Company Dashboard Authentication', () => {
  test('Login page renders with email input and title', async ({ page }) => {
    await page.goto('/autentificare');

    await expect(
      page.getByText('Company Dashboard'),
    ).toBeVisible();

    await expect(page.getByLabel('Adresa de email')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Conecteaza-te' }),
    ).toBeVisible();
  });

  test('Shows dev mode info text', async ({ page }) => {
    await page.goto('/autentificare');

    await expect(
      page.getByText(
        /modul de dezvoltare.*autentificare simplificata/i,
      ),
    ).toBeVisible();
  });

  test('Can type email and submit to log in', async ({ page }) => {
    await loginAsCompanyAdmin(page);

    // After login we should be on the dashboard
    expect(page.url()).not.toContain('/autentificare');
  });

  test('After login, sidebar shows Dashboard nav link', async ({ page }) => {
    await loginAsCompanyAdmin(page);

    const sidebar = page.locator('aside');
    await expect(
      sidebar.getByRole('link', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
  });

  test('After login, sidebar shows Comenzi nav link', async ({ page }) => {
    await loginAsCompanyAdmin(page);

    const sidebar = page.locator('aside');
    await expect(
      sidebar.getByText('Comenzi'),
    ).toBeVisible();
  });

  test('After login, sidebar shows Echipa mea nav link', async ({ page }) => {
    await loginAsCompanyAdmin(page);

    const sidebar = page.locator('aside');
    await expect(
      sidebar.getByText('Echipa mea'),
    ).toBeVisible();
  });

  test('After login, redirects to dashboard', async ({ page }) => {
    await loginAsCompanyAdmin(page);

    await expect(page).toHaveURL('/');
  });

  test('Logout clears auth state and shows login page', async ({ page }) => {
    await loginAsCompanyAdmin(page);

    // Click Deconectare in sidebar
    const sidebar = page.locator('aside');
    await sidebar.getByRole('button', { name: /Deconectare/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/autentificare/);

    // Token should be cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('Protected pages redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/comenzi');

    await expect(page).toHaveURL(/\/autentificare/);
  });
});
