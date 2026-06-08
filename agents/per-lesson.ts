/**
 * Shared scaffold for the PER-LESSON Many Hands Engineering loops.
 *
 * Several loops do the same thing: fan one locked-down, read-only agent out over
 * every lesson (or a chosen subset), in parallel, on the strong model, each
 * emitting a strict cite-or-omit three-bucket map; then frame the maps under
 * per-lesson headers and a single test-style report. `content-accuracy` was the
 * first; `lab-fidelity`, `collection-coherence`, and `visual-sanity` are the
 * same shape. Rather than copy ~200 lines of catalog-parsing, selection,
 * dry-run, and bounded-concurrency orchestration into each, that machinery lives
 * here once. A new per-lesson loop is then just its two prompt builders + a call
 * to `runPerLessonLoop`.
 *
 * Nothing here talks to the SDK or mutates the tree — it composes the read-only
 * `runLoop` from lib.ts. The cite-or-omit discipline and the bucket taxonomy
 * stay in each loop's own system prompt (the quality bar belongs to the loop).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import type { EffortLevel } from "@anthropic-ai/claude-agent-sdk";
import { APP_ROOT, argLimit, report, runLoop } from "./lib.js";

export const LESSONS_DIR = "src/lessons";
export const CATALOG = "src/lesson-catalog.js";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".claude",
  "coverage",
  "dist",
  "test-results",
  "playwright-report",
]);

// A lesson's content is JS/JSX (prose, labs, engine, components) + its scoped CSS.
const SCAN_EXT = /\.(?:js|jsx|mjs|cjs|css)$/;

// ── Args (shared with content-accuracy's flag set) ────────────────────────────
export interface PerLessonArgs {
  ids: string[]; // explicit lesson ids (empty = all lessons)
  concurrency: number;
  budget: number;
  limit: number | null;
  dryRun: boolean;
}

/** Parse `[ids…] [--concurrency N] [--budget N] [--limit N] [--dry-run]`. */
export function parsePerLessonArgs(defaults?: { concurrency?: number; budget?: number }): PerLessonArgs {
  const argv = process.argv.slice(2);
  const ids: string[] = [];
  let concurrency = defaults?.concurrency ?? 3;
  let budget = defaults?.budget ?? 6;
  let dryRun = false;
  // Read a flag's value (`--flag=V` or `--flag V`), without swallowing a
  // FOLLOWING flag as the value.
  const readValue = (a: string, i: number): { value: string | undefined; i: number } => {
    if (a.includes("=")) return { value: a.split("=").slice(1).join("="), i };
    const nxt = argv[i + 1];
    if (nxt !== undefined && !nxt.startsWith("--")) return { value: nxt, i: i + 1 };
    return { value: undefined, i };
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") {
      dryRun = true;
    } else if (a === "--concurrency" || a.startsWith("--concurrency=")) {
      const r = readValue(a, i);
      i = r.i;
      const n = Math.floor(Number(r.value)); // floor BEFORE the guard so 0.5 → 0 → rejected
      if (Number.isFinite(n) && n > 0) concurrency = n;
    } else if (a === "--budget" || a.startsWith("--budget=")) {
      const r = readValue(a, i);
      i = r.i;
      const n = Number(r.value); // budget may be fractional
      if (Number.isFinite(n) && n > 0) budget = n;
    } else if (a === "--limit" || a.startsWith("--limit=")) {
      if (!a.includes("=")) i++; // value parsed by argLimit(); don't mistake it for an id
    } else if (a.startsWith("--")) {
      // unknown flag — ignore (forward-compatible)
    } else {
      ids.push(a);
    }
  }
  return { ids, concurrency, budget, limit: argLimit(), dryRun };
}

// ── Lesson enumeration (the deterministic signal) ─────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  eyebrow: string; // the per-lesson signature line — usually the canonical source/credit
}

/** Read a single-line, quoted object field from a catalog entry block. Handles
 *  both quote styles (an eyebrow may switch to double quotes to carry an apostrophe). */
function field(block: string, name: string): string {
  const m = block.match(new RegExp(`\\b${name}:\\s*(['"])([\\s\\S]*?)\\1`));
  return m ? m[2].trim() : "";
}

