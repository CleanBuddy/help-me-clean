import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers';

test.describe('Authentication flow', () => {
  test('Login page renders with email input and heading', async ({ page }) => {
    await page.goto('/autentificare');

    await expect(
      page.getByRole('heading', { name: 'Autentificare' }),
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
        /In modul de dezvoltare.*autentificare simplificata/i,
      ),
    ).toBeVisible();
  });

  test('Can type email and submit to log in', async ({ page }) => {
    await loginAsTestUser(page);

    // After login we should be redirected away from the login page
    expect(page.url()).not.toContain('/autentificare');
  });

  test('After login, header shows "Comenzile mele" link', async ({
    page,
  }) => {
    await loginAsTestUser(page);

    const header = page.locator('header');
    await expect(
      header.getByRole('link', { name: /Comenzile mele/i }),
    ).toBeVisible();
  });

  test('After login, header shows user name or "Profil" link', async ({
    page,
  }) => {
    await loginAsTestUser(page);

    const header = page.locator('header');

    // The header shows a link to /profil (text is the user's fullName or "Profil")
    // Use .first() because both desktop and mobile nav have this link
    const profileLink = header.locator('a[href="/profil"]').first();
    await expect(profileLink).toBeVisible();
  });

  test('After login, redirects to home page', async ({ page }) => {
    await loginAsTestUser(page);

    await expect(page).toHaveURL('/');
  });

  test('Logout clears auth state and shows Autentificare link', async ({
    page,
  }) => {
    await loginAsTestUser(page);

    // Header should show "Deconectare" button when authenticated
    const header = page.locator('header');
    await header.getByRole('button', { name: /Deconectare/i }).click();

    // After logout, the header should show "Autentificare" link again
    await expect(
      header.getByRole('link', { name: 'Autentificare' }),
    ).toBeVisible();

    // Token should be cleared from localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('Protected pages redirect to login when not authenticated - /comenzile-mele', async ({
    page,
  }) => {
    await page.goto('/comenzile-mele');

    await expect(page).toHaveURL(/\/autentificare/);
  });

  test('Protected pages redirect to login when not authenticated - /profil', async ({
    page,
  }) => {
    await page.goto('/profil');

    await expect(page).toHaveURL(/\/autentificare/);
  });

  test('Visiting login page when already authenticated redirects away', async ({
    page,
  }) => {
    await loginAsTestUser(page);

    // Navigate to login page while already authenticated
    await page.goto('/autentificare');

    // Should redirect away from login since we are already authenticated
    await page.waitForURL((url) => !url.pathname.includes('/autentificare'), {
      timeout: 5_000,
    });

    expect(page.url()).not.toContain('/autentificare');
  });
});
