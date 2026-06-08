/**
 * Rendered layout-defect auditor — the objective signal for the visual-sanity loop.
 *
 * Loads every lesson + the index in BOTH themes at TWO viewports (desktop + mobile)
 * and MEASURES render breakage against the live DOM — the only reliable oracle for
 * layout: horizontal overflow (and the elements causing it), broken images, an
 * empty/failed main region, and reveal-on-scroll blocks left stuck hidden after a
 * full scroll. Emits a per-(lesson,theme,viewport) JSON report so the loop's agent
 * classifies real defect vs intentional from data, not vibes.
 *
 * Lesson ids are parsed from src/lesson-catalog.js (NOT hardcoded), so the sweep
 * never goes stale as lessons are added.
 *
 * Usage:  node scripts/render-audit.js [baseURL] [outfile]
 *   defaults: http://127.0.0.1:5192   /tmp/gb-render.json
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || 'http://127.0.0.1:5192';
const OUT = process.argv[3] || '/tmp/gb-render.json';
const THEMES = ['dark', 'light'];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 1400 },
  { name: 'mobile', width: 390, height: 844 },
];

// Parse lesson ids straight from the catalog (regex — no React import in node).
function lessonIds() {
  const text = readFileSync(resolve(HERE, '..', 'src', 'lesson-catalog.js'), 'utf8');
  const ids = [];
  const re = /\bid:\s*(['"])([^'"]+)\1/g;
  let m;
  while ((m = re.exec(text)) !== null) if (m[2] !== 'index') ids.push(m[2]);
  return ids;
}

const pages = [
  { id: 'index', path: '/' },
  ...lessonIds().map((id) => ({ id, path: `/?lesson=${id}` })),
];

const browser = await chromium.launch();
const report = [];

for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce', // reveal snaps to its final state, no mid-fade
    });
    await ctx.addInitScript((t) => localStorage.setItem('glassbox-theme', t), theme);
    const page = await ctx.newPage();
    for (const p of pages) {
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(250);
      // Full scroll so every reveal-on-scroll IntersectionObserver fires.
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.8)) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 200));
      });

      const d = await page.evaluate((vpWidth) => {
        const out = {
          pageOverflowPx: 0,
          offenders: [],
          brokenImages: [],
          stuckHidden: [],
          mainEmpty: false,
        };
        const sel = (el) => {
          if (!el || el.nodeType !== 1) return '';
          if (el.id) return `#${el.id}`;
          const cls = (el.getAttribute('class') || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2);
          return el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '');
        };
        const doc = document.scrollingElement || document.documentElement;
        out.pageOverflowPx = Math.max(0, Math.round(doc.scrollWidth - vpWidth));

        // Elements whose box extends past the right edge (the overflow culprits).
        const seen = new Set();
        for (const el of Array.from(document.body.querySelectorAll('*'))) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const over = Math.round(r.right - vpWidth);
          if (over > 8 || r.left < -8) {
            const s = sel(el);
            if (seen.has(s)) continue;
            seen.add(s);
            out.offenders.push({ sel: s, overPx: Math.max(over, Math.round(-r.left)) });
            if (out.offenders.length >= 8) break;
          }
        }
        out.offenders.sort((a, b) => b.overPx - a.overPx);

        // Broken images (loaded but zero natural size).
        for (const img of Array.from(document.images)) {
          if (img.complete && img.naturalWidth === 0) {
            out.brokenImages.push(sel(img) + (img.src ? ` (${img.src.slice(0, 60)})` : ''));
            if (out.brokenImages.length >= 6) break;
          }
        }

        // Reveal-on-scroll blocks left hidden after a full scroll (candidates:
        // the agent confirms whether each is a stuck reveal or intentional).
        const revRe = /(^|[\s-])(reveal|rv|rev)([\s-]|$)/i;
        let hiddenCount = 0;
        for (const el of Array.from(document.body.querySelectorAll('[class]'))) {
          const cls = el.getAttribute('class') || '';
          if (!revRe.test(cls)) continue;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          if (parseFloat(cs.opacity) < 0.08 && (el.textContent || '').trim().length > 0) {
            if (hiddenCount < 6) out.stuckHidden.push(sel(el));
            hiddenCount++;
          }
        }

        // Did the lesson render any content at all?
        const main = document.querySelector('main') || document.body;
        out.mainEmpty =
          (main.textContent || '').trim().length < 40 || main.getBoundingClientRect().height < 80;
        return out;
      }, vp.width);

      report.push({ lesson: p.id, theme, viewport: vp.name, ...d });
      const flags =
        (d.pageOverflowPx ? `overflow ${d.pageOverflowPx}px` : '') +
        (d.brokenImages.length ? ` ${d.brokenImages.length} broken-img` : '') +
        (d.stuckHidden.length ? ` ${d.stuckHidden.length} stuck-hidden` : '') +
        (d.mainEmpty ? ' EMPTY' : '');
      console.log(`${vp.name.padEnd(7)} ${theme.padEnd(5)} ${p.id.padEnd(24)} ${flags || 'ok'}`);
    }
    await ctx.close();
  }
}
await browser.close();

writeFileSync(OUT, JSON.stringify(report, null, 2));
const defectPages = report.filter(
  (r) => r.pageOverflowPx > 8 || r.brokenImages.length || r.stuckHidden.length || r.mainEmpty,
).length;
console.log(
  `\n${report.length} page-renders measured · ${defectPages} with a defect signal   →   ${OUT}`,
);
