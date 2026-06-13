/**
 * Constellation — the cross-lesson link loop.
 *
 * A deterministic, test-suite-shaped loop (no agent, no SDK): it scans every
 * lesson's prose for a passage that NAMES a sibling lesson by a distinctive
 * catalog term but renders it as dead text instead of a <LessonLink>. The
 * collection ships as 23 islands; these are its missing edges.
 *
 * You drive it to green: run it, wire the real pointers with
 * <LessonLink to="<id>">…</LessonLink>, and record any intentionally-plain
 * mention (an incidental or homonym use that should stay prose) in
 * constellation-ignore.json. Re-run until it prints RESULT: PASS.
 *
 * Outside reference: the on-disk sibling set (parseCatalog() ∩ lessonDirsOnDisk()).
 * A term only ever resolves to a link if that lesson's directory actually
 * exists — a filesystem fact the loop cannot fabricate. It will never propose a
 * link to a topic that isn't a real lesson.
 *
 * Scope: sections/ and components/ prose (labs are interactive widgets, skipped).
 * Already-wired <LessonLink> spans are masked out, so a wired mention stops
 * firing and the candidate count drops monotonically as the constellation fills
 * in — the count is the progress meter.
 */
import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { APP_ROOT, report } from "./lib.js";
import { gatherLessonFiles, lessonDir, lessonDirsOnDisk, parseCatalog } from "./per-lesson.js";

const IGNORE_FILE = resolve(APP_ROOT, "agents", "constellation-ignore.json");

// Distinctive terms that, appearing in ANOTHER lesson's prose, point at this
// lesson's subject. Case-sensitive, matched on alnum boundaries. Curated to
// dodge common-English collisions; residual false positives go in the ignore
// file (so a generic "binary tree" aside can be kept as plain prose on record).
const TERMS: Record<string, string[]> = {
  "concurrency-foundations": ["Concurrency Foundations"],
  "acid-lab": ["ACID"],
  "cap-pacelc": ["PACELC", "CAP theorem", "CAP"],
  swim: ["SWIM"],
  udp: ["UDP"],
  "bloom-filters": ["Bloom filters", "Bloom filter", "bloom filter"],
  "bloom-clock": ["Bloom clock", "bloom clock"],
  "cuckoo-filter": ["Cuckoo filter", "cuckoo filter", "cuckoo hashing", "cuckoo"],
  "lsm-trees": ["LSM-tree", "LSM trees", "LSM tree", "LSM"],
  memory: ["The Weight of Memory"],
  "merkle-trees": ["Merkle trees", "Merkle tree", "Merkle root", "Merkle"],
  sha: ["SHA-256", "SHA-1", "SHA-2", "SHA-3", "SHA"],
  trie: ["Trie", "trie"],
  grpc: ["gRPC"],
  "b-trees": ["B-trees", "B-tree", "B+ tree", "B+ trees"],
  hyperloglog: ["HyperLogLog"],
  "vp-tree": ["Vantage-point tree", "vantage-point tree", "VP-tree", "VP tree"],
  tls: ["TLS"],
  "binary-trees": ["Binary search tree", "binary search tree", "Binary tree", "binary tree"],
  sstables: ["SSTables", "SSTable"],
  paxos: ["Paxos"],
  saga: ["Saga pattern", "saga pattern", "Saga"],
  torrents: ["BitTorrent", "bittorrent", "torrents", "torrent"],
};

interface Candidate {
  siblingId: string;
  term: string;
  file: string;
  line: number;
}

function loadIgnore(): Record<string, Record<string, string>> {
  if (!existsSync(IGNORE_FILE)) return {};
  try {
    const parsed: unknown = JSON.parse(readFileSync(IGNORE_FILE, "utf8"));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, Record<string, string>>) : {};
  } catch {
    return {};
  }
}

/** Blank <LessonLink>…</LessonLink> spans and import lines (preserving newlines
 *  so line numbers stay accurate), so wired links and code don't fire. */
function maskNonProse(text: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, " ");
  return text
    .replace(/<LessonLink\b[\s\S]*?<\/LessonLink>/g, blank)
    .replace(/^\s*import\b.*$/gm, blank);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function termRegex(term: string): RegExp {
  // Alnum-boundary match so "trie" ignores "tries"/"entries", while "SHA" still
  // catches the "SHA" in "SHA-256" (the hyphen is a boundary; deduped below).
  return new RegExp(`(?<![A-Za-z0-9])${escapeRe(term)}(?![A-Za-z0-9])`, "g");
}

function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

function main(): void {
  const catalog = parseCatalog();
  const onDisk = new Set(lessonDirsOnDisk());
  const lessons = catalog.filter((l) => l.id !== "index" && onDisk.has(l.id));
  const ignore = loadIgnore();

  const byLesson: { id: string; title: string; hits: Candidate[] }[] = [];
  let total = 0;

  for (const lesson of lessons) {
    const files = gatherLessonFiles(lessonDir(lesson.id)).filter(
      (f) => f.endsWith(".jsx") && !f.includes("/labs/"),
    );
    const ignored = ignore[lesson.id] ?? {};
    const seen = new Set<string>(); // file:line:siblingId — dedupe overlapping terms
    const hits: Candidate[] = [];

    for (const file of files) {
      const masked = maskNonProse(readFileSync(file, "utf8"));
      for (const [siblingId, terms] of Object.entries(TERMS)) {
        if (siblingId === lesson.id || !onDisk.has(siblingId)) continue;
        for (const term of terms) {
          if (Object.prototype.hasOwnProperty.call(ignored, term)) continue;
          const re = termRegex(term);
          let m: RegExpExecArray | null;
          while ((m = re.exec(masked)) !== null) {
            const line = lineAt(masked, m.index);
            const key = `${file}:${line}:${siblingId}`;
            if (seen.has(key)) continue;
            seen.add(key);
            hits.push({ siblingId, term, file: relative(APP_ROOT, file), line });
          }
        }
      }
    }

    hits.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1));
    if (hits.length) {
      byLesson.push({ id: lesson.id, title: lesson.title, hits });
      total += hits.length;
    }
  }

  if (total === 0) {
    report([
      "Constellation — cross-lesson link map",
      "(read-only — every named sibling lesson in prose is wired or recorded as intentionally plain)",
      "",
      "RESULT: PASS — no unlinked cross-lesson mentions.",
    ]);
    return;
  }

  const blocks: string[] = [];
  for (const l of byLesson) {
    blocks.push("", "─".repeat(64), `## ${l.id} — ${l.title}`, "");
    for (const h of l.hits) {
      blocks.push(`  - ${h.file}:${h.line}  ·  "${h.term}"  →  <LessonLink to="${h.siblingId}">`);
    }
  }

  report([
    "Constellation — cross-lesson link map",
    `Unlinked sibling mentions: ${total} across ${byLesson.length} lesson(s)`,
    'Wire each deliberate pointer with <LessonLink to="<id>">…</LessonLink>,',
    "or record an intentionally-plain mention in agents/constellation-ignore.json",
    'as { "<lesson-id>": { "<term>": "why it stays prose" } }.',
    ...blocks,
    "",
    `RESULT: FAIL — ${total} unlinked cross-lesson mention(s). Wire or ignore each, then re-run.`,
  ]);
  process.exitCode = 1;
}

main();
