/**
 * Contrast loop — Many Hands Engineering, rendered WCAG color-contrast.
 *
 * The legibility gate the collection lacked. `a11y-source` (the runtime axe gate)
 * deliberately EXCLUDES color-contrast because the lessons use intentional artistic
 * low-contrast; this loop is the one that DOES measure it — but as a curated map,
 * not a pass/fail, so intentional decoration is kept and information text is fixed.
 *
 * Unlike the static mappers, contrast can only be judged on the RENDERED page (it
 * needs the real cascade + computed colors + the data-theme switch), so the harness
 * is self-contained like `console-runtime` (which boots vitest): it builds the app,
 * boots `vite preview`, runs the reveal-aware axe sweep (scripts/contrast-audit.js —
 * every lesson × light/dark, scroll-revealed so below-fold content isn't measured
 * mid-fade), tears the server down, and hands the agent the distinct failing
 * foreground/background pairs. The agent Reads each in context and classifies into
 * **Fix to AA / Intentional decorative / Judgment-heavy**.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file. Visual
 * fixes are the human's (or a workflow's) job; this only ever MAPS.
 *
 * Usage: tsx contrast.ts [lesson-ids…]      (default: ALL lessons + the index)
 *   e.g.: tsx contrast.ts                    (whole site, both themes)
 *         tsx contrast.ts swim tls           (just those two)
 */
import { spawn } from "node:child_process";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { get } from "node:http";
import { resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"];
const PORT = 5191;
const BASE = `http://127.0.0.1:${PORT}`;
const AUDIT_OUT = "/tmp/glassbox-contrast-loop.json";

interface Fail {
  selector: string;
  fg?: string;
  bg?: string;
  ratio?: number;
  required?: number;
  fontSize?: string;
}
interface PageReport {
  lesson: string;
  theme: string;
  fails: Fail[];
}

function ids(): string[] {
  return process.argv.slice(2).filter((a) => !a.startsWith("--"));
}

function waitForServer(url: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  return new Promise((resolveP) => {
    const tick = () => {
      const req = get(url, (res) => {
        res.resume();
        resolveP(true);
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) resolveP(false);
        else setTimeout(tick, 300);
      });
    };
    tick();
  });
}

/** Build, boot preview, run the axe sweep, tear down. Returns the per-page report. */
async function runAudit(): Promise<PageReport[]> {
  console.log("── Building app (vite build) ──");
  execFileSync("npx", ["vite", "build"], { cwd: APP_ROOT, stdio: "inherit" });

  console.log(`── Booting vite preview on :${PORT} ──`);
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--host", "127.0.0.1"], {
    cwd: APP_ROOT,
    stdio: "ignore",
  });
  try {
    const up = await waitForServer(BASE, 30_000);
    if (!up) throw new Error(`preview server did not come up on ${BASE} within 30s`);

    console.log("── Running reveal-aware axe color-contrast sweep (every lesson × light/dark) ──");
    if (existsSync(AUDIT_OUT)) rmSync(AUDIT_OUT);
    execFileSync("node", ["scripts/contrast-audit.js", BASE, AUDIT_OUT], { cwd: APP_ROOT, stdio: "inherit" });
    return JSON.parse(readFileSync(AUDIT_OUT, "utf8")) as PageReport[];
  } finally {
    server.kill("SIGTERM");
  }
}

// Distinct failing foreground/background pairs per (lesson, theme), worst-first —
// collapses the many DOM nodes that share one color pair into one finding.
interface Finding {
  lesson: string;
  theme: string;
  fg?: string;
  bg?: string;
  ratio?: number;
  required?: number;
  fontSize?: string;
  count: number;
  sampleSelector: string;
}

