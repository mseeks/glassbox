/**
 * Suppression-debt loop — Many Hands Engineering, loop #6.
 *
 * The JS adaptation of revisionist's *type-debt* loop. TypeScript escape hatches
 * (`as any`, `@ts-ignore`, …) don't exist in a pure-JavaScript codebase — but the
 * loop's SPIRIT does: find every place the developer deliberately weakened the
 * static safety net, verify each, and map which can be removed. In this stack the
 * static safety net is ESLint, and the escape hatches are the `eslint-disable`
 * family — the direct analog of `@ts-ignore` / `@ts-expect-error`.
 *
 * A READ-ONLY mapper. The harness sweeps the scope with pure-node regex (no
 * external tool) for inline ESLint suppression directives and hands the hits to
 * the agent. The agent (Read / Grep / Glob only) Reads each site in context,
 * judges whether the suppression is removable, legitimately needed, or
 * judgment-heavy, and emits a strict three-bucket map with WHAT/WHY/ACTION
 * articulation per item.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 * You remove the suppressions you choose.
 *
 * Usage: tsx suppression-debt.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/   src/lessons/bloom-filters/   src/shared/   tests/
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

// File types to scan — JS/JSX source. (eslint.config.js's own rule toggles are
// config, not inline suppression debt — those are out of scope by design.)
const SCAN_EXT = /\.(?:js|jsx|mjs|cjs)$/;

// ── Required scope ────────────────────────────────────────────────────────
function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx suppression-debt.ts <scope>",
      "  e.g.: src/   src/lessons/bloom-filters/   src/shared/   tests/",
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

// ── Suppression patterns (the deterministic signal) ───────────────────────
type SuppressionKind = "disable-next-line" | "disable-line" | "disable-block";

interface SuppressionPattern {
  kind: SuppressionKind;
  pattern: RegExp;
  label: string;
}

// Patterns are scanned per-line; the agent verifies in context. Order matters
// for labelling only — a single line matches exactly one kind because the
// block pattern uses a negative lookahead to exclude the two `-line` variants.
const SUPPRESSION_PATTERNS: SuppressionPattern[] = [
  {
    kind: "disable-next-line",
    pattern: /eslint-disable-next-line/g,
    label: "`eslint-disable-next-line` — suppresses the lint on the FOLLOWING line",
  },
  {
    kind: "disable-line",
    pattern: /eslint-disable-line/g,
    label: "`eslint-disable-line` — suppresses the lint on THIS line",
  },
  {
    // `/* eslint-disable */` (and `/* eslint-disable rule */`) — the block/file
    // form. The negative lookahead keeps it from also matching the `-line`
    // variants above (so each line is counted once).
    kind: "disable-block",
    pattern: /eslint-disable(?!-)/g,
    label: "`eslint-disable` block/file-level — suppresses until `eslint-enable` (or end of file); the WIDEST blast radius",
  },
];

interface Finding {
  file: string; // relative
  line: number;
  kind: SuppressionKind;
  label: string;
  snippet: string;
}

function checkSuppressions(files: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const fileRel = relative(APP_ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Trim, bound snippet for the agent's input
      const snippet = line.trim().slice(0, 140);
      for (const { kind, pattern, label } of SUPPRESSION_PATTERNS) {
        // Reset lastIndex since we reuse the regex across lines
        pattern.lastIndex = 0;
        if (pattern.test(line)) {
          findings.push({ file: fileRel, line: i + 1, kind, label, snippet });
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

ESLint suppressions detected: NONE — no \`eslint-disable\` / \`eslint-disable-line\` / \`eslint-disable-next-line\` directives found in the scope.

This is the clean-scan case. Per the system prompt: sample at most 2-3 files briefly to confirm the regex didn't miss something subtle, then output the default clean map. A bucket (1) finding requires a quoted directive from your actual Read — no quote means no finding. Do not reach for findings to fill the buckets.`;
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
          .map((f) => `  - line ${f.line} · [${f.kind}] · ${f.label}\n      ${f.snippet}`)
          .join("\n")}`,
    )
    .join("\n\n");

  return `Files in scope (${files.length}):
${fileList}

ESLint suppressions detected (${findings.length}) — scanned by the harness, NOT yet verified:
${grouped}

