/**
 * Doc-coherence loop — Many Hands Engineering, loop #5.
 *
 * A READ-ONLY mapper of doc drift. The harness pre-computes mechanical findings —
 * broken markdown links, file-path references that no longer exist, command
 * mentions whose scripts aren't in package.json — via pure-node regex + fs checks.
 * The agent (Read / Grep / Glob only) verifies each + finds SEMANTIC drift the
 * harness can't catch (claims about code/architecture/behavior that don't match
 * current reality), with a strict articulate-the-value quality bar.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a doc.
 * You write the changes. Doc voice is yours.
 *
 * Usage: tsx doc-coherence.ts <scope>     (scope REQUIRED — file or dir of .md)
 *   e.g.: AGENTS.md   README.md   agents/README.md
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"]; // read-only — no way to change anything

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

// ── Required scope ────────────────────────────────────────────────────────
function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx doc-coherence.ts <scope>",
      "  e.g.: AGENTS.md   README.md   agents/README.md",
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

// ── Gather .md files in scope (handles file or dir) ───────────────────────
function gatherDocs(scope: string): string[] {
  const scopeAbs = resolve(APP_ROOT, scope);
  const st = statSync(scopeAbs);
  if (st.isFile()) {
    return scopeAbs.endsWith(".md") ? [scopeAbs] : [];
  }
  const docs: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        docs.push(full);
      }
    }
  };
  walk(scopeAbs);
  docs.sort();
  return docs;
}

// ── Mechanical findings (the deterministic signal) ────────────────────────
interface Finding {
  doc: string; // relative path
  line: number;
  kind: "broken-link" | "missing-file-ref" | "missing-script";
  reference: string;
  detail: string;
}

function loadScripts(): Set<string> {
  const scripts = new Set<string>();
  const load = (pkgPath: string) => {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, string> };
      for (const name of Object.keys(pkg.scripts ?? {})) scripts.add(name);
    } catch {
      /* package missing or unreadable — ignore */
    }
  };
  load(resolve(APP_ROOT, "package.json"));
  load(resolve(APP_ROOT, "agents/package.json"));
  return scripts;
}

function lineOf(content: string, index: number): number {
  return content.slice(0, index).split("\n").length;
}

function checkMechanical(docs: string[]): Finding[] {
  const findings: Finding[] = [];
  const scripts = loadScripts();

  for (const doc of docs) {
    const docRel = relative(APP_ROOT, doc);
    const content = readFileSync(doc, "utf8");
    const docDir = dirname(doc);

    // 1. Markdown links: [text](url) — local-only file refs
    for (const m of content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
      const url = m[2];
      if (/^(https?|mailto|tel):/i.test(url) || url.startsWith("#")) continue;
      const pathPart = url.split("#")[0];
      if (!pathPart) continue;
      const resolved = resolve(docDir, pathPart);
      if (!existsSync(resolved)) {
        findings.push({
          doc: docRel,
          line: lineOf(content, m.index ?? 0),
          kind: "broken-link",
          reference: url,
          detail: `Markdown link to '${url}' — target does not exist relative to the doc.`,
        });
      }
    }

    // 2. Inline-code file-path mentions: `path/to/file.ext` — checked from repo root
    for (const m of content.matchAll(/`([\w\-./@]+\.(?:ts|js|tsx|jsx|vue|mjs|cjs|json|md|yml|yaml|css))`/g)) {
      const ref = m[1];
      if (ref.startsWith("/")) continue; // absolute paths are likely intentional (/etc/, etc.)
      if (!ref.includes("/") && !ref.includes(".")) continue;
      const resolved = resolve(APP_ROOT, ref);
      if (!existsSync(resolved)) {
        findings.push({
          doc: docRel,
          line: lineOf(content, m.index ?? 0),
          kind: "missing-file-ref",
          reference: ref,
          detail: `File reference '${ref}' — does not exist relative to the repo root.`,
        });
      }
    }

    // 3. Command mentions: `npm run X` — checked against package.json scripts
    for (const m of content.matchAll(/`npm run ([\w:-]+)`/g)) {
      const scriptName = m[1];
      if (!scripts.has(scriptName)) {
        findings.push({
          doc: docRel,
          line: lineOf(content, m.index ?? 0),
          kind: "missing-script",
          reference: `npm run ${scriptName}`,
          detail: `Command 'npm run ${scriptName}' — no such script in package.json or agents/package.json.`,
        });
      }
    }
  }

  return findings;
}

