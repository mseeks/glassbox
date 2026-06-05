/**
 * Rendered color-contrast auditor — the objective gate for the dual-theme work.
 *
 * Loads every lesson + the index in BOTH themes and runs axe-core's
 * `color-contrast` rule against the live DOM (the only reliable oracle, since it
 * resolves the real cascade + computed colors). Emits a per-lesson JSON report of
 * every failing text/background pair (selector, fg, bg, ratio, required) so the
 * artisan pass works from data, not vibes.
 *
 * Usage:  node scripts/contrast-audit.mjs [baseURL] [outfile]
 *   defaults: http://127.0.0.1:5180   /tmp/gb-contrast.json
 *
 * Note: axe color-contrast also catches INTENTIONAL decorative low-contrast
 * (faint eyebrows, ghost captions). The report is candidates; the human/agent
 * judges decorative-vs-defect. We rank by how far below threshold each pair is.
 */
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:5180';
const OUT = process.argv[3] || '/tmp/gb-contrast.json';
const THEMES = ['dark', 'light'];

// Parse lesson ids straight from the catalog (regex — no React import in node),
// so the sweep never goes stale as lessons are added.
const LESSON_IDS = (() => {
  const text = readFileSync(resolve(HERE, '..', 'src', 'lesson-catalog.js'), 'utf8');
  const ids = [];
  const re = /\bid:\s*(['"])([^'"]+)\1/g;
  let m;
  while ((m = re.exec(text)) !== null) if (m[2] !== 'index') ids.push(m[2]);
  return ids;
})();
const pages = [
  { id: 'index', title: 'index', path: '/' },
  ...LESSON_IDS.map((id) => ({ id, title: id, path: `/?lesson=${id}` })),
];

const browser = await chromium.launch();
const report = [];

for (const theme of THEMES) {
  // reducedMotion: reveal-on-scroll snaps to opacity:1 instantly (no mid-fade),
  // so once an element scrolls into view axe sees its TRUE color.
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1400 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await ctx.addInitScript((t) => localStorage.setItem('glassbox-theme', t), theme);
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(300);
    // Scroll the whole page so every reveal-on-scroll section fires its
    // IntersectionObserver (→ opacity:1), then return to top. Without this, axe
    // measures below-fold content mid-reveal and reports phantom low-contrast.
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.8)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 70));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 250));
    });
    const resolved = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

    const fails = [];
    for (const v of results.violations) {
      for (const node of v.nodes) {
        const d = (node.any && node.any[0] && node.any[0].data) || {};
        fails.push({
          selector: Array.isArray(node.target) ? node.target.join(' ') : String(node.target),
          fg: d.fgColor,
          bg: d.bgColor,
          ratio: d.contrastRatio,
          required: d.expectedContrastRatio,
          fontSize: d.fontSize,
          fontWeight: d.fontWeight,
        });
      }
    }
    fails.sort((a, b) => (a.ratio ?? 99) - (b.ratio ?? 99)); // worst first
    report.push({ lesson: p.id, title: p.title, theme, resolved, fails });
    const worst = fails[0] ? ` worst ${fails[0].ratio}:1 (need ${fails[0].required})` : '';
    console.log(
      `${theme.padEnd(5)} ${p.id.padEnd(24)} ${String(fails.length).padStart(3)} fail${worst}`,
    );
  }
  await ctx.close();
}
await browser.close();

writeFileSync(OUT, JSON.stringify(report, null, 2));

// Per-lesson rollup across both themes
const byLesson = {};
for (const r of report) {
  byLesson[r.lesson] = byLesson[r.lesson] || { dark: 0, light: 0 };
  byLesson[r.lesson][r.theme] = r.fails.length;
}
const total = report.reduce((n, r) => n + r.fails.length, 0);
console.log('\n── per-lesson (dark / light) ──');
for (const [id, c] of Object.entries(byLesson))
  console.log(`  ${id.padEnd(24)} ${String(c.dark).padStart(3)} / ${String(c.light).padStart(3)}`);
console.log(`\nTOTAL contrast failures: ${total}   →   ${OUT}`);
