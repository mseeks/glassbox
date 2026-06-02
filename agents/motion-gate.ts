/**
 * Motion-gate loop — Many Hands Engineering, reduced-motion gating debt.
 *
 * A READ-ONLY mapper of the ONE class of animation the global reduced-motion CSS
 * block (src/shared/utilities.css) cannot neutralize: JS-driven motion
 * (`requestAnimationFrame`, self-re-arming `setInterval` / `setTimeout` loops) and
 * SVG SMIL (`<animate>` / `<animateTransform>` / `<animateMotion>` / `<set>`).
 * AGENTS mandates that *autoplay-on-mount* motion of those kinds be gated with
 * `usePrefersReducedMotion()` — skip the loop, render a static frame — while
 * motion the user explicitly starts may keep animating. The harness sweeps the
 * scope with pure-node regex, notes per file whether `usePrefersReducedMotion` is
 * imported, and hands the hits to the agent, which Reads each in context and
 * emits a strict three-bucket map under a hard cite-or-omit rule.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 * You gate what you choose.
 *
 * The outside reference is tests/e2e/reduced-motion.spec.js — but that only
 * asserts "renders text, no errors" under reduced motion, NOT "the animation
 * actually froze." This loop is the source-level guard the e2e structurally
 * cannot be.
 *
 * Usage: tsx motion-gate.ts <scope>     (scope REQUIRED — file or dir)
 *   e.g.: src/   src/lessons/   src/lessons/swim/
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";

const ALLOWED_TOOLS = ["Read", "Grep", "Glob"];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".claude",
  "coverage",
  "dist",
  "test-results",
  "playwright-report",
]);

// JS/JSX only: JS motion loops live in .js/.jsx; SVG SMIL elements live in JSX.
// CSS @keyframes/transitions are out of scope (already neutralized globally).
const SCAN_EXT = /\.(?:js|jsx|mjs|cjs)$/;

// ── Required scope ────────────────────────────────────────────────────────
function getScope(): string {
  const scope = process.argv[2];
  if (!scope) {
    report([
      "RESULT: CANNOT RUN — a scope is required (no `--all` option by design).",
      "",
      "Usage: tsx motion-gate.ts <scope>",
      "  e.g.: src/   src/lessons/   src/lessons/swim/",
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

// ── Motion patterns (the deterministic signal) ────────────────────────────
type MotionKind =
  | "requestAnimationFrame"
  | "setInterval"
  | "setTimeout"
  | "<animate>"
  | "<animateTransform>"
  | "<animateMotion>"
  | "<set>";

interface MotionPattern {
  kind: MotionKind;
  pattern: RegExp;
}

// JS loops: rAF + setInterval are almost always real motion; setTimeout is
// flagged too but is frequently a one-shot (debounce/focus/delay) the agent
// demotes. SMIL elements animate attributes the reduced-motion CSS can't reach.
const MOTION_PATTERNS: MotionPattern[] = [
  { kind: "requestAnimationFrame", pattern: /\brequestAnimationFrame\s*\(/ },
  { kind: "setInterval", pattern: /\bsetInterval\s*\(/ },
  { kind: "setTimeout", pattern: /\bsetTimeout\s*\(/ },
  { kind: "<animate>", pattern: /<animate(?![A-Za-z])/ },
  { kind: "<animateTransform>", pattern: /<animateTransform\b/ },
  { kind: "<animateMotion>", pattern: /<animateMotion\b/ },
  { kind: "<set>", pattern: /<set\b/ },
];

interface Finding {
  file: string; // relative
  line: number;
  kind: MotionKind;
  snippet: string;
}

// Cheap proxy for "this file gates something": does it pull in the hook?
function fileGates(text: string): boolean {
  return /usePrefersReducedMotion/.test(text);
}

function checkMotion(files: string[]): { findings: Finding[]; gatedFiles: Set<string> } {
  const findings: Finding[] = [];
  const gatedFiles = new Set<string>();
  for (const file of files) {
    const fileRel = relative(APP_ROOT, file);
    const text = readFileSync(file, "utf8");
    if (fileGates(text)) gatedFiles.add(fileRel);
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const snippet = line.trim().slice(0, 140);
      for (const { kind, pattern } of MOTION_PATTERNS) {
        if (pattern.test(line)) {
          findings.push({ file: fileRel, line: i + 1, kind, snippet });
        }
      }
    }
  }
  return { findings, gatedFiles };
}

function formatForAgent(findings: Finding[], files: string[], gatedFiles: Set<string>): string {
  const fileList = files
    .map((f) => {
      const rel = relative(APP_ROOT, f);
      return `  - ${rel}${gatedFiles.has(rel) ? "   [imports usePrefersReducedMotion]" : ""}`;
    })
    .join("\n");

  if (findings.length === 0) {
    return `Files in scope (${files.length}):
${fileList}

JS/SMIL motion sources detected: NONE — no requestAnimationFrame / setInterval / setTimeout / <animate*> / <set> found in the scope.

This is the clean-scan case. Per the system prompt: sample at most 2-3 files briefly to confirm the regex didn't miss something subtle, then output the default clean map. A bucket (1) finding requires a quoted line from your actual Read — no quote means no finding.`;
  }

  const byFile = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file)!.push(f);
  }

  const grouped = Array.from(byFile.entries())
    .map(([file, fs]) => {
      const gateNote = gatedFiles.has(file)
        ? "  [imports usePrefersReducedMotion — verify the gate actually guards THIS motion]"
        : "  [does NOT import usePrefersReducedMotion]";
      return `${file}${gateNote}:\n${fs
        .map((f) => `  - line ${f.line} · [${f.kind}]\n      ${f.snippet}`)
        .join("\n")}`;
    })
    .join("\n\n");

  return `Files in scope (${files.length}):
${fileList}

Motion sources detected (${findings.length}) — scanned by the harness, NOT yet verified:
${grouped}

For EACH hit, Read the surrounding context and determine whether the motion (a) autoplays on mount and is ungated (bucket 1 — must gate), (b) is already gated by usePrefersReducedMotion or only starts from explicit user action (bucket 2 — safe), or (c) is ambiguous (bucket 3). The per-file usePrefersReducedMotion note is only a proxy — a file can import the hook for one effect yet leave another loop ungated, so verify the gate guards THIS specific motion.`;
}

// ── Agent's job (quality bar lives here) ──────────────────────────────────
function systemPrompt(scope: string): string {
  return `You are the motion-gate (reduced-motion) mapper for the Glassbox repository (React 19 + Vite + JavaScript — a collection of animation-heavy, self-contained lessons). The harness has scanned \`${scope}\` for JS-driven motion (requestAnimationFrame / setInterval / setTimeout loops) and SVG SMIL (<animate> / <animateTransform> / <animateMotion> / <set>) and given you a candidate list. Your job: turn it into a curated map of which motion needs a reduced-motion gate.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human adds the gates they agree are worth it.

THE RULE (from AGENTS.md): the global reduced-motion block in src/shared/utilities.css already neutralizes CSS @keyframes/transitions for free. It CANNOT reach JS-driven motion or SVG SMIL. So any motion that AUTOPLAYS ON MOUNT via JS or SMIL must be gated with the usePrefersReducedMotion() hook (src/shared/usePrefersReducedMotion.js): when it returns true, skip the loop and render a sensible static frame. Motion the user EXPLICITLY STARTS (a play/step button they pressed, a pointer drag) may keep animating and needs no gate.

For EACH candidate, classify it into EXACTLY ONE of three buckets:

(1) UNGATED AUTOPLAY-ON-MOUNT — MUST GATE. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT line(s) as observed in your Read, in backticks, with the line number, and name the component. No quote pasted from a Read = no finding. Cite or omit.
    (b) WHY — confirm it starts WITHOUT a user action (e.g. a setInterval/rAF kicked off inside a useEffect with an empty/mount dep array and no \`if (reduced) return\` guard; or a SMIL element with no/zero \`begin\` that plays immediately) AND is not guarded by usePrefersReducedMotion for THIS motion.
    (c) ACTION — the literal next step: "call usePrefersReducedMotion() and \`if (reduced) { <set static frame>; return; }\` before starting the interval/rAF" or "render the SMIL <animate> only when !reduced, else a static attribute".
      If you cannot confirm it autoplays on mount, it does NOT belong here.

(2) GATED OR USER-INITIATED — verified safe. State the SPECIFIC reason, quoting the guard or the trigger:
    - Already consults usePrefersReducedMotion() and early-returns / renders a static frame when reduced (quote the guard line),
    - Only starts from an explicit user handler — quote the onClick/onPointerDown/play-button that triggers it (AGENTS permits user-started motion to animate),
    - A one-shot setTimeout that is NOT motion (a debounce, a focus delay, a single deferred state set, a cleanup timer) — say which,
    - A SMIL element that is decorative AND the page is covered by reduced-motion via a JS gate, or whose begin depends on interaction.
    Listing what you CONSIDERED and REJECTED shows your work.

(3) JUDGMENT-HEAVY (your call). Use for genuinely ambiguous cases: a loop started on mount but conditional on an in-view / data flag; a loop paced by useInViewport (NOTE: off-screen pausing is NOT the same as reduced-motion — it still needs the reduced gate); partially-gated components where one effect is gated and another is not. Name the ambiguity precisely.

KNOWN-CONTEXT AWARENESS for this repo:
- Pure CSS @keyframes / transition / animation are OUT OF SCOPE — already neutralized by the utilities.css reduced-motion block. Only JS loops + SVG SMIL are in scope. (The scan does not flag CSS, but don't get talked into flagging a CSS-driven hero.)
- useInViewport() pauses a loop when off-screen — that is a battery optimization, NOT reduced-motion compliance. A loop paused only by useInViewport but not by usePrefersReducedMotion is still bucket (1) or (3), not (2).
- The shared reveal.jsx / useScrollSpy.js use CSS transitions + a one-shot scroll — not JS motion loops.
- A setTimeout used once (no re-arm) for a non-visual delay (debounce, deferred focus, a "settle" delay) is bucket (2) "not motion". A setTimeout that re-arms itself or drives a step-by-step animation is real motion — treat like setInterval.
- The hero of many lessons auto-cycles on mount (the canonical bucket-1 risk if ungated).

WHEN THE HARNESS REPORTS 0 MOTION (clean mechanical scan):
The DEFAULT, EXPECTED output is a clean map. Sample at most 2-3 files briefly, then output:

> ## Ungated autoplay-on-mount — gate now (review & act)
> *(none — 0 JS/SMIL motion sources detected by the scan; brief sample of N files confirmed none at the spots checked)*

To override with a bucket (1) finding you MUST quote the exact line you observed. Do NOT pattern-match on what ungated motion typically looks like and reach for plausible findings. A confident-sounding inference without a quoted line is a confabulation; suppress it.

INVESTIGATION SCOPE:
Primary findings are within \`${scope}\` only. If tracing a hit surfaces a compelling related issue in an adjacent file, mention it ONCE as a brief "Out-of-scope observation:" line at the very end (file:line + a quoted citation).

Hard rules:
- No purity-for-purity's-sake. User-initiated motion is fine — do not flag a play-button animation.
- No hypothetical fixes. If you cannot confirm autoplay-on-mount + no gate, it is bucket (2) or (3).
- If the same pattern recurs identically across labs, report it once with one action covering all sites.

Output a structured map with exactly these three sections in this order:

## Ungated autoplay-on-mount — gate now (review & act)

(per item — location · WHAT (quoted line + component) · WHY (autoplays, ungated) · ACTION)

## Gated or user-initiated — verified safe

(list — finding · reason (quote the guard or the triggering handler))

## Judgment-heavy (your call)

(list — finding · the precise ambiguity)

End with a final summary line: "<X> must-gate · <Y> safe · <Z> judgment". Nothing after.`;
}

// ── Orchestration ─────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const scope = getScope();
  console.log(`Motion-gate loop — scope: ${scope}\n`);

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

  console.log(`── Sweeping ${files.length} file(s) for JS/SMIL motion ──`);
  const { findings, gatedFiles } = checkMotion(files);
  console.log(`   Motion sources detected: ${findings.length}\n`);

  const { agentRun, agentSummary } = await runLoop({
    systemPrompt: systemPrompt(scope),
    allowedTools: ALLOWED_TOOLS,
    prompt: formatForAgent(findings, files, gatedFiles),
    // opus: the autoplay-vs-user-initiated call is exactly the kind of judgment
    // where false positives are expensive and sonnet's priors can override a
    // fresh reading of the effect's trigger.
    model: "opus",
  });

  report([
    `Scope:               ${scope}`,
    `Files in scope:      ${files.length}`,
    `Motion sources:      ${findings.length}`,
    `Agent run:           ${agentRun}`,
    "(read-only — the working tree was not modified)",
    "",
    agentSummary || "(no map produced — see streamed agent output above)",
    "",
    `RESULT: PASS — map above for \`${scope}\`; review the gate-now section and add the reduced-motion guards you choose.`,
  ]);
}

main().catch((err) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