/** Parse lesson-catalog.js — the single source of truth — into ordered metadata. */
export function parseCatalog(): Lesson[] {
  const text = readFileSync(resolve(APP_ROOT, CATALOG), "utf8");
  const idRe = /\bid:\s*(['"])([^'"]+)\1/g;
  const marks: { id: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = idRe.exec(text)) !== null) marks.push({ id: m[2], index: m.index });
  const lessons: Lesson[] = [];
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index;
    const end = i + 1 < marks.length ? marks[i + 1].index : text.length;
    const block = text.slice(start, end);
    lessons.push({
      id: marks[i].id,
      title: field(block, "title") || marks[i].id,
      eyebrow: field(block, "eyebrow"),
    });
  }
  return lessons;
}

export function lessonDir(id: string): string {
  return resolve(APP_ROOT, LESSONS_DIR, id);
}

export function lessonDirsOnDisk(): string[] {
  const base = resolve(APP_ROOT, LESSONS_DIR);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name))
    .map((e) => e.name)
    .sort();
}

/** All reviewable source files under a lesson directory, recursively. */
export function gatherLessonFiles(dir: string): string[] {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = resolve(d, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full);
      } else if (SCAN_EXT.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(dir);
  files.sort();
  return files;
}

/** Format a file list relative to a lesson dir (for the per-lesson prompt). */
export function relList(lessonId: string, files: string[]): string {
  return files.map((f) => "  - " + relative(lessonDir(lessonId), f)).join("\n");
}

// ── Bounded-concurrency pool (the per-lesson parallelism) ─────────────────────
export async function runPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  };
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Selection + integrity warnings (shared) ───────────────────────────────────
interface Selection {
  selected: Lesson[];
  warnings: string[];
  unknown: string[];
}

function select(args: PerLessonArgs): Selection {
  const catalog = parseCatalog();
  const onDisk = new Set(lessonDirsOnDisk());
  const valid = catalog.filter((l) => onDisk.has(l.id));
  const catalogIds = new Set(valid.map((l) => l.id));

  const warnings: string[] = [];
  for (const dir of onDisk) {
    if (!catalog.some((l) => l.id === dir)) {
      warnings.push(`orphan: ${LESSONS_DIR}/${dir}/ exists but has no entry in ${CATALOG}`);
    }
  }
  for (const l of catalog) {
    if (l.id !== "index" && !onDisk.has(l.id)) {
      warnings.push(`missing: ${CATALOG} lists '${l.id}' but ${LESSONS_DIR}/${l.id}/ is absent`);
    }
  }

  let selected: Lesson[];
  const unknown = args.ids.filter((id) => !catalogIds.has(id) && !onDisk.has(id));
  if (args.ids.length) {
    selected = args.ids.map((id) => valid.find((l) => l.id === id) ?? { id, title: id, eyebrow: "" });
  } else {
    selected = valid;
  }
  if (args.limit) selected = selected.slice(0, args.limit);
  return { selected, warnings, unknown };
}

// ── The shared orchestrator ───────────────────────────────────────────────────
export interface PerLessonConfig {
  /** Display name for banners/headers, e.g. "Lab-fidelity". */
  name: string;
  /** One-line description of what the loop maps, for the run banner + dry-run. */
  blurb: string;
  /** The locked-down mapper system prompt for one lesson. */
  systemPrompt: (lesson: Lesson) => string;
  /** The per-lesson user prompt (the gathered `files` are passed in). */
  userPrompt: (lesson: Lesson, files: string[]) => string;
  /** Final `RESULT: PASS — …` guidance line. */
  resultLine: (scopeNote: string) => string;
  model?: "opus" | "sonnet" | "haiku";
  effort?: EffortLevel;
  maxTurns?: number;
  defaultBudget?: number;
  defaultConcurrency?: number;
  /** Run ONCE before the fan-out (e.g. build + screenshot capture). */
  prelude?: (selected: Lesson[]) => Promise<void>;
  /** Per-lesson files to hand the agent. Default: the lesson's source tree. */
  gatherFiles?: (lesson: Lesson) => string[];
}

interface LessonResult {
  lesson: Lesson;
  fileCount: number;
  agentRun: string;
  agentSummary: string;
}

/** The whole per-lesson loop: parse args → select → (dry-run | prelude → fan-out
 *  → framed report). Read-only; never mutates the tree. */
