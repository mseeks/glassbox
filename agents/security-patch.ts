/**
 * Security-patch loop — Many Hands Engineering, loop #2.
 *
 * Same shape as the dependency-patch loop, with a sharper signal (`npm audit`) and
 * one discipline: apply ONLY non-breaking fixes; report breaking / no-fix vulns for
 * the human. The agent runs `npm audit fix` (never `--force` — structurally denied
 * by the allowlist); the shared harness (./lib) verifies the suite stays green and
 * reverts on red, and this file measures the vulnerability count before/after as the
 * security-specific outside reference.
 *
 * Usage: tsx security-patch.ts
 */
import { execFileSync } from "node:child_process";
import { APP_ROOT, finalize, manifestClean, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = [
  // read-only tools — free
  "Read",
  "Grep",
  "Glob",
  "WebFetch",
  "WebSearch",
  // bash allowlist, tightened so the loop can NEVER make a breaking change:
  //   - `npm audit fix` only (exact/bare). The wildcard forms are omitted so
  //     `npm audit fix --force` (which makes breaking changes) is denied by the SDK.
  //   - `npm install` is BARE-only (for revert-resync). `npm install *` is omitted
  //     so the agent cannot install a specific MAJOR version (e.g. `pkg@20`). The
  //     only way it can change dependencies is `npm audit fix`, which never does majors.
  "Bash(npm audit)",
  "Bash(npm audit --json)",
  "Bash(npm audit fix)",
  "Bash(npm view *)",
  "Bash(npm install)",
  "Bash(git restore *)",
  "Bash(npx vitest run)",
  "Bash(npx vitest run *)",
  "Bash(npx eslint)",
  "Bash(npx eslint *)",
  "Bash(npx vite build)",
  "Bash(npx vite build *)",
];

const SYSTEM_PROMPT = `You are the security-patch operator for the Glassbox repository (a React 19 + Vite + JavaScript app). Reduce dependency vulnerabilities, applying ONLY non-breaking fixes and leaning on the test suite as the safety check.

Your tools are already approved: Bash for npm/npx and read-only git, plus Read/Grep/Glob/WebFetch. Do NOT try to change settings or request additional permissions — just run the commands.

1. Run \`npm audit --json\` to see the vulnerabilities. For each, note its severity and its \`fixAvailable\` field: \`true\` (a safe fix exists), \`false\` (no fix), or an object with \`"isSemVerMajor": true\` (the fix is a BREAKING/major bump).
2. Apply the non-breaking fixes by running \`npm audit fix\` — it updates package.json + the lockfile with the safe, non-major fixes. This is the ONLY way to apply fixes here: NEVER run \`npm audit fix --force\` (it makes breaking changes; it is also blocked), and do not \`npm install\` a specific version (also blocked).
3. Verify: run \`npx vitest run\`, then \`npx eslint .\`, then \`npx vite build\`. If ANY fails, the fixes are unsafe — undo them with \`git restore package.json package-lock.json\` then \`npm install\`, and say so. Never leave a red tree.
4. Do NOT apply any fix that requires a MAJOR/breaking bump (\`isSemVerMajor\`) or that has no fix available — instead, LIST those for the human to decide on.

Hard rules:
- NEVER commit, push, tag, publish, or use \`--force\`. Leave applied fixes as uncommitted working-tree changes.
- Change dependencies only through npm. Do not edit source files.

Finish with a summary in two lists: (a) vulnerabilities you RESOLVED, with severity; (b) vulnerabilities that NEED A HUMAN DECISION — breaking-fix or no-fix — with severity and package.`;

/** The security outside reference: vulnerability totals, measured by the harness. */
function auditTotals(): string {
  let out = "";
  try {
    out = execFileSync("npm", ["audit", "--json"], {
      cwd: APP_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (err) {
    // `npm audit` exits non-zero when vulnerabilities exist; the JSON is on stdout.
    out = (err as { stdout?: string }).stdout ?? "";
  }
  try {
    const parsed = JSON.parse(out) as {
      metadata?: { vulnerabilities?: Record<string, number> };
    };
    const v = parsed.metadata?.vulnerabilities ?? {};
    return `${v.total ?? 0} total — ${v.critical ?? 0} critical · ${v.high ?? 0} high · ${v.moderate ?? 0} moderate · ${v.low ?? 0} low`;
  } catch {
    return "(npm audit output unavailable)";
  }
}

async function main(): Promise<void> {
  if (!manifestClean()) {
    report([
      "RESULT: CANNOT RUN — package.json has uncommitted changes.",
      "  Commit or stash them first; the loop reverts dependencies and must not clobber your work.",
    ]);
    process.exitCode = 1;
    return;
  }

  const before = auditTotals();
  console.log(`Security-patch loop — the agent will apply only non-breaking fixes.\nVulnerabilities before: ${before}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: SYSTEM_PROMPT,
    allowedTools: ALLOWED_TOOLS,
    prompt: "Reduce dependency vulnerabilities by applying only non-breaking fixes, per your instructions.",
  });

  const after = auditTotals();
  finalize({
    kind: "security fix",
    agentRun,
    agentSummary,
    preamble: [`Vulnerabilities before: ${before}`, `Vulnerabilities after:  ${after}`],
  });
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