For EACH suppression, Read the surrounding context: which rule(s) it disables, the line it guards, and whether a justifying comment is present. Some are removable (the code can satisfy the rule properly, or the suppression is stale); others are legitimately needed. Classify each into ONE of the three buckets per the system prompt.`;
}

// ── Agent's job (quality bar lives here) ──────────────────────────────────
function systemPrompt(scope: string): string {
  return `You are the suppression-debt mapper for the Glassbox repository (React 19 + Vite + JavaScript). The static safety net here is ESLint; the escape hatches are inline \`eslint-disable\` directives — the JS analog of TypeScript's \`@ts-ignore\`. The harness has scanned \`${scope}\` for them and given you a candidate list. Your job: turn it into a curated map of suppressions worth removing.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human removes the suppressions they agree are worth removing.

A suppression with NO rule name (a bare \`// eslint-disable-next-line\`, or a file-level \`/* eslint-disable */\`) disables EVERY rule for its scope — the widest blast radius, and the most important to scrutinise. A directive that names specific rules (\`// eslint-disable-next-line react-hooks/exhaustive-deps\`) is narrower.

For EACH candidate, classify it into EXACTLY ONE of three buckets:

(1) REMOVABLE NOW. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT directive as you observed it in your Read, in backticks, with the line number, and NAME the rule(s) it disables (e.g. "line 42 — \`// eslint-disable-next-line no-unused-vars\` — silences \`no-unused-vars\` on the \`_evt\` parameter"). No quote pasted from a Read = no finding. This is a hard binary: cite or omit.
    (b) WHY removing it is safe / better (concrete: the lint can be satisfied properly, OR the suppression is STALE — the code it guarded changed and the rule no longer fires, so the directive is dead weight that will mask a FUTURE violation),
    (c) ACTION — the concrete fix that makes the suppression unnecessary (e.g. "prefix the unused arg with \`_\` so the configured \`argsIgnorePattern\` covers it, then delete the directive" / "delete the directive — the \`console.log\` it guarded is already gone" / "add the missing dep to the \`useEffect\` array and delete the \`exhaustive-deps\` disable"). If you cannot name a concrete fix — it does NOT belong here. Move to (2) or (3).

(2) LEGITIMATELY NEEDED — verified. State the SPECIFIC rule and the SPECIFIC reason the suppression is the right call:
    - A genuine ESLint false positive (the rule is wrong for this construct) — name the rule and why it misfires,
    - An intentional, documented violation with a nearby justifying comment (quote it) — e.g. a deliberately-empty handler, a knowingly-exhaustive-deps-skipped effect with a comment explaining the omission,
    - A boundary the rule can't reason about (a generated file, a third-party shim).
    Listing what you CONSIDERED and REJECTED matters — it shows your work.

(3) REMOVABLE BUT JUDGMENT-HEAVY. Use sparingly: the suppression masks a real issue but removing it properly is non-trivial — the correct fix is a refactor, changes a component's effect/dependency structure, or needs a design decision. Briefly name the cost so a human can decide.

KNOWN-CONTEXT AWARENESS for this repo:
- \`eslint.config.js\` deliberately turns OFF three rules GLOBALLY (\`react/no-unescaped-entities\`, \`react/jsx-no-comment-textnodes\`, \`no-irregular-whitespace\`) because the lessons are prose-heavy with literal code samples and Unicode math — AGENTS.md says "Do not re-enable." Those are CONFIG toggles, not inline suppressions, and are out of scope here. If you somehow see an INLINE disable of one of those three rules, it is redundant with the config (already off) — bucket (1), action "delete the redundant directive."
- \`no-unused-vars\` is configured with \`argsIgnorePattern: '^_'\` / \`varsIgnorePattern: '^_'\` and set to "warn". An inline disable for an unused var that could instead be \`_\`-prefixed is bucket (1).
- The lesson engines are pure JS and the React layer uses hooks; a real \`react-hooks/exhaustive-deps\` suppression is the classic judgment case — verify whether the missing dep is intentionally stable before deciding (1) vs (3).

WHEN THE HARNESS REPORTS 0 SUPPRESSIONS (clean mechanical scan):
The DEFAULT, EXPECTED output is a clean map (this repo is lint-clean and currently uses no inline disables). Sample at most 2-3 files briefly to confirm the regex didn't miss something subtle, then output:

> ## Removable now (review & remove)
> *(none — 0 ESLint suppressions detected by the scan; brief sample of N files confirmed no inline eslint-disable directives at the spots checked)*

To override this default with a bucket (1) finding, you MUST quote the exact directive you observed in your Read — same citation rule as above. Do NOT pattern-match on what typical suppression debt looks like and reach for plausible-sounding findings to fill the buckets. A confident-sounding inference without a quoted directive is a confabulation; suppress it.

INVESTIGATION SCOPE:
Primary findings are within \`${scope}\` only. If tracing a suppression surfaces compelling related debt in an adjacent file, mention it ONCE as a brief "Out-of-scope observation:" line at the very end of the report (with the file:line + a quoted citation). Do not enumerate adjacent files. The user can re-run with a wider scope if it's worth it.

Hard rules:
- No purity-for-purity's-sake. A suppression that is genuinely needed and documented is bucket (2), not a defect.
- No hypothetical fixes. If the ACTION isn't a clear, concrete change that removes the need for the directive, it's bucket (3), not (1).
- If the same suppression recurs identically many times (same rule, same boilerplate reason), report the PATTERN once with one action covering all sites — don't pad the map.

Output a structured map with exactly these three sections in this order:

## Removable now (review & remove)

(per item — location · WHAT (quoted directive + rule) · WHY removing is safe · ACTION — concrete fix)

## Legitimately needed — verified

(list — finding · rule · reason)

## Removable but judgment-heavy (your call)

(list — finding · cost)

End with a final summary line: "<X> removable · <Y> legitimate · <Z> judgment". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Suppression-debt loop — scope: ${scope}\n`);

  const files = gatherSources(scope);
  if (files.length === 0) {
    report([
      `Scope:               ${scope}`,
      `Files in scope:      0`,
      "",
      "RESULT: PASS — no .js/.jsx/.mjs/.cjs files in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Sweeping ${files.length} file(s) for ESLint suppressions ──`);
  const findings = checkSuppressions(files);
  console.log(`   Suppressions detected: ${findings.length}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, files),
    // Like revisionist's type-debt loop, the clean-scan mode is the toughest
    // reliability case: with no deterministic candidates to verify, sonnet
    // over-indexes on its prior for "what suppression debt looks like" and
    // confabulates. Opus stays grounded in what it actually Read.
    model: "opus",
  });

  report([
    `Scope:                 ${scope}`,
    `Files in scope:        ${files.length}`,
    `Suppressions detected: ${findings.length}`,
    `Agent run:             ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Removable section and remove the suppressions you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
