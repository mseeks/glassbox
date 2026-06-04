import { expect, test } from '@playwright/test';

const html = (page) => page.locator('html');
const toggle = (page) => page.getByRole('button', { name: /^Theme:/ });

test.describe('theme switch', () => {
  test('paints a resolved data-theme and exposes the toggle, no errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto('/');

    expect(['light', 'dark']).toContain(await html(page).getAttribute('data-theme'));
    await expect(toggle(page)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('follows the OS in system mode, live', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');

    // No explicit pick yet → flipping the OS preference flips the page live.
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
  });

  test('an explicit pick beats the OS and survives reload (pre-paint, no flash)', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' }); // OS says dark
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'dark'); // system → dark

    // Cycle system → light → dark → system until we land on an explicit Light.
    for (let i = 0; i < 3; i++) {
      const label = await toggle(page).getAttribute('aria-label');
      if (label && label.startsWith('Theme: Light')) break;
      await toggle(page).click();
    }
    await expect(toggle(page)).toHaveAttribute('aria-label', /^Theme: Light/);
    await expect(html(page)).toHaveAttribute('data-theme', 'light'); // beats OS dark

    await page.reload();
    await expect(html(page)).toHaveAttribute('data-theme', 'light'); // persisted + pre-paint
  });
});
