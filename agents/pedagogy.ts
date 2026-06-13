/**
 * Pedagogy loop — Many Hands Engineering, the "does it actually teach?" pass.
 *
 * Every other content loop guards a different thing: `content-accuracy` guards
 * whether the prose is TRUE, `lab-fidelity` whether the labs are REAL,
 * `collection-coherence` whether the structural beats are PRESENT. None of them
 * asks the question this collection exists to answer — does the lesson actually
 * TEACH? This loop does.
 *
 * It is qualitative by design (testing whether an agent can compute the answer
 * measures the agent, not the teaching). A panel of independent evaluators reads
 * each lesson as a motivated newcomer and scores it against ONE fixed, shared
 * rubric of named pedagogy practices (see pedagogy-rubric.ts) — and ONLY that
 * rubric. A teaching gap is reported only when a MAJORITY of the panel
 * independently flags the same rubric item with a cited passage. That majority +
 * the fixed rubric + a per-lesson accept-list are the cap: the loop converges to
 * a quiet PASS instead of producing endless advice.
 *
 * Honest about its reference: teaching quality is judgement, so this MAPS, it does
 * not gate (propose-only, Read/Grep/Glob, never edits). Its rigor comes from the
 * fixed rubric, strict cite-or-omit, the agreement threshold, and the accept-list
 * — not from a mechanical truth.
 *
 * Usage:
 *   tsx pedagogy.ts                       # all lessons
 *   tsx pedagogy.ts paxos bloom-filters   # only these lesson ids
 *   tsx pedagogy.ts --panel=3             # evaluators per lesson (default 3)
 *   tsx pedagogy.ts --concurrency=2       # lessons reviewed in parallel (default 2)
 *   tsx pedagogy.ts --budget=4            # USD cap PER EVALUATOR (default 4)
 *   tsx pedagogy.ts --dry-run             # show the plan + cost ceiling, spend nothing
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { APP_ROOT, report, runLoop } from "./lib.js";
import {
  LESSONS_DIR,
  type Lesson,
  gatherLessonFiles,
  lessonDir,
  lessonDirsOnDisk,
  parseCatalog,
  parsePerLessonArgs,
  relList,
  runPool,
} from "./per-lesson.js";
import { RUBRIC } from "./pedagogy-rubric.js";

const ACCEPT_FILE = resolve(APP_ROOT, "agents", "pedagogy-accept.json");
const VERDICTS = new Set(["satisfied", "weak", "missing"]);
const RUBRIC_TEXT = RUBRIC.map((r, i) => `  ${i + 1}. id="${r.id}" — ${r.name}: ${r.check}`).join("\n");

// ── Args ──────────────────────────────────────────────────────────────────────
/** Read a `--flag=N` integer (the `=` form, so parsePerLessonArgs doesn't mistake
 *  a space-separated value for a lesson id). */
function argInt(flag: string, dflt: number): number {
  for (const a of process.argv.slice(2)) {
    if (a.startsWith(`${flag}=`)) {
      const n = Math.floor(Number(a.slice(flag.length + 1)));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return dflt;
}

// ── Accept-list (the intentional-deviation record) ────────────────────────────
type Accept = Record<string, Record<string, string>>;
function loadAccept(): Accept {
  if (!existsSync(ACCEPT_FILE)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(ACCEPT_FILE, "utf8"));
    return parsed && typeof parsed === "object" ? (parsed as Accept) : {};
  } catch {
    return {};
  }
}

// ── Lesson selection (the deterministic signal) ───────────────────────────────
function selectLessons(ids: string[], limit: number | null): { selected: Lesson[]; unknown: string[] } {
  const onDisk = new Set(lessonDirsOnDisk());
  const valid = parseCatalog().filter((l) => l.id !== "index" && onDisk.has(l.id));
  const validIds = new Set(valid.map((l) => l.id));
  const unknown = ids.filter((id) => !validIds.has(id));
  let selected = ids.length ? valid.filter((l) => ids.includes(l.id)) : valid;
  if (limit) selected = selected.slice(0, limit);
  return { selected, unknown };
}

// ── Parse one evaluator's JSON verdict block ──────────────────────────────────
interface Verdict {
  verdict: string;
  cite: string;
  gap: string;
}
interface Panelist {
  items: Map<string, Verdict>;
  offRubric: string;
}

function extractJson(text: string): unknown {
  const tryParse = (s: string): unknown => {
    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  };
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const v = tryParse(fence[1].trim());
    if (v !== undefined) return v;
  }
  const brace = text.match(/\{[\s\S]*\}/);
  if (brace) return tryParse(brace[0]);
  return undefined;
}

