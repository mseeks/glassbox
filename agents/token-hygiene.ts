/**
 * Token-hygiene loop — Many Hands Engineering, CSS custom-property integrity.
 *
 * A READ-ONLY mapper of dangling and dead CSS custom properties — the gap knip
 * (the dead-code loop) cannot see, since it only understands JS. After a big
 * theme/token refactor a lesson tends to accrue two faults:
 *
 *   • REFERENCED-BUT-UNDEFINED — a `var(--x)` whose `--x` is defined nowhere
 *     reachable (a rename typo, a cross-lesson leak, a deleted token). It renders
 *     as nothing (or the fallback), silently.
 *   • DEFINED-BUT-UNUSED — a `--x:` declared on a lesson root that no rule or
 *     inline style ever reads. Dead weight left by a rename or a dropped widget.
 *
 * The harness scans every `.css` + `.jsx`/`.js` in scope (plus the shell layer
 * and the lesson-kit, which are always reachable) for declarations (`--x:`) and
 * references (`var(--x)`, incl. inline `style={{'--x': …}}`), diffs the two sets,
 * and hands the agent the dangling refs + the unused defs with file:line. The
 * agent Reads each and emits a strict three-bucket map. Custom properties can be
 * read by JS (`getComputedStyle`) or kept as a deliberate fallback, so — like
 * the other mappers — it only ever PROPOSES; the human prunes.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 *
 * Usage: tsx token-hygiene.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/lessons/   src/lessons/tls/   src/lessons/bloom-clock/bloom-clock.css
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
  "agents",
]);

const SCAN_EXT = /\.(css|jsx|js|mjs|cjs)$/;

// The shell layer + the lesson-kit are ALWAYS reachable: their tokens are the
// shared API every lesson can consume, and lesson-kit.css reads the `--lk-*`
// contract each lesson sets on its root. Always folded into both sets so a
// lesson's `--lk-accent: …` is seen as USED, and a `var(--ink)` as DEFINED.
const SHELL_FILES = [
  "src/shared/tokens.css",
  "src/shared/utilities.css",
  "src/shared/nav.css",
  "src/shared/lesson-kit/lesson-kit.css",
];

// A handful of tokens are set/read across the React boundary (inline style props
// the static scan can't pair) — `--accent` is set by Nav.jsx on each pill.
const KNOWN_DYNAMIC = new Set(["--accent"]);

function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx token-hygiene.ts <scope>",
      "  e.g.: src/lessons/   src/lessons/tls/   src/lessons/bloom-clock/bloom-clock.css",
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
  if (st.isFile()) return SCAN_EXT.test(scopeAbs) ? [scopeAbs] : [];
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

// ── Comment-strip (CSS + JS line/block), preserving line numbers ───────────
function stripComments(src: string): string {
  let out = "";
  let i = 0;
  while (i < src.length) {
    if (src[i] === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  ";
      i += 2;
    } else if (src[i] === "/" && src[i + 1] === "/") {
      i += 2;
      while (i < src.length && src[i] !== "\n") {
        out += " ";
        i++;
      }
    } else {
      out += src[i];
      i++;
    }
  }
  return out;
}

interface Loc {
  file: string;
  line: number;
}

// Definitions: a custom-property declaration `--x:` (CSS rules) or an inline
// style key `'--x':` / `"--x":` (JSX). References: `var(--x …)`.
const DEF_CSS = /(?:^|[;{}\s])(--[a-zA-Z0-9-]+)\s*:/g;
const DEF_JSX = /['"](--[a-zA-Z0-9-]+)['"]\s*:/g;
// Group 2 captures a `,` when the var() carries a FALLBACK — `var(--x, default)`.
// A reference WITH a fallback is intentionally tolerant of a missing definition
// (the fallback is the design), so only fallback-less undefined refs are dangling.
const REF_VAR = /var\(\s*(--[a-zA-Z0-9-]+)\s*(,)?/g;

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === "\n") line++;
  return line;
}

function collect(file: string, defs: Map<string, Loc[]>, refs: Set<string>): void {
  const fileRel = relative(APP_ROOT, file);
  const raw = stripComments(readFileSync(file, "utf8"));
  const isCss = /\.css$/.test(file);

  const defRe = isCss ? DEF_CSS : DEF_JSX;
  let m: RegExpExecArray | null;
  defRe.lastIndex = 0;
  while ((m = defRe.exec(raw)) !== null) {
    const name = m[1];
    if (!defs.has(name)) defs.set(name, []);
    defs.get(name)!.push({ file: fileRel, line: lineOf(raw, m.index) });
  }
  REF_VAR.lastIndex = 0;
  while ((m = REF_VAR.exec(raw)) !== null) refs.add(m[1]);
}

interface Analysis {
  undefinedRefs: { name: string; locs: Loc[] }[]; // referenced, defined nowhere reachable
  unusedDefs: { name: string; locs: Loc[] }[]; // defined in scope, referenced nowhere
}

function analyze(files: string[]): Analysis {
  const defs = new Map<string, Loc[]>(); // name → where defined (scope + shell)
  const refs = new Set<string>(); // every var(--x) seen (scope + shell)

  // Shell + kit are always reachable.
  for (const rel of SHELL_FILES) {
    const abs = resolve(APP_ROOT, rel);
    if (existsSync(abs)) collect(abs, defs, refs);
  }
  // Track which references appear specifically inside the scope, so we can also
  // record where an undefined ref is used (re-scan scope files for ref sites).
  // refSites records only FALLBACK-LESS reference sites — a `var(--x, default)`
  // tolerates a missing --x by design, so it is never a dangling-ref defect.
  const refSites = new Map<string, Loc[]>();
  for (const file of files) {
    collect(file, defs, refs);
    const fileRel = relative(APP_ROOT, file);
    const raw = stripComments(readFileSync(file, "utf8"));
    let m: RegExpExecArray | null;
    REF_VAR.lastIndex = 0;
    while ((m = REF_VAR.exec(raw)) !== null) {
      if (m[2]) continue; // has a fallback → intentional, not a dangling ref
      if (!refSites.has(m[1])) refSites.set(m[1], []);
      refSites.get(m[1])!.push({ file: fileRel, line: lineOf(raw, m.index) });
    }
  }

  const scopeRel = new Set(files.map((f) => relative(APP_ROOT, f)));
  const shellRel = new Set(SHELL_FILES);

  const undefinedRefs: Analysis["undefinedRefs"] = [];
  for (const [name, locs] of refSites) {
    if (defs.has(name) || KNOWN_DYNAMIC.has(name)) continue;
    undefinedRefs.push({ name, locs: locs.slice(0, 4) });
  }

  const unusedDefs: Analysis["unusedDefs"] = [];
  for (const [name, locs] of defs) {
    if (refs.has(name) || KNOWN_DYNAMIC.has(name)) continue;
    // Only flag defs that live INSIDE the scope (a shell token unused by this
    // scope is not dead — it's API). And ignore the kit's internal `--_x` aliases.
    const inScope = locs.filter((l) => scopeRel.has(l.file) && !shellRel.has(l.file));
    if (inScope.length === 0) continue;
    if (name.startsWith("--_")) continue;
    unusedDefs.push({ name, locs: inScope.slice(0, 4) });
  }

  undefinedRefs.sort((a, b) => a.name.localeCompare(b.name));
  unusedDefs.sort((a, b) => a.name.localeCompare(b.name));
  return { undefinedRefs, unusedDefs };
}

function fmtLocs(locs: Loc[]): string {
  return locs.map((l) => `${l.file}:${l.line}`).join(", ");
}

function formatForAgent(a: Analysis, files: string[], scope: string): string {
  const counts = `${files.length} file(s) in scope`;
  if (a.undefinedRefs.length === 0 && a.unusedDefs.length === 0) {
    return `Scanned ${counts} under \`${scope}\` (+ the shell layer & lesson-kit as always-reachable).

Custom-property hygiene: CLEAN — every \`var(--x)\` resolves to a definition, and every \`--x:\` declared in scope is referenced.

This is the clean-scan case. Sample 2-3 files to confirm the scan didn't miss something, then output the default clean map. A bucket (1)/(2) finding requires a quoted token from your actual Read.`;
  }
  const undef = a.undefinedRefs.length
    ? a.undefinedRefs.map((u) => `  - \`${u.name}\` — referenced at ${fmtLocs(u.locs)}, defined NOWHERE reachable`).join("\n")
    : "  (none)";
  const unused = a.unusedDefs.length
    ? a.unusedDefs.map((u) => `  - \`${u.name}\` — defined at ${fmtLocs(u.locs)}, referenced NOWHERE in scope`).join("\n")
    : "  (none)";
  return `Scanned ${counts} under \`${scope}\` (+ the shell layer & lesson-kit as always-reachable). Two candidate fault sets — scanned by the harness, NOT yet verified:

REFERENCED-BUT-UNDEFINED (${a.undefinedRefs.length}) — a \`var(--x)\` whose \`--x\` is declared nowhere reachable:
${undef}

DEFINED-BUT-UNUSED (${a.unusedDefs.length}) — a \`--x:\` declared in scope that no rule/inline-style reads:
${unused}

For EACH, Read the surrounding code to confirm and classify. Cite or omit.`;
}

function systemPrompt(scope: string): string {
  return `You are the token-hygiene mapper for the Glassbox repository (React 19 + Vite — self-contained lessons, each with its own \`<slug>.css\` and a bespoke palette of CSS custom properties scoped under a lesson root: .tls-root, .bc-root, .iso-root, .lsm, .mw, .hll, …; the shell layer in src/shared/{tokens,utilities,nav}.css + lesson-kit defines the shared \`--paper\`/\`--ink\`/\`--rule\`/\`--lk-*\` API). The harness has scanned \`${scope}\` (plus the always-reachable shell + kit) for custom-property DECLARATIONS (\`--x:\`) and REFERENCES (\`var(--x)\`, including inline \`style={{'--x': …}}\`), and diffed them. Your job: turn the two candidate lists into a curated map.

Your only tools are Read / Grep / Glob — you can investigate but CANNOT edit any file. The human prunes/repairs what you map.

WHY THIS MATTERS: a \`var(--typo)\` with no definition renders as nothing (or silently falls back), and dead \`--x:\` declarations are exactly the residue a token rename or a dropped widget leaves behind — invisible to knip, which only reads JS. This loop is the CSS-variable complement to the dead-code loop.

For EACH candidate, classify into EXACTLY ONE of three buckets:

(1) DEFECT — FIX. A genuine fault. Include ONLY when you can answer in one sentence each:
    (a) WHAT — quote the token + the file:line from your Read (a \`var(--x)\` with no reachable \`--x:\`, or a \`--x:\` no one reads). Cite or omit.
    (b) WHY — for a dangling ref: name where you looked for the definition and confirm it is absent (a rename typo, a cross-lesson reference to another lesson's token, a deleted token). For a dead def: confirm no rule, no inline style, and no other lesson/shell file reads it.
    (c) ACTION — "define \`--x\` on \`.<root>\` (or fix the ref to \`--y\`)" / "remove the dead \`--x:\` declaration".

(2) NOT-A-FAULT — verified. State the specific reason:
    - The token IS defined/used, just somewhere the per-file scan attributed differently (quote what you Read).
    - A deliberate \`var(--x, fallback)\` where the fallback is the design and \`--x\` is intentionally optional (the ref is fine even with no definition).
    - A token read across the React boundary (set/consumed via inline style props or \`getComputedStyle\` in JS) that the static scan can't pair.
    - A \`--lk-*\` contract token a lesson sets for the kit to consume (used by lesson-kit.css), or a shell token — these are API, not dead.

(3) JUDGMENT-HEAVY (your call). A token plausibly kept on purpose (a documented future-use slot, a full palette tier where some steps are unused today but belong to the set) vs. genuinely dead. Name the trade-off.

KNOWN-CONTEXT AWARENESS:
- \`var(--x, fallback)\` references \`--x\` AND carries a fallback — a missing \`--x\` here is often intentional, not a bug. Check the fallback.
- The lesson-kit's internal \`--_x\` aliases and the \`--lk-*\` contract are a system; don't flag a lesson's \`--lk-accent:\` as dead (lesson-kit.css reads it).
- A lesson that sets the same token in its base block AND its \`[data-theme='…']\` block is fine (one def "wins" per theme); that is theme-parity's domain, not a hygiene fault.

WHEN THE HARNESS REPORTS a CLEAN scan: sample 2-3 files to confirm, then output the default clean map:

> ## Defect — fix (review & act)
> *(none — every var() resolves and every in-scope token is referenced; brief sample of N files confirmed)*

A bucket (1) finding requires a quoted token from your Read. Do not confabulate.

Output a structured map with exactly these three sections in this order:

## Defect — fix (review & act)

(per item — token · file:line · WHAT · WHY · ACTION)

## Not-a-fault — verified

(list — token · reason)

## Judgment-heavy (your call)

(list — token · the trade-off)

End with a final summary line: "<X> defect · <Y> not-a-fault · <Z> judgment". Nothing after.`;
}

async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Token-hygiene loop — scope: ${scope}\n`);

  const files = gatherSources(scope);
  if (files.length === 0) {
    report([
      `Scope:               ${scope}`,
      `Files in scope:      0`,
      "",
      "RESULT: PASS — no scannable .css/.jsx/.js files in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Scanning ${files.length} file(s) for custom-property defs/refs ──`);
  const a = analyze(files);
  console.log(`   Referenced-but-undefined: ${a.undefinedRefs.length} · Defined-but-unused: ${a.unusedDefs.length}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(a, files, scope),
    // opus: separating a deliberate var(--x, fallback) / cross-boundary token from
    // a genuine dangling ref or dead declaration is exactly the judgment worth it.
    model: "opus",
  });

  report([
    `Scope:                      ${scope}`,
    `Files in scope:             ${files.length}`,
    `Referenced-but-undefined:   ${a.undefinedRefs.length}`,
    `Defined-but-unused:         ${a.unusedDefs.length}`,
    `Agent run:                  ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Defect section and prune/repair what you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
