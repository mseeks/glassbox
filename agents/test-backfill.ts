/**
 * Test-backfill loop — Many Hands Engineering, loop #4.
 *
 * A READ-ONLY mapper of HIGH-VALUE missing tests. The harness runs `npx vitest run
 * --coverage` for the deterministic signal + computes per-file churn from `git log`,
 * filters to the requested scope, and hands a prioritized candidate list to the agent.
 * The agent (Read / Grep / Glob only) classifies each into three buckets and proposes
 * test cases in plain English — with a strict articulate-the-value quality bar that
 * avoids the coverage-chasing antipattern. It writes NOTHING. You write the tests.
 *
 * Usage: tsx test-backfill.ts <scope>    (scope REQUIRED — one area at a time)
 *   e.g.: src/lessons/bloom-filters/engine/   src/lessons/trie/engine/
 *
 * NOTE: interactive-lessons gates coverage on the pure engines only
 * (`src/lessons/*​/engine/**` per vite.config.js) — the React/CSS layer is
 * covered by the Playwright smoke, not line coverage. So the coverage signal,
 * and the useful scopes for this loop, are the per-lesson engines.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"]; // read-only — no way to change anything

// ── Required scope ────────────────────────────────────────────────────────
function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx test-backfill.ts <scope>",
      "  e.g.: src/lessons/bloom-filters/engine/   src/lessons/trie/engine/",
      "  (coverage is gated on the engines; the React/CSS layer is Playwright-smoke-covered, not line-covered)",
      "",
      "(Scoping each run keeps the agent's work bounded and the map small enough to actually act on.)",
    ]);
    process.exit(1);
  }
  if (!existsSync(resolve(APP_ROOT, scope))) {
    report([`RESULT: CANNOT RUN — scope path '${scope}' does not exist relative to the repo root.`]);
    process.exit(1);
  }
  return scope;
}

// ── Coverage signal (the deterministic baseline) ──────────────────────────
interface FileCoverage {
  path: string;
  statementMap: Record<string, unknown>;
  fnMap: Record<
    string,
    { name: string; decl?: { start?: { line: number } }; loc?: { start?: { line: number } } }
  >;
  s: Record<string, number>;
  f: Record<string, number>;
}
type CoverageData = Record<string, FileCoverage>;

function runCoverage(): CoverageData {
  console.log("── Running vitest with coverage (deterministic signal) ──\n");
  try {
    execFileSync(
      "npx",
      ["vitest", "run", "--coverage", "--coverage.reporter=json"],
      { cwd: APP_ROOT, stdio: "inherit" },
    );
  } catch {
    // vitest exits non-zero on a failing suite; the coverage JSON is still written.
  }
  const covPath = resolve(APP_ROOT, "coverage/coverage-final.json");
  if (!existsSync(covPath)) {
    report(["RESULT: CANNOT RUN — coverage data was not produced (vitest may have errored before writing it)."]);
    process.exit(1);
  }
  return JSON.parse(readFileSync(covPath, "utf8")) as CoverageData;
}

// ── Churn (the priority dimension) ────────────────────────────────────────
function gatherChurn(scope: string): Map<string, number> {
  const churn = new Map<string, number>();
  try {
    const out = execFileSync(
      "git",
      ["log", "--since=90 days ago", "--name-only", "--pretty=format:", "--", scope],
      { cwd: APP_ROOT, encoding: "utf8" },
    );
    for (const line of out.split("\n")) {
      const file = line.trim();
      if (file) churn.set(file, (churn.get(file) ?? 0) + 1);
    }
  } catch {
    // empty churn = no priority boost; harmless
  }
  return churn;
}

// ── Build prioritized candidate list ──────────────────────────────────────
interface Candidate {
  file: string;
  uncoveredFunctions: { name: string; line: number }[];
  uncoveredStmts: number;
  totalStmts: number;
  churn: number;
  priority: number;
}

interface Analysis {
  candidates: Candidate[];
  baseline: { fnPct: number; stmtPct: number; totalFiles: number };
}

function analyze(cov: CoverageData, churn: Map<string, number>, scope: string): Analysis {
  const scopeAbs = resolve(APP_ROOT, scope);
  let totalFns = 0;
  let coveredFns = 0;
  let totalStmts = 0;
  let coveredStmts = 0;
  let totalFiles = 0;
  const candidates: Candidate[] = [];

  for (const [absPath, fd] of Object.entries(cov)) {
    if (absPath !== scopeAbs && !absPath.startsWith(scopeAbs + "/")) continue;
    totalFiles++;

    const fs = Object.values(fd.f);
    const ss = Object.values(fd.s);
    totalFns += fs.length;
    coveredFns += fs.filter((c) => c > 0).length;
    totalStmts += ss.length;
    coveredStmts += ss.filter((c) => c > 0).length;

    const uncoveredFunctions: { name: string; line: number }[] = [];
    for (const [id, fn] of Object.entries(fd.fnMap)) {
      if ((fd.f[id] ?? 0) === 0) {
        const line = fn.decl?.start?.line ?? fn.loc?.start?.line ?? 0;
        uncoveredFunctions.push({ name: fn.name || "(anonymous)", line });
      }
    }
    const uncoveredStmts = ss.filter((c) => c === 0).length;
    if (uncoveredFunctions.length === 0 && uncoveredStmts === 0) continue;

    const rel = absPath.replace(APP_ROOT + "/", "");
    const c = churn.get(rel) ?? 0;
    candidates.push({
      file: rel,
      uncoveredFunctions,
      uncoveredStmts,
      totalStmts: ss.length,
      churn: c,
      priority: (uncoveredFunctions.length + uncoveredStmts) * (c + 1),
    });
  }
  candidates.sort((a, b) => b.priority - a.priority);

  const pct = (n: number, d: number) => (d === 0 ? 100 : Math.round((n / d) * 100));
  return {
    candidates,
    baseline: {
      fnPct: pct(coveredFns, totalFns),
      stmtPct: pct(coveredStmts, totalStmts),
      totalFiles,
    },
  };
}

function formatCandidatesForAgent(candidates: Candidate[]): string {
  return candidates
    .map((c) => {
      const fnList = c.uncoveredFunctions
        .map((f) => `    - ${f.name} (line ${f.line})`)
        .join("\n");
      return `- ${c.file}  [churn: ${c.churn} commits / 90d · uncovered: ${c.uncoveredFunctions.length} fn, ${c.uncoveredStmts}/${c.totalStmts} stmt]
${fnList || "    (no named-function gaps; statement-level only)"}`;
    })
    .join("\n");
}

// ── The agent's job (the quality bar IS this prompt) ──────────────────────
function systemPrompt(scope: string): string {
  return `You are the test-backfill mapper for the Interactive Lessons repository (a React 19 + Vite + JavaScript app — thirteen self-contained lessons, each with a pure \`engine/index.js\` that is the unit-tested layer). The harness has run vitest with coverage and given you a prioritized list of uncovered functions in \`${scope}\` (with per-file churn). Your job: turn this into a curated map of HIGH-VALUE missing tests + plain-English descriptions of exactly what to test.

The engines are pure functions (no React / no DOM), so most worthwhile tests need NO mocking — call the function, assert the output. A React component or CSS gap is NOT a coverage target here (that layer is covered by the Playwright smoke); if the only "gap" is render/markup, it is a SKIP.

Your only tools are Read / Grep / Glob — you can investigate the code but you CANNOT write tests or modify anything. The human will write the tests they agree are worth it.

For EACH candidate, Read the function and classify it into EXACTLY ONE of three buckets. The quality bar is hard:

(1) WORTH TESTING. Include ONLY when you can answer BOTH in one sentence each:
    (a) what specific behavior the proposed test(s) verify — quote the actual function signature (or branch condition) as you Read it, in backticks. No quoted signature = no proposal. Proposing tests for a function you haven't Read is by definition confabulation; suppress it.
    (b) why that behavior matters to a user or another caller.
    Then propose 1–4 concrete cases (positive, negative, edge). Use plain English; no code snippets.
    If you cannot answer (a) AND (b) cleanly — MOVE TO (2). Do not stretch.

(2) SKIP — not worth testing. State the specific reason: trivial getter / static markup / framework boilerplate / wrapper where the mock would dominate the test / pure delegation / one-off / etc.
    Listing what was CONSIDERED and REJECTED matters — it shows your work.

(3) WORTH TESTING BUT HARD. Use sparingly: the test value is real but the cost (mocking surface, integration setup) is high enough that a human should weigh whether to invest. Briefly name the cost.

Hard rule: do NOT propose a test just to fill coverage. If you cannot articulate clear value, skip.

Output a structured map with exactly these three sections in this order:

## Worth testing (review & write)

(per item — file → function · what behavior is verified · why it matters · 1–4 specific cases in plain English)

## Skip — not worth testing (and why)

(list — location · specific reason)

## Worth testing but hard (your call)

(list — location · the cost)

End with a final summary line: "<X> proposed · <Y> skipped · <Z> hard". Nothing else after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Test-backfill loop — scope: ${scope}\n`);

  const cov = runCoverage();
  const churn = gatherChurn(scope);
  const { candidates, baseline } = analyze(cov, churn, scope);

  console.log(
    `\n── Signal ready: ${baseline.totalFiles} file(s) measured in ${scope} · ` +
      `${baseline.stmtPct}% stmt · ${baseline.fnPct}% fn covered · ` +
      `${candidates.length} with gaps ──\n`,
  );

  if (candidates.length === 0) {
    report([
      `Scope:              ${scope}`,
      `Files measured:     ${baseline.totalFiles}`,
      `Coverage in scope:  ${baseline.stmtPct}% stmt · ${baseline.fnPct}% fn`,
      `Files with gaps:    0`,
      "",
      `RESULT: PASS — ${scope} is fully covered. No proposals.`,
    ]);
    return;
  }

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: `Prioritized candidates in \`${scope}\`:

${formatCandidatesForAgent(candidates)}

Classify each per your instructions and produce the map.`,
  });

  report([
    `Scope:              ${scope}`,
    `Files measured:     ${baseline.totalFiles}`,
    `Coverage in scope:  ${baseline.stmtPct}% stmt · ${baseline.fnPct}% fn`,
    `Files with gaps:    ${candidates.length}`,
    `Agent run:          ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Worth-testing section and write the tests you find valuable.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
