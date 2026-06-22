/**
 * Shared harness for the Many Hands Engineering loops.
 *
 * Each loop (dependency-patch, security-patch, …) is just a *signal/action prompt*
 * + a *Bash allowlist* + a *finalize*. Everything identical lives here:
 *   - auth (Claude Code OAuth, never an API key)
 *   - the standard, locked-down query() invocation (`dontAsk` + allowlist)
 *   - the outside reference (vitest + eslint + vite build) and the revert
 *   - the always-on, test-style PASS/FAIL report
 *
 * Permission model is entirely SDK-native: `permissionMode: 'dontAsk'` denies
 * anything not in the loop's allowlist (no callback, no hand-rolled blocking), and
 * the SDK splits compound commands so an allowed prefix can't smuggle a denied one.
 */
import { query, type EffortLevel } from "@anthropic-ai/claude-agent-sdk";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url)); // the agents/ package dir
export const APP_ROOT = resolve(HERE, ".."); // the Glassbox app repo

/** `--limit N` or `--limit=N`, if present. */
export function argLimit(): number | null {
  const a = process.argv;
  const i = a.findIndex((x) => x === "--limit" || x.startsWith("--limit="));
  if (i === -1) return null;
  const raw = a[i].includes("=") ? a[i].split("=")[1] : a[i + 1];
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ── Auth: Claude Code OAuth, never an API key ──────────────────────────────
/**
 * Load any KEY=VALUE pairs from `envFile` into process.env (without clobbering
 * existing values). Returns true if the file existed and was read.
 */
function loadEnvFile(envFile: string): boolean {
  if (!existsSync(envFile)) return false;
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return true;
}

function resolveOAuthToken(): string {
  if (!process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    // 1) Local agents/.env, right next to lib.ts.
    loadEnvFile(resolve(HERE, ".env"));
    // 2) Fallback: walk up the tree for an inherited `agents/.env`. This lets a
    //    git worktree (created under `.claude/worktrees/<name>/`) reuse the
    //    main checkout's token instead of re-staging it on every spin-up. We
    //    only walk far enough to hit the parent worktree's `agents/` dir, then
    //    stop at the filesystem root.
    let dir = resolve(HERE, "..", "..");
    while (!process.env.CLAUDE_CODE_OAUTH_TOKEN) {
      if (loadEnvFile(resolve(dir, "agents", ".env"))) {
        if (process.env.CLAUDE_CODE_OAUTH_TOKEN) break;
      }
      const parent = resolve(dir, "..");
      if (parent === dir) break; // hit the root
      dir = parent;
    }
  }
  const token = process.env.CLAUDE_CODE_OAUTH_TOKEN;
  if (!token) {
    console.error(
      "RESULT: CANNOT RUN — CLAUDE_CODE_OAUTH_TOKEN is not set.\n" +
        "  Run `claude setup-token`, then put the token in agents/.env (see .env.example).\n" +
        "  In a git worktree under `.claude/worktrees/`, the token is inherited from the\n" +
        "  parent checkout's agents/.env automatically — set it once there.",
    );
    process.exit(1);
  }
  return token;
}

/** A curated env that forces subscription OAuth and strips any API key. */
function loopEnv(token: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && k !== "ANTHROPIC_API_KEY") env[k] = v;
  }
  env.CLAUDE_CODE_OAUTH_TOKEN = token;
  return env;
}

// ── Outside reference (the harness, not the agent's say-so) ─────────────────
export function manifestClean(): boolean {
  // package.json is the meaningful manifest; package-lock.json churns cosmetically
  // on every `npm install`, which shouldn't block a run.
  const dirty = execFileSync("git", ["status", "--porcelain", "package.json"], {
    cwd: APP_ROOT,
    encoding: "utf8",
  }).trim();
  return dirty === "";
}

function packageJsonDiff(): string {
  return execFileSync("git", ["diff", "package.json"], { cwd: APP_ROOT, encoding: "utf8" }).trim();
}

/** A version spec with any range prefix (^ ~ >= <= = and whitespace) stripped. */
function bareVersion(spec: string): string {
  return spec.replace(/^[\^~>=<\s]*/, "").trim();
}