function distinctFindings(report: PageReport[], scopeIds: string[]): Finding[] {
  const want = new Set(scopeIds);
  const out: Finding[] = [];
  for (const page of report) {
    if (want.size && !want.has(page.lesson)) continue;
    const seen = new Map<string, Finding>();
    for (const f of page.fails) {
      const key = `${f.fg}|${f.bg}`;
      const cur = seen.get(key);
      if (cur) {
        cur.count++;
        if ((f.ratio ?? 99) < (cur.ratio ?? 99)) {
          cur.ratio = f.ratio;
          cur.sampleSelector = f.selector;
        }
      } else {
        seen.set(key, {
          lesson: page.lesson,
          theme: page.theme,
          fg: f.fg,
          bg: f.bg,
          ratio: f.ratio,
          required: f.required,
          fontSize: f.fontSize,
          count: 1,
          sampleSelector: f.selector,
        });
      }
    }
    out.push(...seen.values());
  }
  out.sort((a, b) => (a.ratio ?? 99) - (b.ratio ?? 99));
  return out;
}

function formatForAgent(findings: Finding[], scopeIds: string[]): string {
  const scopeNote = scopeIds.length ? `lessons: ${scopeIds.join(", ")}` : "ALL lessons + the index";
  if (findings.length === 0) {
    return `Rendered axe color-contrast sweep over ${scopeNote}, both themes: NO failing text/UI pairs.

Clean scan. Confirm by sampling 2-3 lesson CSS files for any text on a tinted panel, then output the default clean map. A bucket (1) finding requires a quoted declaration from your Read.`;
  }
  const cap = 70;
  const shown = findings.slice(0, cap);
  const lines = shown
    .map(
      (f) =>
        `  - ${f.lesson} · ${f.theme} · \`${f.fg}\` on \`${f.bg}\` = ${f.ratio}:1 (need ${f.required}) · ${f.fontSize ?? "?"} · ×${f.count} · e.g. \`${f.sampleSelector.replace(/\s+/g, " ").slice(0, 70)}\``,
    )
    .join("\n");
  const more = findings.length > cap ? `\n…and ${findings.length - cap} more distinct pairs (lift the worst first).` : "";
  return `Rendered axe color-contrast sweep over ${scopeNote}, both themes (reveal-aware: below-fold content was scrolled into view first, so these are TRUE rendered colors, not mid-fade). ${findings.length} DISTINCT failing fg/bg pairs — scanned by the harness, NOT yet verified:

${lines}${more}

For EACH, find that foreground color in the lesson (a CSS token/literal, an inline style={{}}, or an SVG fill/stroke — grep the hex) and decide what it IS. Classify each into ONE of the three buckets. AA: ≥4.5:1 normal text, ≥3:1 for large (≥18.66px bold or ≥24px).`;
}