function parsePanelist(summary: string): Panelist | null {
  const data = extractJson(summary);
  if (!data || typeof data !== "object") return null;
  const obj = data as { items?: unknown; offRubric?: unknown };
  if (!Array.isArray(obj.items)) return null;
  const items = new Map<string, Verdict>();
  for (const raw of obj.items) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.id !== "string") continue;
    const verdict = typeof r.verdict === "string" && VERDICTS.has(r.verdict) ? r.verdict : "satisfied";
    items.set(r.id, {
      verdict,
      cite: typeof r.cite === "string" ? r.cite : "",
      gap: typeof r.gap === "string" ? r.gap : "",
    });
  }
  return { items, offRubric: typeof obj.offRubric === "string" ? obj.offRubric.trim() : "" };
}

// ── Prompts ───────────────────────────────────────────────────────────────────
function systemPrompt(): string {
  return `You are a PEDAGOGY EVALUATOR — one of an independent panel reviewing ONE Glassbox lesson for TEACHING QUALITY. Glassbox makes hard CS/systems ideas learnable; read this lesson the way a motivated newcomer to the topic would, and judge whether it actually teaches.

You are NOT checking factual accuracy (another loop owns that), nor whether the structural beats merely exist, nor code/visual/performance. You judge the QUALITY of the teaching, and ONLY against the fixed rubric below — you may not invent new criteria. That bound is deliberate: it keeps this review from drifting into endless taste.

Your only tools are Read / Grep / Glob. Read what you need; you cannot and must not edit anything.

THE RUBRIC — for EACH item, return exactly one verdict:
  - "satisfied": the lesson clearly does this, and it lands. Cite the passage that does it.
  - "weak": the lesson attempts this but it does not land (too thin, buried, or only partial). Cite where, and name the gap in one sentence.
  - "missing": the lesson does not do this where it should. Cite where it should have been, and name the gap.

${RUBRIC_TEXT}

HARD RULES (these are what make the panel trustworthy):
  - DEFAULT TO "satisfied" WHEN UNSURE. A panel that flags everything is the failure mode. Mark "weak"/"missing" ONLY when you can point to the specific place the teaching falls short.
  - CITE OR OMIT. Every "weak"/"missing" verdict MUST quote a real line (file:line, or an exact short phrase) from your own reading. No quote → you may not flag it; return "satisfied".
  - Judge the lesson AS WRITTEN FOR ITS CHOSEN FORM. A declared survey, history, or essay legitimately makes different moves; do not penalize an intentional form. (The steward records those as accepted separately — you just judge honestly.)
  - Be DIAGNOSTIC, never prescriptive: name what is missing, not how to rewrite it.
  - The engine implementation (engine/index.js) is intentionally withheld — judge the TEACHING the reader receives, not the underlying algorithm source.

OUTPUT: return ONLY a single fenced \`\`\`json code block — no prose before or after — of exactly this shape, with one object per rubric id (all ${RUBRIC.length} present):

\`\`\`json
{
  "items": [
    {"id": "motivation", "verdict": "satisfied", "cite": "<file:line or exact quoted phrase, or n/a>", "gap": "<one sentence, or empty if satisfied>"}
  ],
  "offRubric": "<at most one sentence on something important the rubric does not cover, or empty>"
}
\`\`\``;
}

function userPrompt(lesson: Lesson, files: string[]): string {
  return `Lesson under review: \`${lesson.id}\` — "${lesson.title}". Eyebrow / claim it makes the learner: ${lesson.eyebrow || "(none stated)"}.

Read it as a motivated newcomer to this topic. Its teaching surface (prose sections, interactive labs, lesson-local components), relative to \`${LESSONS_DIR}/${lesson.id}/\`:
${relList(lesson.id, files)}

Evaluate every rubric item against what THIS lesson does, and return ONLY the json verdict block.`;
}

// ── Aggregate one lesson's panel into a report block ──────────────────────────
interface LessonReport {
  lines: string[];
  failedItems: number;
  hasFindings: boolean;
}

function aggregate(
  lesson: Lesson,
  panelists: (Panelist | null)[],
  panel: number,
  threshold: number,
  accepted: Record<string, string>,
): LessonReport {
  const answered = panelists.filter((p): p is Panelist => p !== null);
  const abstained = panel - answered.length;

  const findingBlocks: string[] = [];
  const acceptedLines: string[] = [];
  let clear = 0;
  let failedItems = 0;

  for (const item of RUBRIC) {
    if (item.id in accepted) {
      acceptedLines.push(`  ~ ${item.name} — accepted: ${accepted[item.id]}`);
      continue;
    }
    const flags = answered
      .map((p) => p.items.get(item.id))
      .filter((v): v is Verdict => v !== undefined && (v.verdict === "weak" || v.verdict === "missing"));
    if (flags.length >= threshold) {
      failedItems++;
      findingBlocks.push(`  ⚠ ${item.name}  (${flags.length}/${panel} flagged)`);
      for (const f of flags) findingBlocks.push(`       · ${f.cite || "(no cite)"} — ${f.gap || "(no detail)"}`);
    } else {
      clear++;
    }
  }

  const offNotes = answered.map((p) => p.offRubric).filter((s) => s.length > 0);
  const lines: string[] = [
    "",
    "─".repeat(64),
    `## ${lesson.id} — ${lesson.title}`,
    `(${panel} evaluators${abstained ? `, ${abstained} unparseable` : ""} · ${clear}/${RUBRIC.length} rubric items clear${acceptedLines.length ? `, ${acceptedLines.length} accepted` : ""})`,
  ];
  if (findingBlocks.length) lines.push("", "Teaching gaps — majority-agreed (review & fix, or accept):", ...findingBlocks);
  if (acceptedLines.length) lines.push("", "Accepted deviations:", ...acceptedLines);
  if (offNotes.length) lines.push("", "Off-rubric notes (advisory, non-blocking):", ...offNotes.map((o) => `  note: ${o}`));
  if (!findingBlocks.length) lines.push("", "✓ PASS — every rubric item clear or accepted.");

  return { lines, failedItems, hasFindings: findingBlocks.length > 0 };
}

