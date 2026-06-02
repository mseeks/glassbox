/**
 * Console-runtime loop — Many Hands Engineering, loop #10.
 *
 * A READ-ONLY mapper of console warnings/errors emitted DURING the test run. The
 * harness runs `vitest run --reporter=verbose`, captures the per-test `stderr |
 * <file> > <test>` emissions vitest prints when code calls `console.warn` /
 * `console.error`, filters them to the scope, and hands each to the agent. The
 * agent (Read / Grep / Glob only) Reads both the test file and the suspected
 * source to trace each emission to its origin, then emits a strict three-bucket
 * map under a hard paired-citation rule.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 * You fix the source-side calls you choose.
 *
 * Usage: tsx console-runtime.ts <scope>     (scope REQUIRED — file or dir of tests)
 *   e.g.: tests/   tests/index-page.test.jsx
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"];

// ── Required scope ────────────────────────────────────────────────────────
function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx console-runtime.ts <scope>",
      "  e.g.: tests/   tests/index-page.test.jsx   (the jsdom component suites are where emissions come from)",
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

// ── Deterministic signal: run vitest, capture the verbose output ───────────
/** Strip ANSI escape codes so the parser sees plain text. */
function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1B\[[0-9;]*[A-Za-z]/g, "");
}

/**
 * Run `vitest run --reporter=verbose` and return its combined output (stdout +
 * stderr). vitest prints the `stderr | <file> > <test>` console-capture markers
 * to stderr and exits non-zero when tests fail — so we use spawnSync, which
 * captures BOTH streams regardless of exit code (execFileSync would drop stderr
 * on a passing run, losing every emission).
 */
