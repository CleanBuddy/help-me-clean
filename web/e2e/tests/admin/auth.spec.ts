import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin Dashboard Authentication', () => {
  test('Login page renders with email input and title', async ({ page }) => {
    await page.goto('/autentificare');
    await expect(page.getByText('Admin Panel')).toBeVisible();
    await expect(page.getByLabel('Adresa de email')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Conecteaza-te' }),
    ).toBeVisible();
  });

  test('Shows dev mode info text', async ({ page }) => {
    await page.goto('/autentificare');
    await expect(
      page.getByText(/modul de dezvoltare.*simplificata/i),
    ).toBeVisible();
  });

  test('Can type email and submit to log in', async ({ page }) => {
    await loginAsAdmin(page);
    expect(page.url()).not.toContain('/autentificare');
  });

  test('After login, sidebar shows Dashboard nav link', async ({ page }) => {
    await loginAsAdmin(page);
    const sidebar = page.locator('aside');
    await expect(
      sidebar.getByRole('link', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
  });

  test('After login, sidebar shows Companii nav link', async ({ page }) => {
    await loginAsAdmin(page);
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Companii')).toBeVisible();
  });

  test('After login, sidebar shows Comenzi nav link', async ({ page }) => {
    await loginAsAdmin(page);
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Comenzi')).toBeVisible();
  });

  test('After login, sidebar shows Utilizatori nav link', async ({ page }) => {
    await loginAsAdmin(page);
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Utilizatori')).toBeVisible();
  });

  test('After login, redirects to dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL('/');
  });

  test('Logout clears auth state and shows login page', async ({ page }) => {
    await loginAsAdmin(page);
    const sidebar = page.locator('aside');
    await sidebar.getByRole('button', { name: /Deconectare/i }).click();
    await expect(page).toHaveURL(/\/autentificare/);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