function formatForAgent(findings: Finding[], docs: string[]): string {
  const docList = docs.map((d) => `  - ${relative(APP_ROOT, d)}`).join("\n");
  if (findings.length === 0) {
    return `Docs in scope (${docs.length}):
${docList}

Mechanical findings: NONE — all markdown links resolve, all file refs exist, all command mentions resolve to scripts.

This is the clean-scan case. Per the system prompt: sample at most 2-3 docs briefly; the paired-citation rule applies to any bucket (1) finding (quote the doc text AND the contradicting reality). Cite or skip.`;
  }

  const byDoc = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!byDoc.has(f.doc)) byDoc.set(f.doc, []);
    byDoc.get(f.doc)!.push(f);
  }
  const grouped = Array.from(byDoc.entries())
    .map(
      ([doc, fs]) =>
        `${doc}:\n${fs.map((f) => `  - line ${f.line} · [${f.kind}] · ${f.detail}`).join("\n")}`,
    )
    .join("\n\n");

  return `Docs in scope (${docs.length}):
${docList}

Mechanical findings (${findings.length}) — already verified by the harness:
${grouped}

For EACH mechanical finding, Read the surrounding context — it may be an intentional historical / past-tense reference rather than drift. AND read each doc for SEMANTIC drift the harness can't catch.`;
}

// ── The agent's job (quality bar lives in the prompt) ─────────────────────
function systemPrompt(scope: string): string {
  return `You are the doc-coherence mapper for the Glassbox repository (React 19 + Vite + JavaScript — self-contained lessons under \`src/lessons/<slug>/\`, with \`AGENTS.md\` as the canonical agent guide and \`README.md\` as the human-facing one). The harness has scanned docs in \`${scope}\` and given you mechanical findings (broken refs / paths / commands) plus the doc list. Your job: turn this into a curated map of drift worth fixing.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any doc. The human writes the changes they agree are worth it.

For EACH candidate (mechanical finding AND any semantic drift you find by reading), classify it into EXACTLY ONE of three buckets:

(1) DRIFT CONFIRMED. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT specifically drifted — quote BOTH the EXACT text from the doc (in backticks, with line number) AND the contradicting current reality you observed (the file content / actual API path / actual script name). Paired citation required. A claim like "the doc says X but the code does Y" without quoted substrings from both sides is by definition confabulation; suppress it.
    (b) WHY a reader would be misled (who is harmed — new contributor, future session, an integration?),
    (c) WHAT to do — a concrete action (update / archive / delete / split / etc.).
    If you cannot answer all three cleanly — MOVE TO (2) or (3). Do not stretch.

(2) NOT DRIFT — verified / intentional / historical. State the specific reason:
    verified accurate / historical reference (deliberately past-tense) / intentional snapshot /
    stale-by-design (another doc explicitly flags it as such) / etc.
    Listing what you CONSIDERED and REJECTED matters — it shows your work.

(3) DRIFT BUT JUDGMENT-HEAVY. Use sparingly: the drift is real but the fix needs human judgment
    (major rewrite, archive-vs-update, intentional ambiguity to preserve). Briefly name the cost.

KNOWN-CONTEXT AWARENESS for this repo:
- \`AGENTS.md\` deliberately keeps a "Done (kept so the record stays accurate)" list and a "Known follow-ups" / "Open items" section — these are intentional HISTORICAL / forward-looking records, not drift. A past-tense "Done" entry describing work that shipped is correct by design; do not flag it as stale. Only flag a "Done" claim that the code actively contradicts (e.g. it says a file was removed but the file is present and imported).
- Per-lesson identity is intentional: AGENTS.md's lesson table (accent / display font / class prefix per lesson) is a real spec — verify a claim against \`src/lesson-catalog.js\` and the lesson folder before calling it drift.

Hard rule: do NOT propose fixes for stylistic preferences, hypothetical future drift, or trivial polish. If there's no concrete reader misled or current contradiction, skip.

WHEN THE HARNESS REPORTS 0 MECHANICAL FINDINGS (clean scan):
The default expected output is a clean map. Sample at most 2-3 docs briefly to look for semantic drift the regex can't catch. To override the default with a bucket (1) finding, the paired-citation rule above applies — quote the exact doc text AND the contradicting reality. A confident-sounding claim about a doc being "outdated" without quoting both sides is a confabulation; suppress it.

Output a structured map with exactly these three sections in this order:

## Drift confirmed (review & fix)

(per item — location · WHAT specifically · WHY a reader would be misled · ACTION — concrete)

## Not drift — verified / intentional / historical

(list — finding · reason)

## Drift but judgment-heavy (your call)

(list — finding · cost)

End with a final summary line: "<X> confirmed · <Y> not-drift · <Z> judgment". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Doc-coherence loop — scope: ${scope}\n`);

  const docs = gatherDocs(scope);
  if (docs.length === 0) {
    report([
      `Scope:               ${scope}`,
      `Docs in scope:       0`,
      "",
      "RESULT: PASS — no .md files in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Computing mechanical findings across ${docs.length} doc(s) ──`);
  const findings = checkMechanical(docs);
  console.log(`   Mechanical findings: ${findings.length} (broken refs / links / commands)\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, docs),
  });

  report([
    `Scope:               ${scope}`,
    `Docs in scope:       ${docs.length}`,
    `Mechanical findings: ${findings.length}`,
    `Agent run:           ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Drift-confirmed section and update / archive / delete what you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
