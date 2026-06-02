/**
 * Dependency-patch loop — Many Hands Engineering, loop #1.
 *
 * The agent finds patch-level upgrades itself (`npm outdated` + `npm view`) and
 * applies the safe ones (`npm install pkg@ver`). The shared harness (./lib)
 * independently verifies (vitest + eslint + vite build), reverts on red, and
 * always emits a test-style PASS/FAIL — leaving survivors uncommitted for the steward.
 *
 * Usage: tsx dependency-patch.ts [--limit N]
 */
import { argLimit, finalize, manifestClean, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = [
  // read-only tools — free
  "Read",
  "Grep",
  "Glob",
  "WebFetch",
  "WebSearch",
  // bash allowlist. Exact forms match BARE commands; `<cmd> *` forms match args.
  "Bash(npm outdated)",
  "Bash(npm outdated *)",
  "Bash(npm view *)",
  "Bash(npm install)",
  "Bash(npm install *)",
  "Bash(npx vitest run)",
  "Bash(npx vitest run *)",
  "Bash(npx eslint)",
  "Bash(npx eslint *)",
  "Bash(npx vite build)",
  "Bash(npx vite build *)",
];

function systemPrompt(limit: number | null): string {
  return `You are the dependency-patch operator for the Glassbox repository (a React 19 + Vite + JavaScript app). Keep dependencies current and safe, using the test suite as the safety check.

GOAL: find available PATCH-LEVEL upgrades and apply the ones that keep the suite green.

Your tools are already approved: Bash for npm/npx and read-only git, plus Read/Grep/Glob/WebFetch. Do NOT try to change settings, edit permission files, or request additional permissions — just run the commands directly.

Find candidates yourself:
- Run \`npm outdated\` to see what is behind.
- A PATCH upgrade keeps the same major.minor and only raises the patch (e.g. 3.5.16 → 3.5.34, never 3.6.x or 4.x). Use \`npm view <pkg> versions --json\` to find the highest patch within the current major.minor.
- Ignore anything that would cross a minor or major version.${
    limit ? `\n- Process AT MOST ${limit} dependenc${limit === 1 ? "y" : "ies"} this run.` : ""
  }

For each patch candidate, strictly ONE AT A TIME:
1. Apply it with \`npm install <pkg>@<patchVersion>\` (this updates package.json and the lockfile).
2. Run \`npx vitest run\`, then \`npx eslint .\`, then \`npx vite build\`.
3. If ALL THREE pass: keep it (leave it in place). Record it KEPT.
4. If ANY fails: undo ONLY this bump by reinstalling the previous version — \`npm install <pkg>@<oldVersion>\` — and record it REVERTED with the failing check. If the original spec in package.json was an exact pin (no \`^\`/\`~\`), add \`--save-exact\` so the revert restores the pin instead of drifting it to a caret. Do NOT use \`git restore\` (it would wipe the bumps you already kept).

Hard rules:
- NEVER commit, push, tag, or publish. Leave kept bumps as uncommitted working-tree changes.
- Change dependencies only through \`npm install\`. Do not edit source files.
- One dependency at a time, so each result is attributable.

Finish with a short summary table: each dependency as KEPT or REVERTED, with a one-line reason.`;
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
  const limit = argLimit();
  console.log(
    `Dependency-patch loop — the agent will find patch upgrades and apply the safe ones${
      limit ? ` (up to ${limit})` : ""
    }.\n`,
  );
  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(limit),
    allowedTools: ALLOWED_TOOLS,
    prompt: "Find patch-level dependency upgrades and apply the safe ones, per your instructions.",
  });
  finalize({ kind: "patch bump", agentRun, agentSummary });
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
