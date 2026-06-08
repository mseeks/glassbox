/**
 * Visual-sanity loop — Many Hands Engineering, rendered layout integrity.
 *
 * The render-defect gate. 23 lessons × 2 themes × 2 viewports = ~92 renders no
 * human will eyeball. Like `contrast`, this can only be judged on the RENDERED
 * page, so the harness is self-contained: it builds the app, boots `vite
 * preview`, runs the layout measurement (scripts/render-audit.js — horizontal
 * overflow + the elements causing it, broken images, an empty/failed main, and
 * reveal-on-scroll blocks left stuck hidden), tears the server down, and hands
 * the agent the per-(lesson,theme,viewport) defect signals. The agent Reads each
 * cited element in the lesson's source and classifies it **Fix / Intentional
 * decorative / Judgment** — so a deliberate full-bleed isn't "fixed" and a real
 * sideways-scroll is.
 *
 * SCOPE NOTE — this measures DETERMINISTIC layout breakage (the reliable, no-vision
 * half of "does it look right"). The aesthetic-judgment half ("does this render
 * feel off / contradict the lesson's world") needs the model to actually SEE the
 * screenshots; the Agent SDK's Read-on-image path is currently unreliable
 * (anthropics/claude-code#35866), so true vision is deferred to a Files-API/MCP
 * variant. This loop catches the breakage that matters most and is 100% reliable.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 *
 * Usage: tsx visual-sanity.ts [lesson-ids…]      (default: ALL lessons + the index)
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { get } from "node:http";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"];
const PORT = 5192;
const BASE = `http://127.0.0.1:${PORT}`;
const AUDIT_OUT = "/tmp/glassbox-render-loop.json";

interface PageDefects {
  lesson: string;
  theme: string;
  viewport: string;
  pageOverflowPx: number;
  offenders: { sel: string; overPx: number }[];
  brokenImages: string[];
  stuckHidden: string[];
  mainEmpty: boolean;
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

/** Build, boot preview, run the layout sweep, tear down. Returns the per-render report. */
async function runAudit(): Promise<PageDefects[]> {
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

    console.log("── Measuring layout (every lesson × light/dark × desktop/mobile) ──");
    if (existsSync(AUDIT_OUT)) rmSync(AUDIT_OUT);
    execFileSync("node", ["scripts/render-audit.js", BASE, AUDIT_OUT], { cwd: APP_ROOT, stdio: "inherit" });
    return JSON.parse(readFileSync(AUDIT_OUT, "utf8")) as PageDefects[];
  } finally {
    server.kill("SIGTERM");
  }
}

/** Renders that carry any defect signal, scoped, worst-overflow first. */
function withDefects(reportData: PageDefects[], scopeIds: string[]): PageDefects[] {
  const want = new Set(scopeIds);
  return reportData
    .filter((r) => !want.size || want.has(r.lesson))
    .filter(
      (r) =>
        r.pageOverflowPx > 8 || r.brokenImages.length > 0 || r.stuckHidden.length > 0 || r.mainEmpty,
    )
    .sort((a, b) => b.pageOverflowPx - a.pageOverflowPx);
}