export async function runPerLessonLoop(cfg: PerLessonConfig): Promise<void> {
  const args = parsePerLessonArgs({ concurrency: cfg.defaultConcurrency, budget: cfg.defaultBudget });
  const { selected, warnings, unknown } = select(args);
  const gather = cfg.gatherFiles ?? ((l: Lesson) => gatherLessonFiles(lessonDir(l.id)));

  if (unknown.length) {
    report([
      `RESULT: CANNOT RUN — unknown lesson id(s): ${unknown.join(", ")}`,
      "",
      `Known lessons: ${parseCatalog()
        .filter((l) => lessonDirsOnDisk().includes(l.id))
        .map((l) => l.id)
        .join(", ")}`,
    ]);
    process.exit(1);
  }
  if (selected.length === 0) {
    report([`RESULT: CANNOT RUN — no lessons found under ${LESSONS_DIR}/.`]);
    process.exit(1);
  }

  const scopeNote = args.ids.length ? `lessons: ${selected.map((l) => l.id).join(", ")}` : "ALL lessons";

  if (args.dryRun) {
    report([
      `${cfg.name} — DRY RUN (no agents launched, nothing spent)`,
      cfg.blurb,
      `Lessons selected:    ${selected.length}`,
      `Concurrency:         ${args.concurrency}`,
      `Per-lesson budget:   $${args.budget}  (worst-case ceiling: $${selected.length * args.budget})`,
      ...(warnings.length ? ["", "Integrity notes:", ...warnings.map((w) => "  ! " + w)] : []),
      "",
      "Would review:",
      ...selected.map((l) => {
        const n = gather(l).length;
        return `  - ${l.id}  (${n} item${n === 1 ? "" : "s"})${l.eyebrow ? `  ·  ${l.eyebrow}` : ""}`;
      }),
      "",
      "RESULT: PASS — dry run only. Drop --dry-run to launch the review.",
    ]);
    return;
  }

  console.log(`${cfg.name} loop — ${cfg.blurb}`);
  console.log(
    `Lessons: ${selected.length} · concurrency: ${args.concurrency} · per-lesson budget: $${args.budget}`,
  );
  console.log(selected.map((l) => l.id).join(", "));
  if (warnings.length) {
    console.log("\nHarness integrity notes:");
    for (const w of warnings) console.log("  ! " + w);
  }

  if (cfg.prelude) await cfg.prelude(selected);

  console.log("\n(Live `<lesson> · ToolName` markers below.)\n");

  const results = await runPool<Lesson, LessonResult>(selected, args.concurrency, async (lesson) => {
    const files = gather(lesson);
    const { agentRun, agentSummary } = await runLoop({
      systemPrompt: cfg.systemPrompt(lesson),
      allowedTools: ["Read", "Grep", "Glob"],
      prompt: cfg.userPrompt(lesson, files),
      model: cfg.model ?? "opus",
      effort: cfg.effort,
      label: lesson.id,
      maxTurns: cfg.maxTurns ?? 400,
      maxBudgetUsd: args.budget,
    });
    console.log(`  ✓ ${lesson.id} — review complete (${agentRun})`);
    return { lesson, fileCount: files.length, agentRun, agentSummary };
  });

  const blocks: string[] = [];
  for (const r of results) {
    blocks.push(
      "",
      "─".repeat(64),
      `## ${r.lesson.id} — ${r.lesson.title}${r.lesson.eyebrow ? `  ·  ${r.lesson.eyebrow}` : ""}`,
      `(reviewed: ${r.fileCount} item${r.fileCount === 1 ? "" : "s"} · agent: ${r.agentRun})`,
      "",
      r.agentSummary || "(no map produced — see streamed agent output above)",
    );
  }

  report([
    `${cfg.name} — read-only per-lesson map`,
    `Lessons reviewed:    ${selected.length}`,
    `Concurrency:         ${args.concurrency}`,
    `Per-lesson budget:   $${args.budget}`,
    "(read-only — the working tree was not modified)",
    ...(warnings.length ? ["", "Integrity notes:", ...warnings.map((w) => "  ! " + w)] : []),
    ...blocks,
    "",
    cfg.resultLine(scopeNote),
  ]);
}