/**
 * Did any dependency's actual version NUMBER change vs the committed package.json?
 * This is the harness's real outside reference for "were bumps kept" — it ignores
 * spec-only drift (e.g. a reverted bump leaving `3.19.1` → `^3.19.1`, which
 * `npm install pkg@ver` introduces by rewriting the range to a caret). Such drift
 * is an install artifact, not a real upgrade, and must not be reported as kept.
 */
function hasRealVersionChange(): boolean {
  let headRaw: string;
  try {
    // `HEAD:./package.json` is CWD-relative (the `./` matters). This app lives in a
    // subdirectory of a larger git repo, so the bare `HEAD:package.json` form —
    // which resolves against the repo ROOT — would not find it. The `./` form works
    // whether APP_ROOT is the repo root or a subdirectory.
    headRaw = execFileSync("git", ["show", "HEAD:./package.json"], { cwd: APP_ROOT, encoding: "utf8" });
  } catch {
    return true; // can't read the committed baseline — be conservative, treat the diff as real
  }
  const head = JSON.parse(headRaw) as Record<string, unknown>;
  const curr = JSON.parse(readFileSync(resolve(APP_ROOT, "package.json"), "utf8")) as Record<string, unknown>;
  const depsOf = (pkg: Record<string, unknown>, sec: string): Record<string, string> => {
    const d = pkg[sec];
    return d && typeof d === "object" ? (d as Record<string, string>) : {};
  };
  for (const sec of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    const h = depsOf(head, sec);
    const c = depsOf(curr, sec);
    for (const name of new Set([...Object.keys(h), ...Object.keys(c)])) {
      if (bareVersion(h[name] ?? "") !== bareVersion(c[name] ?? "")) return true;
    }
  }
  return false;
}

function suiteGreen(): boolean {
  const run = (cmd: string, args: string[]): boolean => {
    try {
      execFileSync(cmd, args, { cwd: APP_ROOT, stdio: "inherit" });
      return true;
    } catch {
      return false;
    }
  };
  // glassbox is pure JS, so the standing static gates are
  // ESLint (the project's lint) and a real `vite build` (catches module-resolution
  // / transform breakage a dep bump can introduce, the nearest thing to a compile).
  // Style-only `prettier --check` is deliberately excluded — a dep bump can't
  // change our source formatting, and a stray unformatted file shouldn't revert a
  // good bump.
  console.log("\n── Independent verification (harness): vitest + eslint + vite build ──");
  const vitest = run("npx", ["vitest", "run"]);
  const lint = run("npx", ["eslint", "."]);
  const build = run("npx", ["vite", "build"]);
  console.log(
    `   vitest: ${vitest ? "PASS" : "FAIL"} · eslint: ${lint ? "PASS" : "FAIL"} · build: ${build ? "PASS" : "FAIL"}`,
  );
  return vitest && lint && build;
}

function revertAll(): void {
  execFileSync("git", ["restore", "package.json", "package-lock.json"], { cwd: APP_ROOT });
  execFileSync("npm", ["install"], { cwd: APP_ROOT, stdio: "inherit" });
}

// ── Report (always emitted, test-style) ─────────────────────────────────────
export function report(lines: string[]): void {
  console.log("\n" + "═".repeat(64));
  for (const l of lines) console.log(l);
}

/** Pluralize a kind label for the report ("security fix" → "security fixes"). */
function plural(kind: string): string {
  return kind + (/(?:s|x|z|ch|sh)$/.test(kind) ? "es" : "s");
}

