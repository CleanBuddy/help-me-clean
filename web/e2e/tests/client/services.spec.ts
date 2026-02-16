import { test, expect } from '@playwright/test';

test.describe('Services page', () => {
  test('Page loads and shows title', async ({ page }) => {
    await page.goto('/servicii');

    await expect(
      page.getByRole('heading', { name: 'Serviciile noastre' }),
    ).toBeVisible();

    await expect(
      page.getByText(
        'Oferim o gama completa de servicii de curatenie profesionala.',
      ),
    ).toBeVisible();
  });

  test('Loads services from the API and shows at least one card', async ({
    page,
  }) => {
    await page.goto('/servicii');

    // Wait for the loading spinner to disappear and service cards to render.
    // Each service card has a "Rezerva" button.
    const reserveButtons = page.getByRole('button', { name: /Rezerva/i });
    await expect(reserveButtons.first()).toBeVisible({ timeout: 10_000 });

    // At least one service card should be present
    const count = await reserveButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Each service card shows name, price, and "Rezerva" button', async ({
    page,
  }) => {
    await page.goto('/servicii');

    // Wait for services to load
    await expect(
      page.getByRole('button', { name: /Rezerva/i }).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Each card should contain "lei" (price) and "/ora"
    const priceLabels = page.locator('text=/\\d+ lei/');
    await expect(priceLabels.first()).toBeVisible();

    const perHourLabels = page.getByText('/ora');
    await expect(perHourLabels.first()).toBeVisible();

    // Each card shows a service name as an h2 heading
    const serviceHeadings = page.locator(
      '.grid h2',
    );
    const headingCount = await serviceHeadings.count();
    expect(headingCount).toBeGreaterThanOrEqual(1);
  });

  test('Clicking "Rezerva" navigates to /rezervare with service param', async ({
    page,
  }) => {
    await page.goto('/servicii');

    // Wait for services to load - use the grid area to avoid matching header "Rezerva acum"
    const serviceGrid = page.locator('main .grid');
    const firstReserveButton = serviceGrid
      .getByRole('button', { name: /Rezerva/i })
      .first();
    await expect(firstReserveButton).toBeVisible({ timeout: 10_000 });

    await firstReserveButton.click();

    // Should navigate to /rezervare?service=<SOME_TYPE>
    await expect(page).toHaveURL(/\/rezervare\?service=/);
  });

  test('Service cards display minimum hours', async ({ page }) => {
    await page.goto('/servicii');

    // Wait for loading
    await expect(
      page.getByRole('button', { name: /Rezerva/i }).first(),
    ).toBeVisible({ timeout: 10_000 });

    // "Minim X ore/ora" text should be visible on at least one card
    const minHoursText = page.locator('text=/Minim \\d+ or[ae]/');
    await expect(minHoursText.first()).toBeVisible();
  });
});
