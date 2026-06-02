/**
 * Dead-code loop — Many Hands Engineering, loop #3.
 *
 * A READ-ONLY cold-region mapper. The harness runs `knip` (a deterministic static
 * analyzer) for the raw candidate list — the same kind of tool-signal the dep loops
 * get from `npm outdated` / `npm audit`. The agent then VERIFIES and reasons on top:
 * it rules out framework / command / transitive false positives, confirms the genuine
 * ones, and emits a map with per-item caveats. It changes NOTHING — its only tools are
 * Read / Grep / Glob. You do the actual deletions.
 *
 * Usage: tsx dead-code.ts [scope]   (scope optional: a path to focus the map on)
 */
import { execFileSync } from "node:child_process";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"]; // read-only — no way to change anything

function systemPrompt(scope?: string): string {
  return `You are the dead-code verifier for the Interactive Lessons repository (a React 19 + Vite + JavaScript app — thirteen self-contained lessons under \`src/lessons/<slug>/\`). You turn knip's raw static-analysis output into a trustworthy, human-actionable cold-region map. You do NOT delete anything — your only tools are Read / Grep / Glob — you produce candidates for a human to act on.

You are given knip's raw findings. knip is accurate at import-graph analysis but blind in spots, so VERIFY each candidate with Read/Grep/Glob before trusting it. Rule OUT these common false positives (check, then exclude with a one-line reason):
- a devDependency used via a COMMAND / config, not an import — e.g. \`@playwright/test\` by the e2e suite, \`eslint\` + its plugins by \`eslint.config.js\`, \`prettier\` by \`format\`, \`jsdom\` / \`@testing-library/*\` / \`@vitest/coverage-v8\` wired through \`vite.config.js\` + \`tests/setup.js\`, \`vite\` / \`@vitejs/plugin-react\` by the build.
- a lesson reached only via the lazy dynamic import in \`src/lesson-catalog.js\` (\`import(\\\`./lessons/\\\${id}/index.js\\\`)\`) — the template literal can't be statically resolved, so a \`src/lessons/<slug>/index.js\` (or anything it pulls in) flagged "unused" is almost certainly a false positive. knip.json lists those as entries, but verify the lesson is in \`lessonMeta\` before trusting any "unused file" hit under \`src/lessons/\`.
- a CSS file imported for its side effects (\`import './foo.css'\`) — knip may not trace these; grep for the import.
- anything reachable via a dynamic \`import()\`, a runtime string, or an external / public consumer.

For each candidate that survives your checks as GENUINELY dead, record: location (file → symbol) · kind (unused file / export / dependency) · evidence · a one-line caveat naming what a human should double-check before deleting.

EVIDENCE MUST BE CONCRETE. State the exact Grep pattern / Glob you ran and what it returned (e.g. "Grep across \`tests/**\` for \`test-helpers\` — 0 matches; only hit was a directory listing in \`tests/README.md\`"). "I checked and it's not used" is NOT evidence — no audit trail, no candidate. If you have only a feeling, move it to "Ruled out" with the reason "could not verify."${
    scope ? `\n\nFocus the map on candidates under \`${scope}\` (you may note others briefly).` : ""
  }

Output two short sections: "Likely dead (review & delete)" and "Ruled out (knip false positives)" — so the human sees your reasoning either way. Make ZERO changes to the repo.`;
}

/** Deterministic candidate list. knip exits non-zero when it finds issues. */
function runKnip(): string {
  try {
    return execFileSync("npx", ["knip"], {
      cwd: APP_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  } catch (err) {
    return ((err as { stdout?: string }).stdout ?? "").trim();
  }
}

async function main(): Promise<void> {
  const scope = process.argv[2];
  console.log(`Dead-code loop — running knip${scope ? ` (focus: ${scope})` : ""}…\n`);

  const knip = runKnip();
  if (!knip) {
    report(["RESULT: knip produced no findings (or didn't run). Nothing to map."]);
    return;
  }
  console.log(`knip's raw findings:\n\n${knip}\n\n── agent is verifying (read-only) ──`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: `knip's raw findings:\n\n${knip}\n\nVerify each and produce the cold-region map.`,
  });

  report([
    `Agent run: ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced)",
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
