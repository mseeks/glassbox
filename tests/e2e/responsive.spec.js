import { expect, test } from '@playwright/test';
import { indexPage, lessons } from '../../src/lesson-catalog.js';

// Guards against horizontal-overflow regressions (e.g. a fixed-width table or a
// non-shrinking flex/grid control bar) that make a page pannable on phones.
const pages = [
  { title: indexPage.title, path: '/' },
  ...lessons.map((l) => ({ title: l.title, path: `/?lesson=${l.id}` })),
];

for (const width of [360, 768]) {
  test.describe(`no horizontal overflow @ ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });
    for (const p of pages) {
      test(`${p.title}`, async ({ page }) => {
        await page.goto(p.path, { waitUntil: 'load' });
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(400);
        // Ground truth: attempting to scroll right must not move the viewport.
        const scrolledX = await page.evaluate(() => {
          window.scrollTo(4000, 0);
          const x = window.scrollX;
          window.scrollTo(0, 0);
          return x;
        });
        expect(scrolledX, `${p.title} scrolls horizontally by ${scrolledX}px`).toBe(0);
      });
    }
  });
}