function runVitestCapture(): string {
  const r = spawnSync("npx", ["vitest", "run", "--reporter=verbose"], {
    cwd: APP_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return stripAnsi((r.stdout ?? "") + "\n" + (r.stderr ?? ""));
}

// ── Parse per-test emissions from the verbose reporter ─────────────────────
interface Emission {
  testFile: string; // path relative to the repo root, as vitest prints it
  testPath: string; // "suite > test name"
  body: string;
}

// vitest verbose prints `stderr | <file> > <suite > test>` then the emitted text.
const MARKER_RE = /^(stdout|stderr) \| (.+?) > (.+)$/;
// Lines that end an emission body (test tree / summary output).
const BOUNDARY_RE = /^\s*(?:[✓✗×❯·]|Test Files\b|Tests\b|Duration\b|Start at\b|RERUN\b|RUN\b|PASS\b|FAIL\b)/;

function parseEmissions(raw: string): Emission[] {
  const lines = raw.split("\n");
  const emissions: Emission[] = [];
  let current: { stream: string; testFile: string; testPath: string; body: string[] } | null = null;

  const flush = () => {
    if (current && current.stream === "stderr") {
      emissions.push({
        testFile: current.testFile,
        testPath: current.testPath,
        body: current.body.join("\n").trim().slice(0, 400),
      });
    }
    current = null;
  };

  for (const line of lines) {
    const m = line.match(MARKER_RE);
    if (m) {
      flush();
      current = { stream: m[1], testFile: m[2].trim(), testPath: m[3].trim(), body: [] };
      continue;
    }
    if (current) {
      if (BOUNDARY_RE.test(line)) {
        flush();
      } else {
        current.body.push(line);
      }
    }
  }
  flush();
  return emissions;
}

/** Keep emissions whose test file is inside the scope. */
function filterToScope(emissions: Emission[], scope: string): Emission[] {
  // A scope matches a test file when it IS the file, or is a directory prefix of
  // it. The trailing "/" is required so scope "tests/unit" can't match a sibling
  // like "tests/unittest/…".
  const norm = scope.replace(/\/+$/, "");
  return emissions.filter((e) => e.testFile === norm || e.testFile.startsWith(norm + "/"));
}

function formatForAgent(emissions: Emission[], scope: string): string {
  if (emissions.length === 0) {
    return `Scope: ${scope}

Emissions captured: NONE — the vitest run produced no \`console.warn\` / \`console.error\` output from test files in this scope.

This is the clean-scan case. Per the system prompt: optionally sample 1-2 test files in scope to confirm nothing is being suppressed, then output the default clean map. A bucket (1) finding requires BOTH a quoted emission body AND a quoted source line from your actual Reads — without both, no finding. Do not invent emissions.`;
  }

  const grouped = emissions
    .map(
      (e, i) =>
        `[${i + 1}] ${e.testFile} > ${e.testPath}\n      ${e.body.replace(/\n/g, "\n      ")}`,
    )
    .join("\n\n");

  return `Scope: ${scope}

Emissions captured during the vitest run (${emissions.length}) — stderr (console.warn / console.error) per test, NOT yet traced:
${grouped}

For EACH emission, Read the named test file to understand what it exercises, then trace the warning to the SOURCE line that emits it (Grep the message text across the app). Decide whether the production code is causing a real warning, the test is deliberately asserting against it, the warning is a jsdom / @testing-library/react test-environment artifact (an \`act(...)\` notice, a jsdom "Not implemented" line, or the \`tests/setup.js\` matchMedia stub), or it's forgotten debug noise. Classify each into ONE of the three buckets per the system prompt.`;
}

// ── Agent's job (quality bar lives here) ──────────────────────────────────
function systemPrompt(scope: string): string {
  return `You are the console-runtime mapper for the Glassbox repository (React 19 + Vite + JavaScript). The harness ran \`vitest run --reporter=verbose\`, captured the \`console.warn\` / \`console.error\` emissions each test produced, and filtered them to \`${scope}\`. Your job: trace each emission to its origin and turn the list into a curated map.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human fixes the source-side calls they agree are worth it.

For EACH emission, classify it into EXACTLY ONE of three buckets:

(1) ACTION NOW — a real warning the production code is causing. Include ONLY when you can answer all THREE:
    (a) WHAT — a PAIRED citation: quote the emission body AND quote the source line that emits it, with file:line (e.g. "\`Warning: Each child in a list should have a unique \"key\" prop\` from \`src/lessons/foo/components/Bar.jsx:42\`"). Both quotes must come from your actual Reads. No paired quote = no finding. This is a hard binary: cite or omit.
    (b) WHY it matters (the concrete real-world impact — a React warning often names a missing \`key\`, a hook-rules violation, a state-update-after-unmount, or a prop-type bug; a library warning a deprecation the code should migrate off),
    (c) ACTION — name the SOURCE file:line to change (not just the warning).
      If you cannot trace it to a concrete source line — it does NOT belong here. Move to (2) or (3).

(2) INTENTIONAL / VERIFIED — testing the warning path or harness setup. State the SPECIFIC reason, quoting the test code or the harness origin:
    - The test is deliberately exercising a warn/error path and asserting against it (e.g. \`expect(console.warn).toHaveBeenCalledWith('…')\` or a \`vi.spyOn(console, 'warn')\`) — the emission is the assertion target,
    - The emission is a jsdom "Not implemented" notice or a React \`act(...)\` / test-environment warning from \`@testing-library/react\`, not user code — verify by Reading the test file to confirm it isn't asserting against it,
    - A lesson engine's intentional input-guard \`console.warn\` (e.g. cuckoo-filter's power-of-two guard) firing because a test feeds it invalid input on purpose — intentional; the test asserts the guarded behaviour.
    Listing what you CONSIDERED and REJECTED matters — it shows your work.

(3) FORGOTTEN LEFTOVER — delete the source-side call. The emission body is debug noise the production code shouldn't print during normal operation. Name the SOURCE file:line of the \`console.warn\` / \`console.error\` to delete. (This rarely overlaps debug-cruft, which finds calls by static regex; here the entry point is different — the call actually fired during a test run.)

KNOWN-CONTEXT AWARENESS for this repo:
- \`tests/e2e/\` runs under Playwright, NOT vitest (\`vite.config.js\` excludes \`tests/e2e/**\`) — it won't appear in this output, and you should not look for it here.
- Component suites opt into jsdom (\`// @vitest-environment jsdom\`) and render via \`@testing-library/react\`. jsdom emits "Not implemented" notices for unsupported APIs and React can emit \`act(...)\` / hydration warnings — usually test-environment artifacts, not production bugs: bucket (2), verified by Reading the test file.
- \`tests/setup.js\` stubs \`window.matchMedia\` (jsdom doesn't implement it, and \`usePrefersReducedMotion\` calls it) — warnings tied to that stub are harness setup, bucket (2).
- The pure engine suites run in the node environment and rarely emit anything; an engine's deliberate input-guard \`console.warn\` (e.g. cuckoo-filter) hit by a test feeding invalid input is bucket (2).

WHEN THE HARNESS REPORTS 0 EMISSIONS (clean run):
The DEFAULT, EXPECTED output is a clean map. Optionally sample 1-2 test files in scope, then output:

> ## Action now (review & fix)
> *(none — 0 console emissions captured from tests in scope; the run was quiet)*

To override this default with a bucket (1) finding, you MUST provide the paired citation (emission body + source line) from your actual Reads. Do NOT pattern-match on what typical warnings look like and invent findings. A confident-sounding inference without both quotes is a confabulation; suppress it.

INVESTIGATION SCOPE:
Primary findings are within \`${scope}\` only. If tracing an emission surfaces a compelling related issue in an adjacent file, mention it ONCE as a brief "Out-of-scope observation:" line at the very end of the report (with the file:line + a quoted citation). Do not enumerate adjacent files.

Hard rules:
- No purity-for-purity's-sake. A warning the test deliberately asserts against is fine — bucket (2).
- No hypothetical fixes. If you can't name the source file:line, it's not bucket (1) or (3).
- If the same emission fires from many tests via one source line, report that SOURCE line once with one action — don't pad the map per-test.

Output a structured map with exactly these three sections in this order:

## Action now (review & fix)

(per item — testFile:testPath · WHAT — emission body + source line, both quoted · WHY · ACTION — source file:line to fix)

## Intentional / verified — testing the warning path or harness setup

(list — finding · reason quoted from test code or harness origin)

## Forgotten leftover — delete the source-side call

(list — finding · source file:line to delete)

End with a final summary line: "<X> action · <Y> intentional · <Z> forgotten". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Console-runtime loop — scope: ${scope}\n`);

  console.log("── Running vitest with the verbose reporter (deterministic signal) ──");
  const raw = runVitestCapture();
  const allEmissions = parseEmissions(raw);
  const emissions = filterToScope(allEmissions, scope);
  const specFiles = new Set(emissions.map((e) => e.testFile)).size;
  console.log(`   Emissions in scope: ${emissions.length} (from ${specFiles} spec file(s))\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(emissions, scope),
    // sonnet is the default; the emissions are concrete anchors.
  });

  report([
    `Scope:                ${scope}`,
    `Spec files measured:  ${specFiles}`,
    `Emissions captured:   ${emissions.length}`,
    `Agent run:            ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Action and Forgotten sections and fix the source-side calls you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
