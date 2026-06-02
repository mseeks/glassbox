/**
 * Promise-hygiene loop — Many Hands Engineering, loop #9.
 *
 * A READ-ONLY mapper of floating promises and async-correctness hazards. The
 * harness combines three pure-node signals — `.then(...)` chains with no
 * `.catch(...)` within a bracket-depth-aware lookahead, top-level `new Promise(...)`
 * constructions whose result is discarded, and a per-file marker flagging files
 * that contain `async` functions (so the agent knows where to sample for floating
 * async-call sites the regex can't catch). The agent (Read / Grep / Glob only)
 * Reads each site in context and emits a strict three-bucket map under a hard
 * cite-or-omit rule.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 * You add the awaits / catches you choose.
 *
 * Usage: tsx promise-hygiene.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/   src/lessons/   src/shared/   src/index-page/
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"];

// Dirs the walker skips entirely
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".claude",
  "coverage",
  "dist",
  "test-results",
  "playwright-report",
]);

// File types to scan — async hygiene matters most in JS / JSX (effects, handlers).
const SCAN_EXT = /\.(?:js|jsx|mjs|cjs)$/;

// How far past a `.then(` to look for a `.catch` before calling the chain unhandled.
const MAX_CHAIN_LOOKAHEAD = 10;

// ── Required scope ────────────────────────────────────────────────────────
function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx promise-hygiene.ts <scope>",
      "  e.g.: src/   src/lessons/   src/shared/   src/index-page/",
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

// ── Gather source files in scope (handles file or dir) ────────────────────
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

// ── Bracket-depth-aware chain walk (the only nontrivial code) ──────────────
// Given the source and the index of the `(` that opens a `.then(`, decide
// whether the promise chain is handled — i.e. a `.catch(` appears later in the
// same chain within MAX_CHAIN_LOOKAHEAD lines. Tracks paren depth and string /
// template-literal nesting so parens inside strings don't fool the counter.
// KISS: template `${}` interpolation isn't fully parsed — the agent verifies.

/** From an open `(` at `i`, return the index just past its matching `)`, or -1. */
function skipBalancedParens(src: string, i: number): number {
  let depth = 0;
  let quote = ""; // "'" | '"' | "`" | ""
  for (; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === "\\") i++; // skip escaped char
      else if (c === quote) quote = "";
      continue;
    }
    if (c === "'" || c === '"' || c === "`") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

/** Skip whitespace and // and /* *​/ comments starting at `i`. */
function skipTrivia(src: string, i: number): number {
  for (;;) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src.startsWith("//", i)) {
      const nl = src.indexOf("\n", i);
      if (nl === -1) return src.length;
      i = nl + 1;
    } else if (src.startsWith("/*", i)) {
      const end = src.indexOf("*/", i + 2);
      if (end === -1) return src.length;
      i = end + 2;
    } else {
      return i;
    }
  }
}

function lineAt(src: string, idx: number): number {
  let line = 1;
  for (let i = 0; i < idx && i < src.length; i++) if (src[i] === "\n") line++;
  return line;
}

/** Is the `.then(` chain whose opening `(` is at `openParen` followed by a `.catch`? */
function chainHandled(src: string, openParen: number): boolean {
  const startLine = lineAt(src, openParen);
  let i = openParen;
  for (;;) {
    i = skipBalancedParens(src, i);
    if (i < 0) return true; // unbalanced / spills past EOF — don't false-positive
    const j = skipTrivia(src, i);
    if (lineAt(src, j) - startLine > MAX_CHAIN_LOOKAHEAD) return false;
    if (src.startsWith(".catch", j)) return true;
    // A continued chain link (.then / .finally / .anyMethod) — walk it too.
    if (/^\.[A-Za-z_$]/.test(src.slice(j, j + 2))) {
      const nextParen = src.indexOf("(", j);
      if (nextParen < 0) return false;
      i = nextParen;
      continue;
    }
    return false; // chain ended (`;`, statement, etc.) with no `.catch`
  }
}

// ── Signals ────────────────────────────────────────────────────────────────
type PromiseKind = "uncaught-then" | "floating-new-promise" | "async-file-marker";

interface Finding {
  file: string; // relative
  line: number;
  kind: PromiseKind;
  snippet: string;
}

function snippetAt(lines: string[], lineNum: number): string {
  return (lines[lineNum - 1] ?? "").trim().slice(0, 140);
}

