/**
 * Comment-debt loop — Many Hands Engineering, loop #7.
 *
 * A READ-ONLY mapper of in-code comment debt — `TODO` / `FIXME` / `HACK` / `XXX`
 * markers. The harness sweeps the scope with pure-node regex (no external tool)
 * and hands the marker hits to the agent, which Reads each in context and emits
 * a strict three-bucket map (Action now / Legitimately kept / Judgment-heavy)
 * under a hard cite-or-omit rule.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 * You delete / lift / fix what you choose.
 *
 * Usage: tsx comment-debt.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/   src/lessons/   src/shared/   AGENTS.md
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

// File types to scan — JS/JSX source + CSS + Markdown (docs carry TODOs too).
const SCAN_EXT = /\.(?:js|jsx|mjs|cjs|css|md)$/;

// ── Required scope ────────────────────────────────────────────────────────
function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx comment-debt.ts <scope>",
      "  e.g.: src/   src/lessons/   src/shared/   AGENTS.md",
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

// ── Marker patterns (the deterministic signal) ────────────────────────────
type MarkerKind = "TODO" | "FIXME" | "HACK" | "XXX";

interface MarkerPattern {
  kind: MarkerKind;
  pattern: RegExp;
}

// Patterns are scanned per-line; the agent verifies in context. Word boundary
// plus a trailing colon / whitespace / EOL keeps us off substrings like `XXXL`.
// Case-sensitive on purpose — these markers are conventionally uppercase, and
// matching lowercase would only add noise. The harness flags every hit and the
// agent demotes accidental / meta-reference matches to bucket (2) — we do NOT
// try to be clever about which hits are "real" here (that's the agent's job).
const MARKER_PATTERNS: MarkerPattern[] = [
  { kind: "TODO", pattern: /\bTODO\b(?::|\s|$)/g },
  { kind: "FIXME", pattern: /\bFIXME\b(?::|\s|$)/g },
  { kind: "HACK", pattern: /\bHACK\b(?::|\s|$)/g },
  { kind: "XXX", pattern: /\bXXX\b(?::|\s|$)/g },
];

interface Finding {
  file: string; // relative
  line: number;
  kind: MarkerKind;
  snippet: string;
}

function checkMarkers(files: string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const fileRel = relative(APP_ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Trim, bound snippet for the agent's input
      const snippet = line.trim().slice(0, 140);
      for (const { kind, pattern } of MARKER_PATTERNS) {
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

Markers detected: NONE — no \`TODO\` / \`FIXME\` / \`HACK\` / \`XXX\` markers found in the scope.

This is the clean-scan case. Per the system prompt: sample at most 2-3 files briefly to confirm the regex didn't miss something subtle, then output the default clean map. A bucket (1) finding requires a quoted marker line from your actual Read — no quote means no finding. Do not reach for findings to fill the buckets.`;
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

Markers detected (${findings.length}) — scanned by the harness, NOT yet verified:
${grouped}

For EACH marker, Read the surrounding context. Some are real, fixable debt; some are doing real ongoing work (compatibility warning / design rationale / tagged aspirational note); some are accidental / meta-references (e.g. a doc that talks about the word "TODO"). Classify each into ONE of the three buckets per the system prompt.`;
}

// ── Agent's job (quality bar lives here) ──────────────────────────────────
function systemPrompt(scope: string): string {
  return `You are the comment-debt mapper for the Glassbox repository (React 19 + Vite + JavaScript — self-contained lessons under \`src/lessons/<slug>/\`). The harness has scanned \`${scope}\` for in-code comment debt (TODO / FIXME / HACK / XXX markers) and given you a candidate list. Your job: turn it into a curated map of which markers to act on.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human deletes / lifts / fixes the markers they agree are worth it.

For EACH candidate, classify it into EXACTLY ONE of three buckets:

(1) ACTION NOW. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT marker line as you observed it in your Read, in backticks, with the line number (e.g. "line 42 — \`// TODO: replace this with the new API once the migration lands\` — the migration shipped in commit X but the marker remained"). No quote pasted from a Read = no finding. This is a hard binary: cite or omit.
    (b) WHY it matters (concrete consequence of leaving the debt — who is misled, or what risk remains: a reader trusts a stale note, a known bug goes unfixed, a placeholder leaks),
    (c) ACTION — a literal next step. One of:
        - delete now (the work shipped) — "delete the marker; verify no test still depends on the placeholder behaviour",
        - do the small thing right now — "apply the one-line fix; the marker calls for it directly",
        - lift to docs and delete inline — "move the rationale to AGENTS.md (or a tracking issue), delete the inline marker".
      If you cannot name a concrete action — it does NOT belong here. Move to (2) or (3).

(2) LEGITIMATELY KEPT — verified intentional. State the SPECIFIC reason the comment is doing real ongoing work:
    - Compatibility / environment warning — "this fallback is for browsers without \`matchMedia\`; do not remove" — a real runtime guard, not debt,
    - Design rationale — a comment that is actually documentation (e.g. "numBuckets must be a power of two or altIndex is no longer an involution"), not debt,
    - Intentional aspirational note — explicitly tagged (e.g. \`// TODO(zo): consider lazy-loading the index page\`), fine to keep,
    - Verified meta-reference, not real debt — the regex hit text that merely *names* a marker (e.g. a doc explaining "prefer TODO over FIXME"); it is not a real action item.
    Listing what you CONSIDERED and REJECTED matters — it shows your work.

(3) JUDGMENT-HEAVY (your call). Use sparingly: the debt is real but the fix is non-trivial — touches a lesson engine's public API, cascades through many call sites, or needs a design decision. Briefly name the COST (e.g. "would require reworking the engine's exported shape and every lab + test that imports it") so a human can decide.

KNOWN-CONTEXT AWARENESS for this repo:
- \`AGENTS.md\` is the canonical agent guide and where long-form, tracked follow-ups belong (its "Known follow-ups" / "Open items" section). If a marker's content is already tracked there, treat it as KEPT (or a lift-and-delete action), not net-new debt to enumerate.
- The lessons are intentionally unique (each its own engine / CSS prefix / fonts). A marker that documents a per-lesson choice is design rationale, not debt — verify before flagging.

WHEN THE HARNESS REPORTS 0 MARKERS (clean mechanical scan):
The DEFAULT, EXPECTED output is a clean map. Sample at most 2-3 files briefly to confirm the regex didn't miss something subtle, then output:

> ## Action now (review & act)
> *(none — 0 markers detected by the scan; brief sample of N files confirmed no real TODO/FIXME/HACK/XXX debt at the spots checked)*

To override this default with a bucket (1) finding, you MUST quote the exact marker line you observed in your Read — same citation rule as above. Do NOT pattern-match on what typical comment debt looks like and reach for plausible-sounding findings to fill the buckets. A confident-sounding inference without a quoted marker line is a confabulation; suppress it.

INVESTIGATION SCOPE:
Primary findings are within \`${scope}\` only. If tracing a comment / call site surfaces a compelling related piece of debt in an adjacent file, mention it ONCE as a brief "Out-of-scope observation:" line at the very end of the report (with the file:line + a quoted citation). Do not enumerate adjacent files. The user can re-run with a wider scope if it's worth it.

Hard rules:
- No purity-for-purity's-sake. A marker is not debt just because it exists; if there's no concrete consequence and no concrete action, it's bucket (2).
- No hypothetical fixes. If the ACTION isn't a literal delete / one-line fix / lift-and-delete, it's bucket (3), not (1).
- If the same marker recurs identically many times (same generated header, same boilerplate), report the PATTERN once with one action covering all sites — don't pad the map.

Output a structured map with exactly these three sections in this order:

## Action now (review & act)

(per item — location · WHAT (quoted marker line) · WHY · ACTION)

## Legitimately kept — verified intentional

(list — finding · reason)

## Judgment-heavy (your call)

(list — finding · cost)

End with a final summary line: "<X> act · <Y> kept · <Z> judgment". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Comment-debt loop — scope: ${scope}\n`);

  const files = gatherSources(scope);
  if (files.length === 0) {
    report([
      `Scope:               ${scope}`,
      `Files in scope:      0`,
      "",
      "RESULT: PASS — no scannable files (.js/.jsx/.mjs/.cjs/.css/.md) in scope. Nothing to map.",
    ]);
    return;
  }

  console.log(`── Sweeping ${files.length} file(s) for comment markers ──`);
  const findings = checkMarkers(files);
  console.log(`   Markers detected: ${findings.length}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, files),
    // No model override: sonnet is correct here. Unlike type-debt's clean-scan
    // case, this loop's regex always hands the agent concrete marker lines to
    // anchor on, so sonnet stays grounded. (Opt into `model: "opus"` only if it
    // confabulates consistently after prompt-tightening — see the spec.)
  });

  report([
    `Scope:               ${scope}`,
    `Files in scope:      ${files.length}`,
    `Markers detected:    ${findings.length}`,
    `Agent run:           ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the Action-now section and act on what you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
