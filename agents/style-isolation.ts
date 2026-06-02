/**
 * Style-isolation loop — Many Hands Engineering, CSS leak / lesson-root escape.
 *
 * A READ-ONLY mapper of style rules that apply GLOBALLY instead of being scoped
 * under their lesson root. AGENTS: "do not bleed styles across lesson
 * boundaries." Each lesson's <slug>.css must scope its rules under its own root
 * class (.bt-root, .hll, .tls-root, …); a bare `:root{}`, a bare `*{}`, or any
 * unscoped element/attribute selector leaks into the shell and every other
 * lazily-loaded lesson (exactly the bug TLS and VP-Tree shipped with: a global
 * `:root{ --ink: … }` that overrode the shell's token).
 *
 * The harness parses each CSS file with a brace-aware walker (skipping @keyframes
 * step selectors and at-rule preludes) and flags every top-level rule selector
 * whose comma-parts contain NO class/id — i.e. they match globally. The agent
 * Reads each in context and emits a strict three-bucket map.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 *
 * Usage: tsx style-isolation.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/lessons/   src/lessons/tls/tls.css   src/
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

const SCAN_EXT = /\.css$/;

function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx style-isolation.ts <scope>",
      "  e.g.: src/lessons/   src/lessons/tls/tls.css   src/",
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

// ── Comment-strip that preserves line numbers ─────────────────────────────
function stripComments(css: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    if (css[i] === "/" && css[i + 1] === "*") {
      i += 2;
      while (i < css.length && !(css[i] === "*" && css[i + 1] === "/")) {
        out += css[i] === "\n" ? "\n" : " "; // keep newlines so line numbers hold
        i++;
      }
      out += "  "; // the closing */
      i += 2;
    } else {
      out += css[i];
      i++;
    }
  }
  return out;
}

// ── The leak signal: globally-applying selectors ──────────────────────────
// A comma-part is "scoped" if it contains a class (.) or id (#) anywhere — it
// then only matches inside that class/id subtree. A part with neither matches
// globally (`:root`, `*`, `body`, `input[type=range]`, `a:hover`) — a leak.
function isGlobalPart(part: string): boolean {
  const p = part.trim();
  if (!p) return false;
  return !p.includes(".") && !p.includes("#");
}

interface Finding {
  file: string; // relative
  line: number;
  selector: string; // the full prelude
  leakParts: string[]; // the comma-parts that match globally
}

// Brace-aware walker: collect top-level rule-selector preludes, skipping at-rule
// preludes and @keyframes step selectors, with a line number per rule.
function scanCss(text: string, fileRel: string): Finding[] {
  const css = stripComments(text);
  const findings: Finding[] = [];
  let depth = 0;
  let buf = "";
  let line = 1;
  let bufStartLine = 1;
  let bufStarted = false;
  let keyframesDepth = -1; // brace depth at which the current @keyframes block sits, else -1

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "\n") line++;
    if (ch === "{") {
      const prelude = buf.trim();
      const isAtRule = prelude.startsWith("@");
      const insideKeyframes = keyframesDepth !== -1 && depth > keyframesDepth;
      if (isAtRule) {
        if (/^@keyframes\b/i.test(prelude) && keyframesDepth === -1) {
          keyframesDepth = depth; // its inner step selectors are skipped
        }
        // @media / @supports / @container: inner rules are still checked.
      } else if (!insideKeyframes && prelude) {
        const parts = prelude
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const leakParts = parts.filter(isGlobalPart);
        if (leakParts.length > 0) {
          findings.push({ file: fileRel, line: bufStartLine, selector: prelude, leakParts });
        }
      }
      depth++;
      buf = "";
      bufStarted = false;
    } else if (ch === "}") {
      depth--;
      if (keyframesDepth !== -1 && depth <= keyframesDepth) keyframesDepth = -1;
      buf = "";
      bufStarted = false;
    } else if (ch === ";" && depth === 0) {
      // top-level statement terminator (e.g. @import url(...);) — not a rule
      buf = "";
      bufStarted = false;
    } else {
      if (!bufStarted && !/\s/.test(ch)) {
        bufStarted = true;
        bufStartLine = line;
      }
      buf += ch;
    }
  }
  return findings;
}

function checkLeaks(files: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const fileRel = relative(APP_ROOT, file);
    findings.push(...scanCss(readFileSync(file, "utf8"), fileRel));
  }
  return findings;
}

function formatForAgent(findings: Finding[], files: string[]): string {
  const fileList = files.map((f) => `  - ${relative(APP_ROOT, f)}`).join("\n");
  if (findings.length === 0) {
    return `CSS files in scope (${files.length}):
${fileList}

Globally-applying selectors detected: NONE — every top-level rule selector in scope is scoped under a class/id (no bare \`:root\`, \`*\`, or unscoped element selectors leaking out of a lesson root).

This is the clean-scan case. Per the system prompt: sample at most 2-3 files briefly to confirm the walker didn't miss something, then output the default clean map. A bucket (1) finding requires a quoted selector from your actual Read.`;
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
          .map(
            (f) =>
              `  - line ${f.line} · global selector \`${f.selector.replace(/\s+/g, " ").slice(0, 120)}\`  (leaks via: ${f.leakParts.join(", ")})`,
          )
          .join("\n")}`,
    )
    .join("\n\n");

  return `CSS files in scope (${files.length}):
${fileList}

Globally-applying selectors detected (${findings.length}) — scanned by the harness, NOT yet verified:
${grouped}

For EACH hit, Read the file to see which lesson it belongs to and what the rule does. A leak in a lesson \`<slug>.css\` must be scoped under that lesson's root class. The SHELL layer (src/shared/tokens.css, src/shared/utilities.css) is INTENTIONALLY global — those are bucket (2). Classify each into ONE of the three buckets.`;
}

