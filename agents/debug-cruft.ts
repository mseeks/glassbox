/**
 * Debug-cruft loop — Many Hands Engineering, loop #8.
 *
 * A READ-ONLY mapper of leftover debug statements and intentional/forgotten test
 * skips — `console.log` / `console.debug` / `debugger`, plus `.only` / `.skip` /
 * `.todo` and the `xdescribe` / `xit` / `xtest` skip forms. The harness sweeps the
 * scope with pure-node regex (no external tool) and hands the hits to the agent,
 * which Reads each in context and emits a strict three-bucket map under a hard
 * cite-or-omit rule.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 * You delete / re-enable what you choose.
 *
 * Usage: tsx debug-cruft.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/   src/lessons/   src/shared/   tests/
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

// File types to scan — JS/JSX source. No `.css`/`.md`: they don't contain
// executable cruft (console.log / debugger / .only) we care about.
const SCAN_EXT = /\.(?:js|jsx|mjs|cjs)$/;

// ── Required scope ────────────────────────────────────────────────────────
function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx debug-cruft.ts <scope>",
      "  e.g.: src/   src/lessons/   src/shared/   tests/",
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

// ── Cruft patterns (the deterministic signal) ─────────────────────────────
type CruftKind =
  | "console.log"
  | "console.debug"
  | "debugger"
  | "it.only"
  | "test.only"
  | "describe.only"
  | "it.skip"
  | "test.skip"
  | "describe.skip"
  | "it.todo"
  | "test.todo"
  | "describe.todo"
  | "xdescribe"
  | "xit"
  | "xtest";

interface CruftPattern {
  kind: CruftKind;
  pattern: RegExp;
}

// Patterns are scanned per-line; the agent verifies in context. The `.only`
// family is the highest-severity case — a single `it.only` silently disables
// every other test in its file. The harness flags every hit; the agent demotes
// meta-references (a marker inside a string or comment) to bucket (2).
const CRUFT_PATTERNS: CruftPattern[] = [
  { kind: "console.log", pattern: /\bconsole\.log\s*\(/g },
  { kind: "console.debug", pattern: /\bconsole\.debug\s*\(/g },
  { kind: "debugger", pattern: /\bdebugger\b/g },
  { kind: "it.only", pattern: /\bit\.only\s*\(/g },
  { kind: "test.only", pattern: /\btest\.only\s*\(/g },
  { kind: "describe.only", pattern: /\bdescribe\.only\s*\(/g },
  { kind: "it.skip", pattern: /\bit\.skip\s*\(/g },
  { kind: "test.skip", pattern: /\btest\.skip\s*\(/g },
  { kind: "describe.skip", pattern: /\bdescribe\.skip\s*\(/g },
  { kind: "it.todo", pattern: /\bit\.todo\s*\(/g },
  { kind: "test.todo", pattern: /\btest\.todo\s*\(/g },
  { kind: "describe.todo", pattern: /\bdescribe\.todo\s*\(/g },
  { kind: "xdescribe", pattern: /\bxdescribe\s*\(/g },
  { kind: "xit", pattern: /\bxit\s*\(/g },
  { kind: "xtest", pattern: /\bxtest\s*\(/g },
];

interface Finding {
  file: string; // relative
  line: number;
  kind: CruftKind;
  snippet: string;
}

function checkCruft(files: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const fileRel = relative(APP_ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Trim, bound snippet for the agent's input
      const snippet = line.trim().slice(0, 140);
      for (const { kind, pattern } of CRUFT_PATTERNS) {
        // Reset lastIndex since we reuse the regex across lines
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          findings.push({ file: fileRel, line: i + 1, kind, snippet });
        }
      }
    }
  }
  return findings;
}

function formatForAgent(findings: Finding[], files: string[]): string {
  const fileList = files.map((f) => `  - ${relative(APP_ROOT, f)}`).join("\n");
  if (findings.length === 0) {
    return `Files in scope (${files.length}):
${fileList}

Debug cruft detected: NONE — no \`console.log\` / \`console.debug\` / \`debugger\` / \`.only\` / \`.skip\` / \`.todo\` / \`x*\` markers found in the scope.

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

Debug cruft detected (${findings.length}) — scanned by the harness, NOT yet verified:
${grouped}

For EACH hit, Read the surrounding context. Some are forgotten cruft (a stray \`console.log\`, a \`debugger\`, an \`it.only\` left from focused debugging); some are intentional (a \`.skip\` with a documented reason, an \`agents/\` harness \`console.log\`); some are meta-references (the word inside a string or comment). Classify each into ONE of the three buckets per the system prompt.`;
}

// ── Agent's job (quality bar lives here) ──────────────────────────────────
function systemPrompt(scope: string): string {
  return `You are the debug-cruft mapper for the Glassbox repository (React 19 + Vite + JavaScript — self-contained lessons, each with a pure \`engine/index.js\`; tests run under Vitest, with Playwright smoke specs in \`tests/e2e/\`). The harness has scanned \`${scope}\` for leftover debug statements and intentional/forgotten test skips (console.log / console.debug / debugger, plus .only / .skip / .todo / x*) and given you a candidate list. Your job: turn it into a curated map of what to act on.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human deletes / re-enables what they agree is worth it.

A \`.only\` in a spec is the HIGHEST-severity finding: it silently disables every other test in its file when CI runs. Always classify a \`.only\` in bucket (1) unless you can quote a nearby comment that explicitly justifies its presence (rare).

For EACH candidate, classify it into EXACTLY ONE of three buckets:

(1) FORGOTTEN — DELETE NOW. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT line as you observed it in your Read, in backticks, with the line number (e.g. "line 42 — \`console.log('here', data)\` — left over from debugging the send flow"). No quote pasted from a Read = no finding. This is a hard binary: cite or omit.
    (b) WHY it matters (concrete risk now — a \`.only\` disables every sibling test; a \`console.log\` logs noise into production stdout; a \`debugger\` halts in devtools),
    (c) ACTION — a literal next step: "delete the call" / "remove the \`.only\` so the full file runs" / "delete the \`debugger\` line".
      If you cannot name a concrete action — it does NOT belong here. Move to (2) or (3).

(2) INTENTIONAL / JUSTIFIED — verified. State the SPECIFIC reason the marker is doing real work, quoting the justifying comment if present:
    - A \`.skip\` / \`.todo\` with a nearby comment that documents why it's disabled and what unblocks it,
    - \`agents/*.ts\` harness output — those CLI loops legitimately use \`console.log\` / \`process.stdout.write\` for live progress and the final report; not cruft,
    - A lesson \`engine/*.js\` input-guard \`console.warn\` with a justifying comment (e.g. the cuckoo-filter power-of-two guard) — a deliberate runtime guard, not cruft,
    - Verified meta-reference — the regex hit text inside a string, comment, or doc (e.g. a comment containing the word "debugger"); not a real statement.
    Listing what you CONSIDERED and REJECTED matters — it shows your work.

(3) STALE SKIP — RE-ENABLE NOW (your call). Use for a \`.skip\` / \`xit\` / \`xdescribe\` whose underlying reason appears resolved: state what you Read that suggests the issue is fixed, and name the test you'd re-enable. Briefly note any cost (the test may need updating to pass) so a human can decide.

KNOWN-CONTEXT AWARENESS for this repo:
- \`agents/*.ts\` files legitimately use \`console.log\` / \`process.stdout.write\` extensively for harness output — \`agents/lib.ts\` streams tool-use markers and the final \`report([...])\` block prints to stdout. These are bucket (2), reason "harness output by design".
- A lesson \`engine/*.js\` may legitimately \`console.warn\` to flag invalid input, guarded by a nearby justifying comment (e.g. the cuckoo-filter engine warns when \`numBuckets\` is not a power of two). A \`console.warn\` that guards an invariant AND has a justifying comment is bucket (2); a bare \`console.log\` with no rationale is bucket (1).
- The Playwright \`tests/e2e/\` files occasionally use \`console.log\` as debug aids — mostly legitimate; verify by Read.
- A \`console.log\` / \`console.debug\` in app source (\`src/**\`) OUTSIDE the guarded-warn case above is highly likely bucket (1).

WHEN THE HARNESS REPORTS 0 CRUFT (clean mechanical scan):
The DEFAULT, EXPECTED output is a clean map. Sample at most 2-3 files briefly to confirm the regex didn't miss something subtle, then output:

> ## Forgotten — delete now (review & act)
> *(none — 0 debug-cruft markers detected by the scan; brief sample of N files confirmed no stray console.log/debugger/.only at the spots checked)*

To override this default with a bucket (1) finding, you MUST quote the exact line you observed in your Read — same citation rule as above. Do NOT pattern-match on what typical cruft looks like and reach for plausible-sounding findings to fill the buckets. A confident-sounding inference without a quoted line is a confabulation; suppress it.

INVESTIGATION SCOPE:
Primary findings are within \`${scope}\` only. If tracing a hit surfaces a compelling related issue in an adjacent file, mention it ONCE as a brief "Out-of-scope observation:" line at the very end of the report (with the file:line + a quoted citation). Do not enumerate adjacent files. The user can re-run with a wider scope if it's worth it.

Hard rules:
- No purity-for-purity's-sake. If a hit is intentional and has no concrete cost, it's bucket (2).
- No hypothetical fixes. If the ACTION isn't a literal delete / re-enable, it's bucket (3), not (1).
- If the same marker recurs identically many times, report the PATTERN once with one action covering all sites — don't pad the map.

Output a structured map with exactly these three sections in this order:

## Forgotten — delete now (review & act)

(per item — location · WHAT (quoted line) · WHY · ACTION)

## Intentional / justified — verified

(list — finding · reason (quote the justifying comment if present))

## Stale skip — re-enable now (your call)

(list — finding · what you Read that suggests the issue is resolved · the test you'd re-enable)

End with a final summary line: "<X> delete · <Y> kept · <Z> re-enable". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Debug-cruft loop — scope: ${scope}\n`);

  const files = gatherSources(scope);
  if (files.length === 0) {
    report([
      `Scope:               ${scope}`,
      `Files in scope:      0`,
      "",
      "RESULT: PASS — no scannable files (.js/.jsx/.mjs/.cjs) in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Sweeping ${files.length} file(s) for debug cruft ──`);
  const findings = checkCruft(files);
  console.log(`   Debug cruft detected: ${findings.length}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, files),
    // sonnet is the default; the regex hands the agent concrete lines to anchor on.
  });

  report([
    `Scope:               ${scope}`,
    `Files in scope:      ${files.length}`,
    `Cruft detected:      ${findings.length}`,
    `Agent run:           ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Delete-now section and re-enable the stale skips you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