function checkPromiseHygiene(file: string): Finding[] {
  const fileRel = relative(APP_ROOT, file);
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const findings: Finding[] = [];

  // Signal A — `.then(` with no `.catch` in the chain.
  const thenRe = /\.then\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = thenRe.exec(src)) !== null) {
    const openParen = src.indexOf("(", m.index);
    if (openParen < 0) continue;
    if (!chainHandled(src, openParen)) {
      const line = lineAt(src, m.index);
      findings.push({ file: fileRel, line, kind: "uncaught-then", snippet: snippetAt(lines, line) });
    }
  }

  // Signal B — floating `new Promise(...)` (not awaited / returned / assigned).
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const np = line.match(/\bnew\s+Promise\s*\(/);
    if (!np) continue;
    const before = line.slice(0, np.index).trim();
    const consumed = before === "" ? false : /[=:([,]\s*$|\b(?:return|await|void|yield)\s*$/.test(before);
    if (!consumed) {
      findings.push({
        file: fileRel,
        line: i + 1,
        kind: "floating-new-promise",
        snippet: line.trim().slice(0, 140),
      });
    }
  }

  // Signal C — one per-file marker at the first `async` FUNCTION site (an
  // invitation to sample for floating async-call sites; NOT itself debt). The
  // pattern matches `async function`, `async (...) =>`, and `async name(...)`
  // but not the bare word "async" in a comment / string / type annotation.
  const ASYNC_FN = /\basync\s+(?:function\b|\(|[A-Za-z_$][\w$]*\s*\()/;
  for (let i = 0; i < lines.length; i++) {
    if (ASYNC_FN.test(lines[i])) {
      findings.push({
        file: fileRel,
        line: i + 1,
        kind: "async-file-marker",
        snippet: lines[i].trim().slice(0, 140),
      });
      break;
    }
  }

  return findings;
}

function formatForAgent(findings: Finding[], files: string[]): string {
  const fileList = files.map((f) => `  - ${relative(APP_ROOT, f)}`).join("\n");
  if (findings.length === 0) {
    return `Files in scope (${files.length}):
${fileList}

Promise signals detected: NONE — no uncaught \`.then\`, floating \`new Promise\`, or \`async\` functions found in the scope.

This is the clean-scan case. Per the system prompt: sample at most 2-3 files briefly to confirm the regex didn't miss something subtle, then output the default clean map. A bucket (1) finding requires a quoted line from your actual Read — no quote means no finding. Do not reach for findings to fill the buckets.`;
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
          .map((f) => `  - line ${f.line} · [${f.kind}]\n      ${f.snippet}`)
          .join("\n")}`,
    )
    .join("\n\n");

  return `Files in scope (${files.length}):
${fileList}

Promise signals detected (${findings.length}) — scanned by the harness, NOT yet verified:
${grouped}

The three signal kinds:
- \`uncaught-then\` — a \`.then(\` whose chain has no \`.catch\` within ${MAX_CHAIN_LOOKAHEAD} lines. May be a real unhandled rejection, OR handled by a parent try/catch / a \`.catch\` further down. Read to decide.
- \`floating-new-promise\` — a \`new Promise(...)\` that looks discarded. May be intentional fire-and-forget. Read to decide.
- \`async-file-marker\` — NOT debt itself: a pointer that this file has \`async\` functions. Use it to sample for floating async CALL sites (an \`async fn()\` whose returned promise is discarded) that pure regex can't catch.

For EACH signal, Read the surrounding context and classify it into ONE of the three buckets per the system prompt.`;
}

// ── Agent's job (quality bar lives here) ──────────────────────────────────
function systemPrompt(scope: string): string {
  return `You are the promise-hygiene mapper for the Interactive Lessons repository (React 19 + Vite + JavaScript — thirteen self-contained lessons; pure synchronous \`engine/*.js\` plus a React/labs layer where the async surface lives). The harness has scanned \`${scope}\` for floating promises and async-correctness hazards and given you a candidate list (uncaught \`.then\` chains, floating \`new Promise\`, and per-file \`async\` markers). Your job: turn it into a curated map of real hazards worth fixing — filtering out the safe cases.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human adds the awaits / catches they agree are worth it.

For EACH candidate, classify it into EXACTLY ONE of three buckets:

(1) ACTION NOW. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT suspect site (the \`.then\` line, the floating call, the \`new Promise\`) as you observed it in your Read, in backticks, with the line number. No quote pasted from a Read = no finding. This is a hard binary: cite or omit.
    (b) WHY it matters (the silently-absorbed failure mode — an exception becomes an unhandled rejection that surfaces only as a UI freeze; a missing \`await\` means the data isn't ready when read),
    (c) ACTION — the concrete fix: "add a \`.catch\` handler with the appropriate fallback" / "refactor to async/await with a try/catch" / "add the missing \`await\`" / "make it explicit fire-and-forget with \`.catch(noop)\` + a comment".
      If you cannot name a concrete fix — it does NOT belong here. Move to (2) or (3).

(2) INTENTIONAL / VERIFIED SAFE. State the SPECIFIC reason, quoting the comment or surrounding try/catch:
    - The \`.then\` is followed by a \`.catch\` slightly outside the harness's ${MAX_CHAIN_LOOKAHEAD}-line window, or the whole chain sits inside a parent try/catch,
    - The chain / promise is stored in a variable or returned and awaited elsewhere,
    - A genuinely intentional fire-and-forget with a nearby comment explaining why the result is ignored,
    - An \`async-file-marker\` you sampled and found all call sites are properly awaited (a verified non-issue),
    - A sync call the wide net flagged that does NOT return a promise.
    Listing what you CONSIDERED and REJECTED matters — it shows your work.

(3) JUDGMENT-HEAVY (your call). Use sparingly: a genuine hazard whose fix isn't obvious — making the caller async cascades through a synchronous interface, or the correct on-error behavior is a product/UX decision, or the chain composes through several helpers and the right fix is structural. Briefly name the COST so a human can decide.

KNOWN-CONTEXT AWARENESS for this repo:
- The browser \`fetch(...)\` does NOT throw on non-2xx (only on network failure) — a \`.then\` chain without a \`.catch\` can swallow a real network rejection; Read whether a parent \`try/catch\` or a \`.catch\` further down handles it before flagging.
- React effects cannot be \`async\` directly — the convention is \`useEffect(() => { (async () => { ... })() }, [])\`. An async IIFE inside an effect whose body can reject with no internal try/catch absorbs the rejection silently — a candidate for (1) or (3).
- Event handlers that fire an async function (\`onClick={() => doAsync()}\`) discard the returned promise; if \`doAsync\` can reject and nothing catches it, that is a real bucket-(1) floating call.
- The lesson \`engine/*.js\` files are pure and synchronous — promise hygiene rarely applies there; the async surface is the React / labs / effects layer. A sync engine helper the wide net flagged that does NOT return a promise is bucket (2).
- Test files where \`await expect(fn()).rejects.toThrow(...)\` asserts a rejection are fine — bucket (2).

WHEN THE HARNESS REPORTS 0 SIGNALS (clean mechanical scan):
The DEFAULT, EXPECTED output is a clean map. Sample at most 2-3 files briefly to confirm the regex didn't miss something subtle, then output:

> ## Action now (review & fix)
> *(none — 0 promise signals detected by the scan; brief sample of N files confirmed awaits/handlers are in place at the spots checked)*

To override this default with a bucket (1) finding, you MUST quote the exact line you observed in your Read — same citation rule as above. Do NOT pattern-match on what typical promise bugs look like and reach for plausible-sounding findings to fill the buckets. A confident-sounding inference without a quoted line is a confabulation; suppress it.

INVESTIGATION SCOPE:
Primary findings are within \`${scope}\` only. If tracing a call surfaces a compelling related issue in an adjacent file, mention it ONCE as a brief "Out-of-scope observation:" line at the very end of the report (with the file:line + a quoted citation). Do not enumerate adjacent files. The user can re-run with a wider scope if it's worth it.

Hard rules:
- No purity-for-purity's-sake. A handled chain (or an awaited call) is fine — skip it.
- No hypothetical fixes. If the ACTION isn't a concrete add-await / add-.catch / wrap-in-try-catch / explicit-void, it's bucket (3), not (1).
- The \`async-file-marker\` is a sampling pointer, NOT a finding to report. Only report a concrete floating call you actually found and quoted while sampling it.
- If the same pattern recurs identically many times, report it once with one action covering all sites — don't pad the map.

Output a structured map with exactly these three sections in this order:

## Action now (review & fix)

(per item — location · WHAT (quoted site) · WHY · ACTION)

## Intentional / verified safe

(list — finding · reason (quote the comment or surrounding try/catch))

## Judgment-heavy (your call)

(list — finding · cost)

End with a final summary line: "<X> action · <Y> safe · <Z> judgment". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Promise-hygiene loop — scope: ${scope}\n`);

  const files = gatherSources(scope);
  if (files.length === 0) {
    report([
      `Scope:                ${scope}`,
      `Files in scope:       0`,
      "",
      "RESULT: PASS — no scannable files (.js/.jsx/.mjs/.cjs) in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Sweeping ${files.length} file(s) for promise hygiene ──`);
  const findings = files.flatMap(checkPromiseHygiene);
  const uncaughtCount = findings.filter((f) => f.kind === "uncaught-then").length;
  const floatingPromiseCount = findings.filter((f) => f.kind === "floating-new-promise").length;
  const asyncFileMarkerCount = findings.filter((f) => f.kind === "async-file-marker").length;
  console.log(`   Signals detected: ${findings.length}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, files),
    // sonnet is the default; if live validation shows reasoning failures on the
    // judgment-heavy chains, opt into `model: "opus"` here with the symptom noted.
  });

  report([
    `Scope:                ${scope}`,
    `Files in scope:       ${files.length}`,
    `Uncaught .then:       ${uncaughtCount}`,
    `Floating new Promise: ${floatingPromiseCount}`,
    `Async-file markers:   ${asyncFileMarkerCount}`,
    `Agent run:            ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Action section and apply the fixes you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