function systemPrompt(scopeNote: string): string {
  return `You are the contrast mapper for the Glassbox repository (React 19 + Vite — a DUAL-THEME collection: the shell sets \`data-theme="light"|"dark"\` on <html>; each lesson ships a bespoke palette + a \`[data-theme='…'] .<root>{}\` complement). The harness rendered ${scopeNote} in BOTH themes and ran axe-core's \`color-contrast\` rule against the live DOM (scroll-revealing each page first so colors are measured at full opacity, not mid-fade), then collapsed the failing DOM nodes into DISTINCT foreground/background pairs. Your job: turn that list into a curated map of which pairs are real legibility DEFECTS vs. intentional artistic low-contrast.

Your only tools are Read / Grep / Glob — you can investigate but CANNOT edit a file. The human (or a redesign workflow) fixes what you map.

WHY THIS IS A MAP, NOT A PASS/FAIL: the lessons deliberately use artistic low-contrast for DECORATION (faint eyebrows, ghost/placeholder chips, ambient watermarks, the dark originals' soft star-labels). Forcing those to AA would flatten the art. But INFORMATION a reader must read — body prose, headings, code/mono, data values, axis/node labels, TOC entries, button/UI text — must clear AA on the ground it actually sits on. The dark themes are the loved reference; lean toward preserving their intentional faintness and focus defects on the LIGHT complements and on anything genuinely unreadable (≲3:1) that carries meaning.

For EACH failing pair, classify into EXACTLY ONE of three buckets:

(1) FIX — sub-AA INFORMATION text. Include ONLY when you can answer in one sentence each:
    (a) WHAT — the rendered pair (\`fg\` on \`bg\` = ratio) and the EXACT source color you found (the token/literal/inline value), quoted with file:line from your Read, plus what the text says/does (so it's clearly information, not decoration).
    (b) WHY it's a defect — it conveys meaning the reader must parse, and sits below AA (≥4.5 normal / ≥3 large) on its real ground.
    (c) ACTION — "deepen the light-block token \`--x\` (OKLCH, hue held) to ~Y" / "raise the inline alpha" / "darken the on-bar label". Name the source to change.

(2) INTENTIONAL DECORATIVE — verified, keep. State the SPECIFIC reason: a faint eyebrow/kicker, a ghost/empty/placeholder element, an ambient watermark, a deliberately-dim supporting micro-caption, or the dark reference's intentional soft labeling — ornamental, not information. Quote what you Read that shows it's decorative.

(3) JUDGMENT-HEAVY (your call). Borderline (≈3–4.5 small text), or a label that sits ON a saturated data swatch/bar where the trade-off is real, or a semantic constant meant to hold across modes. Name the trade-off.

KNOWN-CONTEXT AWARENESS:
- A pair like \`#fff\`/\`var(--ink)\` reported as fg-on-bg may be a SWATCH label sitting on a color SAMPLE (not the page ground) — near-black/white on a sample is by design; bucket (2) or (3).
- Text on a colored data bar/chip (e.g. LSM strata labels): pushing the LABEL to the contrast extreme (near-black on light bands, near-white on dark) is the fix; the bar's hue stays.
- The dark originals carry intentional faint star-labels / dim captions; do not mass-flag them — reserve bucket (1) for dark only when truly unreadable information.

WHEN THE SWEEP IS CLEAN: sample 2-3 files, then output the default clean map. A bucket (1) finding requires a quoted source color from your Read — do not confabulate.

Output a structured map with exactly these three sections in this order:

## Fix — sub-AA information text (review & act)

(per item — lesson · theme · pair · WHAT (quoted source) · WHY · ACTION)

## Intentional decorative — keep (verified)

(list — lesson · pair · reason)

## Judgment-heavy (your call)

(list — lesson · pair · the trade-off)

End with a final summary line: "<X> fix · <Y> intentional · <Z> judgment". Nothing after.`;
}

async function main(): Promise<void> {
  const scopeIds = ids();
  const scopeNote = scopeIds.length ? `lessons: ${scopeIds.join(", ")}` : "ALL lessons + the index";
  console.log(`Contrast loop — scope: ${scopeNote}\n`);

  let report_: PageReport[];
  try {
    report_ = await runAudit();
  } catch (err) {
    report([`RESULT: CANNOT RUN — ${err instanceof Error ? err.message : String(err)}`]);
    process.exitCode = 1;
    return;
  }

  const findings = distinctFindings(report_, scopeIds);
  const darkN = findings.filter((f) => f.theme === "dark").reduce((n, f) => n + f.count, 0);
  const lightN = findings.filter((f) => f.theme === "light").reduce((n, f) => n + f.count, 0);
  console.log(`\n── Distinct failing pairs: ${findings.length} (raw nodes: light ${lightN} / dark ${darkN}) ──\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scopeNote),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, scopeIds),
    // opus: separating intentional artistic low-contrast from a real defect is the
    // crux judgment of this loop; the strong model resists "flag everything axe flags".
    model: "opus",
    maxTurns: 300,
    maxBudgetUsd: 5,
  });

  report([
    `Scope:                  ${scopeNote}`,
    `Distinct failing pairs: ${findings.length} (raw nodes: light ${lightN} / dark ${darkN})`,
    `Agent run:              ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for ${scopeNote}; review the Fix section and retune the information text you choose (decoration stays).`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