// ── The agent run: the standard locked-down query() ─────────────────────────
export async function runLoop(opts: {
  systemPrompt: string;
  allowedTools: string[];
  prompt: string;
  /**
   * Per-loop model override. Default `"sonnet"` is the sweet spot for most loops.
   * Bump to `"opus"` for loops where false-positive judgment is expensive (e.g.
   * the read-only mappers when the deterministic signal is clean — sonnet's
   * pattern-matching priors can override fresh observation in that mode).
   */
  model?: "sonnet" | "opus" | "haiku";
  /**
   * Reasoning-effort level (SDK-native). Omitted by default (the model's own
   * default applies). Set `"max"` for loops that need the deepest reasoning the
   * model can give — e.g. the content-accuracy pass, where a missed inaccuracy
   * is worse than spent tokens. Silently downgraded by the SDK on models that
   * don't support the requested level.
   */
  effort?: EffortLevel;
  /**
   * Prefix for the live tool-use stream (e.g. a lesson id). Loops that fan out
   * MANY agents in parallel set this so the interleaved `· ToolName` markers on
   * one stdout stay attributable to their agent. Omitted → the plain `  · ` form.
   */
  label?: string;
  /** Override the default turn cap (250). Higher for deep, many-file reads. */
  maxTurns?: number;
  /** Override the default per-run USD budget ($3). Higher for heavy loops. */
  maxBudgetUsd?: number;
}): Promise<{ agentRun: string; agentSummary: string }> {
  const token = resolveOAuthToken();
  let agentRun = "completed";
  let agentSummary = "";
  try {
    const q = query({
      prompt: opts.prompt,
      options: {
        cwd: APP_ROOT,
        model: opts.model ?? "sonnet",
        ...(opts.effort ? { effort: opts.effort } : {}),
        maxTurns: opts.maxTurns ?? 250,
        maxBudgetUsd: opts.maxBudgetUsd ?? 3,
        permissionMode: "dontAsk",
        settingSources: [],
        env: loopEnv(token),
        systemPrompt: opts.systemPrompt,
        allowedTools: opts.allowedTools,
        disallowedTools: ["Read(.env)"], // keep secrets out of context (also blocks `cat .env`)
      },
    });
    for await (const msg of q) {
      if (msg.type === "assistant") {
        // Stream only tool-use markers as live progress; the agent's narrative
        // text is captured into `agentSummary` and printed once by `report`.
        // (Streaming text AND echoing the summary caused the map to print twice.)
        for (const block of msg.message.content) {
          if (block.type === "tool_use") {
            process.stdout.write(`${opts.label ? `  ${opts.label} · ` : "  · "}${block.name}\n`);
          }
        }
      } else if (msg.type === "result" && "result" in msg && typeof msg.result === "string") {
        agentSummary = msg.result;
      }
    }
  } catch (err) {
    agentRun = `ended early — ${err instanceof Error ? err.message : String(err)}`;
  }
  return { agentRun, agentSummary };
}

// ── Finalize: verify, revert-on-red, emit the test-style result ─────────────
export function finalize(opts: {
  kind: string; // e.g. "patch bump", "security fix"
  agentRun: string;
  agentSummary: string;
  preamble?: string[]; // extra report lines (e.g. before/after vuln counts)
}): void {
  const summaryBlock = opts.agentSummary ? `\nAgent notes:\n${opts.agentSummary}` : "";

  if (suiteGreen()) {
    if (!hasRealVersionChange()) {
      // No dependency's version number actually changed. Discard any spec-only
      // drift (a reverted bump can leave `3.19.1` → `^3.19.1`) plus cosmetic
      // lockfile churn, so the tree returns to pristine — nothing real survived.
      execFileSync("git", ["restore", "package.json", "package-lock.json"], { cwd: APP_ROOT });
      report([
        `Agent run: ${opts.agentRun}`,
        ...(opts.preamble ?? []),
        "Independent verification: GREEN ✓",
        "",
        `RESULT: PASS — no ${plural(opts.kind)} were kept (none available or all reverted). Working tree clean.`,
        summaryBlock,
      ]);
      process.exitCode = 0;
      return;
    }
    const diff = packageJsonDiff();
    report([
      `Agent run: ${opts.agentRun}`,
      ...(opts.preamble ?? []),
      "Independent verification: GREEN ✓",
      "",
      `RESULT: PASS — ${plural(opts.kind)} verified green, left UNCOMMITTED for your review:\n\n${diff}\n\nReview with \`git diff\`, then commit if you approve.`,
      summaryBlock,
    ]);
    process.exitCode = 0;
    return;
  }

  // Tree is red after the agent — revert everything and re-verify.
  console.error("\nTree is RED — reverting everything and re-verifying…");
  revertAll();
  const greenAfter = suiteGreen();
  report([
    `Agent run: ${opts.agentRun}`,
    ...(opts.preamble ?? []),
    greenAfter
      ? "Independent verification: was RED → reverted everything → GREEN ✓"
      : "Independent verification: RED even after reverting everything",
    summaryBlock,
    "",
    greenAfter
      ? `RESULT: PASS — nothing survived verification; working tree clean.`
      : "RESULT: FAIL — the suite is red even at baseline. Investigate before trusting this loop.",
  ]);
  process.exitCode = greenAfter ? 0 : 1;
}
