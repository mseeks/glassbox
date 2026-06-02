import { expect, test } from '@playwright/test';
import { lessons } from '../../src/lesson-catalog.js';

// Guards the prefers-reduced-motion code paths: every lesson must still render
// real, non-blank content (a sensible static frame) with no console/page errors
// when the user asks for less motion.
test.use({ reducedMotion: 'reduce' });

for (const lesson of lessons) {
  test(`reduced-motion renders ${lesson.title} cleanly`, async ({ page }) => {
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

    await page.goto(`/?lesson=${lesson.id}`, { waitUntil: 'load' });
    const main = page.getByRole('main', { name: lesson.title });
    await expect(main).toBeVisible();
    // Poll so the lazy lesson chunk has finished its first render.
    await expect.poll(async () => (await main.innerText()).trim().length).toBeGreaterThan(200);
    expect(errors, errors.join('\n')).toEqual([]);
  });
}
