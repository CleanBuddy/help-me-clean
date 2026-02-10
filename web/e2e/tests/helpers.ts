import { type Page, expect } from '@playwright/test';

/**
 * Logs in as a test user via the UI login page.
 *
 * Uses the dev authentication flow: the backend accepts `dev_<email>` as an
 * idToken and returns a JWT that gets stored in localStorage.
 */
export async function loginAsTestUser(
  page: Page,
  email = 'test-e2e@helpmeclean.ro',
): Promise<void> {
  await page.goto('/autentificare');
  await page.getByLabel('Adresa de email').fill(email);
  await page.getByRole('button', { name: 'Conecteaza-te' }).click();

  // Wait for the redirect to the home page (or the page that triggered auth)
  await page.waitForURL((url) => !url.pathname.includes('/autentificare'), {
    timeout: 10_000,
  });

  // Verify the token was stored
  const token = await page.evaluate(() => localStorage.getItem('token'));
  expect(token).toBeTruthy();
}

/**
 * Returns a future date string in YYYY-MM-DD format, offset by the given
 * number of days from today.
 */
export function getFutureDate(daysFromNow = 3): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Generates a unique email address for test isolation.
 */
export function uniqueEmail(): string {
  const ts = Date.now();
  return `e2e-${ts}@helpmeclean.ro`;
}