// ── Agent's job (quality bar lives here) ──────────────────────────────────
function systemPrompt(scope: string): string {
  return `You are the style-isolation mapper for the Interactive Lessons repository (React 19 + Vite — self-contained lessons, each lazily loaded and each shipping its OWN <slug>.css scoped under a lesson root class: .bt-root, .hll, .tls-root, .vp-root, .mk-root, .sha-root, .cap-root, .udp-root, .lesson-root, .mw, .idx-root, etc.). The harness has parsed \`${scope}\` and flagged every top-level rule whose selector matches GLOBALLY (a comma-part with no class/id — e.g. \`:root\`, \`*\`, \`body\`, \`input[type=range]\`, \`a:hover\`). Your job: turn it into a curated map of which ones actually LEAK out of a lesson.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human scopes what they agree leaks.

WHY THIS MATTERS: lessons load lazily and the shell does client-side nav, so a lesson's <style>/CSS persists across navigation. A global \`:root{ --ink: #0a1416 }\` in a lesson stylesheet overrides the shell's token for the whole app once that lesson is opened (this exact bug shipped in tls.css and vp-tree.css before they were scoped). A bare \`*{}\` restyles every element on the page. The fix is to scope the rule under the lesson's root class: \`:root{ --x }\` → \`.tls-root{ --x }\`; \`*{ box-sizing }\` → \`.tls-root *{ box-sizing }\`; \`input[type=range]{}\` → \`.lesson-root input[type=range]{}\`.

For EACH candidate, classify it into EXACTLY ONE of three buckets:

(1) LEAK — SCOPE IT. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT selector as observed in your Read, in backticks, with the file:line and the lesson it belongs to. Cite or omit.
    (b) WHY it leaks — it lives in a per-lesson <slug>.css (or the index page's index-page.css), is not an at-rule/keyframe, and applies outside that lesson's subtree (a \`:root\` custom-property block, a bare \`*\`, a bare element/attribute selector).
    (c) ACTION — the literal next step: "move these custom properties onto \`.<root>{ }\`" / "rewrite as \`.<root> *{ }\`" / "prefix the selector with \`.<root> \`".

(2) INTENTIONALLY GLOBAL / NOT-A-LEAK — verified. State the SPECIFIC reason:
    - src/shared/tokens.css \`:root{}\` is the family-glue design-token layer — it is SUPPOSED to be global. Bucket (2).
    - src/shared/utilities.css holds shell-scoped utility classes + the GLOBAL reduced-motion override block — intentionally global by design. Bucket (2).
    - A walker false-positive: the selector actually IS scoped (e.g. it is a keyframe step the walker mis-grouped, or part of a larger scoped selector) — say what you Read that shows it is fine.
    - An at-rule prelude that slipped through.
    Listing what you CONSIDERED and REJECTED shows your work.

(3) JUDGMENT-HEAVY (your call). A global selector whose globality may be deliberate but debatable (e.g. a lesson intentionally restyling a shared element, a generic unprefixed CLASS name like \`.panel\` that does not leak globally but COULD collide with another lesson's \`.panel\` — note these as a softer concern). Name the trade-off.

KNOWN-CONTEXT AWARENESS:
- src/shared/tokens.css and src/shared/utilities.css are the SHELL'S global layer — global by design, always bucket (2). Do not flag them as leaks.
- @import url(fonts) and @keyframes are not style rules — the walker already excludes them; if one appears, it is bucket (2).
- A selector containing a class (\`.bt-root *\`, \`.hll .panel\`) is already scoped — the walker should not have flagged it; if it did, bucket (2) false-positive.
- index-page.css belongs to the landing index; its rules should be scoped under \`.idx-root\` (or its \`idx-\` classes) — a bare global there is still a leak.

WHEN THE HARNESS REPORTS 0 LEAKS (clean scan): the DEFAULT output is a clean map — sample 2-3 files to confirm, then:

> ## Leak — scope it (review & act)
> *(none — 0 globally-applying selectors in lesson CSS; brief sample of N files confirmed everything is scoped under its root)*

A bucket (1) finding requires a quoted selector from your Read. Do not confabulate.

Hard rules:
- The shell layer (tokens.css, utilities.css) is never a leak.
- No hypothetical fixes — if you cannot name the root class to scope under, it is bucket (3).
- If the same global pattern recurs across many lessons, report the pattern once with the per-file list.

Output a structured map with exactly these three sections in this order:

## Leak — scope it (review & act)

(per item — file:line · WHAT (quoted selector + lesson) · WHY · ACTION)

## Intentionally global / not-a-leak — verified

(list — finding · reason)

## Judgment-heavy (your call)

(list — finding · the trade-off)

End with a final summary line: "<X> leak · <Y> intentional · <Z> judgment". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Style-isolation loop — scope: ${scope}\n`);

  const files = gatherSources(scope);
  if (files.length === 0) {
    report([
      `Scope:               ${scope}`,
      `CSS files in scope:  0`,
      "",
      "RESULT: PASS — no scannable CSS files in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Parsing ${files.length} CSS file(s) for global selectors ──`);
  const findings = checkLeaks(files);
  console.log(`   Globally-applying selectors detected: ${findings.length}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, files),
    // opus: distinguishing an intentional shell-layer global from a lesson leak
    // is exactly the kind of judgment worth the stronger model.
    model: "opus",
  });

  report([
    `Scope:                 ${scope}`,
    `CSS files in scope:    ${files.length}`,
    `Global selectors:      ${findings.length}`,
    `Agent run:             ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Leak section and scope the selectors you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