// ── Orchestrator ──────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const args = parsePerLessonArgs({ concurrency: 2, budget: 4 });
  const panel = argInt("--panel", 3);
  const threshold = Math.floor(panel / 2) + 1; // strict majority
  const accept = loadAccept();
  const { selected, unknown } = selectLessons(args.ids, args.limit);

  if (unknown.length) {
    report([
      `RESULT: CANNOT RUN — unknown lesson id(s): ${unknown.join(", ")}`,
      "",
      `Known lessons: ${parseCatalog()
        .filter((l) => l.id !== "index" && lessonDirsOnDisk().includes(l.id))
        .map((l) => l.id)
        .join(", ")}`,
    ]);
    process.exit(1);
  }
  if (!selected.length) {
    report([`RESULT: CANNOT RUN — no lessons found under ${LESSONS_DIR}/.`]);
    process.exit(1);
  }

  const scope = args.ids.length ? `lessons: ${selected.map((l) => l.id).join(", ")}` : "ALL lessons";

  if (args.dryRun) {
    report([
      "Pedagogy — DRY RUN (no evaluators launched, nothing spent)",
      "teaching-quality panel vs the fixed rubric, READ-ONLY",
      `Lessons selected:    ${selected.length}`,
      `Panel size:          ${panel}  (≥${threshold} must agree for a finding)`,
      `Per-evaluator budget: $${args.budget}  (worst-case ceiling: $${selected.length * panel * args.budget})`,
      `Rubric items:        ${RUBRIC.length}`,
      "",
      "Would review:",
      ...selected.map((l) => `  - ${l.id}  (${gatherLessonFiles(lessonDir(l.id)).filter((f) => f.endsWith(".jsx")).length} teaching files)`),
      "",
      "RESULT: PASS — dry run only. Drop --dry-run to launch the panel.",
    ]);
    return;
  }

  console.log("Pedagogy loop — teaching-quality panel (opus · effort:max), READ-ONLY");
  console.log(`Lessons: ${selected.length} · panel: ${panel} (≥${threshold} agree = finding) · per-evaluator budget: $${args.budget}`);
  console.log(selected.map((l) => l.id).join(", "));
  console.log("\n(Live `<lesson>#<n> · ToolName` markers below.)\n");

  const reports = await runPool<Lesson, LessonReport>(selected, args.concurrency, async (lesson) => {
    const files = gatherLessonFiles(lessonDir(lesson.id)).filter((f) => f.endsWith(".jsx"));
    const panelists = await Promise.all(
      Array.from({ length: panel }, (_, i) =>
        runLoop({
          systemPrompt: systemPrompt(),
          allowedTools: ["Read", "Grep", "Glob"],
          prompt: userPrompt(lesson, files),
          model: "opus",
          effort: "max",
          label: `${lesson.id}#${i + 1}`,
          maxTurns: 200,
          maxBudgetUsd: args.budget,
        }).then((r) => parsePanelist(r.agentSummary)),
      ),
    );
    const result = aggregate(lesson, panelists, panel, threshold, accept[lesson.id] ?? {});
    console.log(`  ✓ ${lesson.id} — ${result.hasFindings ? `${result.failedItems} gap(s)` : "clear"}`);
    return result;
  });

  const totalFailed = reports.reduce((s, r) => s + r.failedItems, 0);
  const lessonsWithFindings = reports.filter((r) => r.hasFindings).length;

  report([
    "Pedagogy — read-only teaching-quality map",
    `Lessons reviewed:    ${selected.length}`,
    `Panel size:          ${panel}  (≥${threshold} agree = finding)`,
    "(read-only — the working tree was not modified)",
    ...reports.flatMap((r) => r.lines),
    "",
    totalFailed === 0
      ? `RESULT: PASS — every reviewed lesson's teaching rubric is clear or accepted (${scope}).`
      : `RESULT: FAIL — ${totalFailed} teaching gap(s) across ${lessonsWithFindings} lesson(s). Fix the prose/labs you agree with, or record an intentional deviation in agents/pedagogy-accept.json, then re-run.`,
  ]);
  if (totalFailed > 0) process.exitCode = 1;
}

main().catch((err: unknown) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
