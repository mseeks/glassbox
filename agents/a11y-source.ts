/**
 * a11y-source loop — Many Hands Engineering, source-level accessibility debt.
 *
 * A READ-ONLY mapper of accessibility risks at the JSX source level — the
 * complement to the runtime axe gate in tests/e2e/a11y.spec.js (which only runs
 * the committed lessons and skips color-contrast). The harness scans JSX for
 * three high-signal patterns and the agent Reads each in context to confirm
 * whether it is a real defect:
 *   - `role="img"` elements (incl. SVGs) without an accessible name — the exact
 *     bug that bit b-trees' TreeSVG during the lesson build,
 *   - `<input>` (range / text / …) without a label or aria-label,
 *   - `onClick` on a NON-interactive element (div / span / li / …) without a
 *     keyboard path (role + tabIndex + onKeyDown) — the operability gap a mouse
 *     test never catches.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 *
 * Usage: tsx a11y-source.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/   src/lessons/   src/lessons/swim/
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".claude",
  "coverage",
  "dist",
  "test-results",
  "playwright-report",
]);

// JSX only — accessibility risks live in markup, not engines/CSS.
const SCAN_EXT = /\.jsx$/;

// Elements that are natively interactive / focusable — an onClick on these is
// keyboard-operable for free, so it is not a "clickable non-button" risk.
const INTERACTIVE_TAGS = new Set([
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "option",
  "label",
  "summary",
  "details",
]);

function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx a11y-source.ts <scope>",
      "  e.g.: src/   src/lessons/   src/lessons/swim/",
      "",
      "(Scoping each run keeps the map actionable.)",
    ]);
    process.exit(1);
  }
  if (!existsSync(resolve(APP_ROOT, scope))) {
    report([`RESULT: CANNOT RUN — scope path '${scope}' does not exist relative to the repo root.`]);
    process.exit(1);
  }
  return scope;
}

function gatherSources(scope: string): string[] {
  const scopeAbs = resolve(APP_ROOT, scope);
  const st = statSync(scopeAbs);
  if (st.isFile()) {
    return SCAN_EXT.test(scopeAbs) ? [scopeAbs] : [];
  }
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full);
      } else if (SCAN_EXT.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(scopeAbs);
  files.sort();
  return files;
}

// ── The a11y signal ───────────────────────────────────────────────────────
type A11yKind = "role-img" | "input" | "clickable-nonbutton";

interface Finding {
  file: string; // relative
  line: number;
  kind: A11yKind;
  detail: string; // e.g. the element tag for clickable-nonbutton
  snippet: string;
}

// For an `onClick` line, walk backward to the nearest opening JSX tag to learn
// which element the handler is on (JSX is prettier-split across lines).
function nearestOpeningTag(lines: string[], idx: number): string | null {
  for (let i = idx; i >= 0 && i > idx - 12; i--) {
    const m = lines[i].match(/<([a-zA-Z][a-zA-Z0-9]*)\b/g);
    if (m && m.length) {
      const last = m[m.length - 1].slice(1); // strip "<"
      return last;
    }
  }
  return null;
}

function checkA11y(files: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const fileRel = relative(APP_ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const snippet = line.trim().slice(0, 140);

      if (/\brole=(["'])img\1/.test(line)) {
        findings.push({ file: fileRel, line: i + 1, kind: "role-img", detail: "", snippet });
      }
      if (/<input\b/.test(line)) {
        findings.push({ file: fileRel, line: i + 1, kind: "input", detail: "", snippet });
      }
      if (/\bonClick=/.test(line)) {
        const tag = nearestOpeningTag(lines, i);
        // Lowercase tag = DOM element; uppercase = a React component (skip — its
        // own internals decide interactivity). Flag only non-interactive DOM tags.
        if (tag && /^[a-z]/.test(tag) && !INTERACTIVE_TAGS.has(tag)) {
          findings.push({
            file: fileRel,
            line: i + 1,
            kind: "clickable-nonbutton",
            detail: `<${tag}>`,
            snippet,
          });
        }
      }
    }
  }
  return findings;
}

function formatForAgent(findings: Finding[], files: string[]): string {
  const fileList = files.map((f) => `  - ${relative(APP_ROOT, f)}`).join("\n");
  if (findings.length === 0) {
    return `JSX files in scope (${files.length}):
${fileList}

Accessibility risk sites detected: NONE — no role="img" elements, <input>s, or onClick handlers on non-interactive elements found in the scope.

This is the clean-scan case. Per the system prompt: sample at most 2-3 files briefly, then output the default clean map. A bucket (1) finding requires a quoted line from your actual Read.`;
  }

  const byFile = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file)!.push(f);
  }
  const grouped = Array.from(byFile.entries())
    .map(
      ([file, fs]) =>
        `${file}:\n${fs
          .map((f) => `  - line ${f.line} · [${f.kind}${f.detail ? " " + f.detail : ""}]\n      ${f.snippet}`)
          .join("\n")}`,
    )
    .join("\n\n");

  return `JSX files in scope (${files.length}):
${fileList}

Accessibility risk sites detected (${findings.length}) — scanned by the harness, NOT yet verified:
${grouped}

For EACH hit, Read the surrounding element (accessible names + keyboard handlers often sit on adjacent lines that the per-line scan can't see). Confirm whether the element has a real accessible name / keyboard path, then classify into ONE of the three buckets.`;
}

// ── Agent's job (quality bar lives here) ──────────────────────────────────
function systemPrompt(scope: string): string {
  return `You are the source-level accessibility mapper for the Glassbox repository (React 19 + Vite — self-contained lessons). The harness has scanned \`${scope}\` for three a11y risk patterns and given you a candidate list: role="img" elements, <input> controls, and onClick handlers on non-interactive DOM elements. Your job: turn it into a curated map of real defects. There is a runtime axe gate (tests/e2e/a11y.spec.js, wcag2a/2aa, color-contrast excluded) — you are its source-level complement and catch keyboard-operability issues axe under-tests.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human fixes what they agree is a defect.

CRITICAL: the per-line scan cannot see adjacent lines. An accessible name (aria-label / aria-labelledby), a wrapping <label>, an aria-hidden, or a keyboard handler (onKeyDown) frequently sits on a NEIGHBORING line. You MUST Read the full element before judging — most candidates will turn out fine, and that is the expected outcome.

For EACH candidate, classify it into EXACTLY ONE of three buckets:

(1) DEFECT — FIX. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT element/lines as observed in your Read, in backticks, with file:line. Cite or omit.
    (b) WHY it fails — by kind:
        · role-img: the element has role="img" (or is an <svg role="img">) with NO accessible name — no aria-label, no aria-labelledby pointing at real text, no <title> child — so a screen reader announces an unnamed "image". (If instead it is purely decorative, the fix is aria-hidden="true" + drop role="img".)
        · input: an <input> (range/text/checkbox/…) with NO accessible name — no aria-label, no associated <label htmlFor> or wrapping <label>, no aria-labelledby. Range inputs are the common miss.
        · clickable-nonbutton: a non-interactive element (<div>/<span>/<li>/…) with onClick but no keyboard path — not focusable (no tabIndex={0}), no role, no onKeyDown/onKeyUp — so keyboard and screen-reader users cannot operate it.
    (c) ACTION — the literal next step: "add aria-label=\\"…\\" to the svg" / "add aria-hidden=\\"true\\" and remove role=img (decorative)" / "give the range an aria-label from its visible label" / "make it a <button>, or add role=\\"button\\" tabIndex={0} onKeyDown".

(2) PROPERLY HANDLED — verified. State the SPECIFIC reason, quoting the attribute:
    - role="img" WITH an aria-label / aria-labelledby / <title> (quote it),
    - a decorative SVG that is aria-hidden="true" (not announced — fine),
    - an <input> with aria-label / a wrapping or htmlFor <label> / aria-labelledby (quote it) — note the shared lesson-kit <Slider> auto-supplies aria-label,
    - an onClick that is actually on a <button>/<a>/native control (the backward scan mis-attributed it), or on an element that DOES have role+tabIndex+onKeyDown (quote them).
    Listing what you CONSIDERED and REJECTED shows your work.

(3) JUDGMENT-HEAVY (your call). Genuinely ambiguous: an interactive SVG (e.g. a clickable "scope" chart) whose labelling is partial; a control whose name is present but unclear; a clickable element with role but missing one of tabIndex/onKeyDown. Name the precise gap.

KNOWN-CONTEXT AWARENESS for this repo:
- Decorative SVGs use aria-hidden="true" — correct, bucket (2). Only role="img" SVGs need a name.
- The shared lesson-kit Slider (src/shared/lesson-kit/Slider.jsx) and SegmentedControl already provide aria-label / aria-pressed — inputs/buttons routed through them are named. Bucket (2).
- The axe gate excludes color-contrast by design (intentional low-contrast decorative palettes) — do NOT raise contrast.
- A <button> with visible text children is named for free — not flagged here anyway (we only flag <input>, role=img, and non-interactive onClick). An icon-only <button> WOULD need aria-label, but axe covers that at runtime; mention only if you happen to Read one with no name.
- Lesson chart SVGs that are INTERACTIVE (pointer to set a query, e.g. vp-tree's Scope) should expose a role + accessible name; a decorative-only one should be aria-hidden.

WHEN THE HARNESS REPORTS 0 SITES (clean scan): the DEFAULT output is a clean map — sample 2-3 files, then:

> ## Defect — fix (review & act)
> *(none — 0 a11y risk sites detected; brief sample of N files confirmed names/keyboard paths at the spots checked)*

A bucket (1) finding requires a quoted element from your Read. Do not confabulate from "what an unlabeled control usually looks like".

Hard rules:
- Read before judging — the name/handler is usually on an adjacent line. Default to bucket (2) unless a Read proves the gap.
- No hypothetical fixes — if you cannot name the missing attribute, it is bucket (3).
- If a pattern recurs identically (e.g. every lab's range already routed through the kit Slider), report it once.

Output a structured map with exactly these three sections in this order:

## Defect — fix (review & act)

(per item — file:line · kind · WHAT (quoted) · WHY · ACTION)

## Properly handled — verified

(list — finding · reason (quote the name/handler))

## Judgment-heavy (your call)

(list — finding · the precise gap)

End with a final summary line: "<X> fix · <Y> ok · <Z> judgment". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`a11y-source loop — scope: ${scope}\n`);

  const files = gatherSources(scope);
  if (files.length === 0) {
    report([
      `Scope:               ${scope}`,
      `JSX files in scope:  0`,
      "",
      "RESULT: PASS — no scannable .jsx files in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Sweeping ${files.length} file(s) for a11y risk sites ──`);
  const findings = checkA11y(files);
  console.log(`   Risk sites detected: ${findings.length}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, files),
    // opus: the name/handler is usually on an adjacent line, so the agent must
    // read carefully and resist the prior that a flagged control is unlabeled.
    model: "opus",
  });

  report([
    `Scope:               ${scope}`,
    `JSX files in scope:  ${files.length}`,
    `Risk sites:          ${findings.length}`,
    `Agent run:           ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Defect section and fix the names/keyboard paths you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
