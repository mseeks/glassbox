import { expect, test } from '@playwright/test';
import { indexPage, lessons } from '../../src/lesson-catalog.js';

const pages = [
  { ...indexPage, path: '/', navLabel: 'Index' },
  ...lessons.map((lesson) => ({
    title: lesson.title,
    path: `/?lesson=${lesson.id}`,
    navLabel: lesson.label,
  })),
];

test.describe('lesson shell smoke', () => {
  for (const pageCase of pages) {
    test(`renders ${pageCase.title}`, async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];

      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.goto(pageCase.path);

      const shellNav = page.getByRole('navigation', { name: 'Lesson navigation' });

      await expect(page).toHaveTitle(pageCase.title);
      await expect(shellNav).toBeVisible();
      await expect(page.getByRole('main', { name: pageCase.title })).toBeVisible();
      await expect(
        shellNav.getByRole('button', { name: pageCase.navLabel, exact: true }),
      ).toHaveAttribute('aria-current', 'page');

      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }
});

test('Bloom Filters omits the standalone cuckoo section', async ({ page }) => {
  await page.goto('/?lesson=bloom-filters');

  await expect(page.getByRole('heading', { name: 'Cuckoo Filter' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Scalable Bloom Filter' })).toBeVisible();
});