function formatForAgent(defects: PageDefects[], scopeIds: string[]): string {
  const scopeNote = scopeIds.length ? `lessons: ${scopeIds.join(", ")}` : "ALL lessons + the index";
  if (defects.length === 0) {
    return `Layout sweep over ${scopeNote} (both themes, desktop + mobile, reveal-scrolled): NO render-defect signals — no horizontal overflow, no broken images, no empty mains, no stuck-hidden reveals.

Clean scan. Confirm by sampling 2-3 lesson CSS files for any fixed/full-bleed atmosphere that COULD overflow, then output the default clean map. A bucket (1) finding requires a quoted source rule from your Read.`;
  }
  const lines = defects
    .map((r) => {
      const parts: string[] = [];
      if (r.pageOverflowPx > 8) {
        const off = r.offenders.slice(0, 4).map((o) => `\`${o.sel}\` (+${o.overPx}px)`).join(", ");
        parts.push(`horizontal overflow ${r.pageOverflowPx}px — offenders: ${off || "(none isolated)"}`);
      }
      if (r.mainEmpty) parts.push("MAIN EMPTY / failed render");
      if (r.brokenImages.length) parts.push(`broken images: ${r.brokenImages.join("; ")}`);
      if (r.stuckHidden.length)
        parts.push(`reveal stuck hidden (candidates): ${r.stuckHidden.map((s) => `\`${s}\``).join(", ")}`);
      return `  - ${r.lesson} · ${r.theme} · ${r.viewport}: ${parts.join(" · ")}`;
    })
    .join("\n");
  return `Layout sweep over ${scopeNote} (both themes, desktop + mobile; pages were reveal-scrolled so reveal-on-scroll content is at its final state). ${defects.length} (lesson,theme,viewport) renders carry a defect SIGNAL — measured by the harness, NOT yet judged:

${lines}

For EACH, find the cited element in the lesson's source (grep the class in its <slug>.css / JSX / SVG) and decide what it IS — a real layout break vs a deliberate effect. Classify into ONE of the three buckets.`;
}

function systemPrompt(scopeNote: string): string {
  return `You are the visual-sanity mapper for the Glassbox repository (React 19 + Vite — a DUAL-THEME collection; each lesson ships a bespoke palette + a [data-theme] complement, and many use fixed/full-bleed ambient atmosphere). The harness rendered ${scopeNote} in BOTH themes at desktop AND mobile widths, scrolled each page fully (so reveal-on-scroll content is at its final state), and MEASURED layout defects: horizontal overflow (+ the elements whose box crosses the viewport edge), broken images, an empty/failed main region, and reveal blocks still at ~0 opacity after scrolling. Your job: turn that signal list into a curated map of which are real render DEFECTS vs intentional design.

Your only tools are Read / Grep / Glob — you can investigate but CANNOT edit a file. The human (or a redesign workflow) fixes what you map.

WHY THIS IS A MAP, NOT A PASS/FAIL: these lessons deliberately use full-bleed and fixed-position ATMOSPHERE — a 100vw grain layer, a position:fixed gradient ::before, an SVG starfield, an edge-to-edge frieze. Such an element can legitimately extend to (or just past) the viewport edge by design and is NOT a defect. But CONTENT a reader must use — prose, a lab, a control, a table, a diagram — must not be cut off, must not force the page to scroll sideways, must not vanish, and the main region must actually render. The mobile viewport (390px) is where real responsive breaks surface; weight it.

For EACH defect signal, classify into EXACTLY ONE of three buckets:

(1) FIX — a real layout defect. Include ONLY when you can answer in one sentence each:
    (a) WHAT — the (lesson · theme · viewport) and the offending element, with the EXACT source rule/element you found (the CSS class + property, the inline style, the SVG) quoted with file:line from your Read, plus what it IS (content vs atmosphere).
    (b) WHY it's a defect — it pushes READABLE content off-screen / forces a sideways scroll / hides content the reader needs / leaves the page blank — name the broken experience, especially on mobile.
    (c) ACTION — the concrete fix (constrain the element's width / add overflow handling / wrap or stack it at the narrow breakpoint / fix the failed image path / fix the reveal so it fires).

(2) INTENTIONAL — verified, keep. State the SPECIFIC reason the overflow/hidden/effect is by design: a fixed/absolute ambient layer (grain, gradient, starfield), a deliberately full-bleed frieze or rule, a decorative element that bleeds by intent, or a reveal that is intentionally a pre-state. Quote the rule (e.g. \`position: fixed; inset: 0\` or \`width: 100vw\`) that shows it's atmosphere, not content.

(3) JUDGMENT (your call). A borderline overflow (a few px from a shadow/blur/box that's cosmetically fine), a tight-but-usable mobile fit, or a stuck-hidden CANDIDATE that may simply be a legitimately-hidden element (a closed sheet, an inactive tab) rather than a failed reveal. Name the trade-off — do not auto-fix.

KNOWN-CONTEXT AWARENESS:
- A "stuck hidden" entry is only a candidate. Many opacity:0 elements are intentional (a pre-reveal state the IntersectionObserver hasn't reached on a tall page, a closed mobile nav sheet, an inactive panel). Read the element + its reveal wiring before calling it a failed reveal; if you can't confirm it should be visible, it's bucket (3).
- A small page overflow (≤ ~16px) often comes from a decorative shadow/blur or a scrollbar quirk, not content — verify the offender is content before bucket (1).
- The dark theme is the loved reference; a full-bleed atmosphere that looks intentional in dark is intentional in light too unless the LIGHT complement specifically breaks it.

WHEN THE SWEEP IS CLEAN: sample 2-3 files, then output the default clean map. A bucket (1) finding requires a quoted source rule from your Read — do not confabulate.

Output a structured map with exactly these three sections in this order:

## Fix — render defect (review & act)

(per item — lesson · theme · viewport · WHAT (quoted source) · WHY · ACTION)

## Intentional — keep (verified)

(list — lesson · the effect · the rule that shows it's by design)

## Judgment (your call)

(list — lesson · the signal · the trade-off)

End with a final summary line: "<X> fix · <Y> intentional · <Z> judgment". Nothing after.`;
}

async function main(): Promise<void> {
  const scopeIds = ids();
  const scopeNote = scopeIds.length ? `lessons: ${scopeIds.join(", ")}` : "ALL lessons + the index";
  console.log(`Visual-sanity loop — scope: ${scopeNote}\n`);

  let reportData: PageDefects[];
  try {
    reportData = await runAudit();
  } catch (err) {
    report([`RESULT: CANNOT RUN — ${err instanceof Error ? err.message : String(err)}`]);
    process.exitCode = 1;
    return;
  }

  const defects = withDefects(reportData, scopeIds);
  console.log(`\n── Renders with a defect signal: ${defects.length} / ${reportData.length} measured ──\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scopeNote),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(defects, scopeIds),
    // opus: separating intentional full-bleed atmosphere from a real layout break
    // is the crux judgment; the strong model resists "flag every overflow".
    model: "opus",
    maxTurns: 300,
    maxBudgetUsd: 5,
  });

  report([
    `Scope:                ${scopeNote}`,
    `Renders measured:     ${reportData.length} (lesson × theme × viewport)`,
    `With a defect signal: ${defects.length}`,
    `Agent run:            ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for ${scopeNote}; review the Fix section and repair the layout breaks you choose (atmosphere stays).`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
