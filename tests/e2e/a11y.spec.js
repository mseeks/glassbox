import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { indexPage, lessons } from '../../src/lesson-catalog.js';

// Automated accessibility audit per page. Guards the control labelling and
// keyboard/role work: missing button/link names, invalid ARIA, unlabelled
// inputs, etc. `color-contrast` is excluded — the lessons use intentional,
// artistic low-contrast decorative palettes that are out of scope for this gate.
const pages = [
  { title: indexPage.title, path: '/' },
  ...lessons.map((l) => ({ title: l.title, path: `/?lesson=${l.id}` })),
];

for (const p of pages) {
  test(`a11y: ${p.title}`, async ({ page }) => {
    await page.goto(p.path, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(400);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    const summary = serious
      .map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.help}`)
      .join('\n');
    expect(serious, `${p.title} a11y violations:\n${summary}`).toEqual([]);
  });
}
