/**
 * Collection-coherence loop — Many Hands Engineering, the "is it a coherent whole" pass.
 *
 * Every other content loop judges ONE lesson against the world (its prose vs the
 * canon, its labs vs the engine). This one judges each lesson against THE
 * COLLECTION: does it hit the shared "anatomy of a complete lesson" bar, and is
 * it consistent with its siblings (terminology, cross-references)? The reference
 * is the rubric below plus the catalog — not an external source. So, like
 * content-accuracy, it can only MAP, bucketing each shortfall as a real GAP to
 * close vs an INTENTIONAL divergence the collection means to keep (a survey's
 * length, an essay's brevity). The collection is deliberately unique per lesson;
 * the job is to separate identity from inconsistency.
 *
 * Per-lesson, fanned out (opus, max effort), READ-ONLY. Each agent grades its own
 * lesson against the rubric AND greps its siblings for shared terms / cross-refs,
 * so cross-lesson drift surfaces from whichever side first notices it.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 *
 * Usage:
 *   tsx collection-coherence.ts                 # all lessons
 *   tsx collection-coherence.ts swim tls        # only these lesson ids
 *   tsx collection-coherence.ts --concurrency 2 # cap parallel agents (default 3)
 *   tsx collection-coherence.ts --dry-run       # show the plan, spend nothing
 */
import { CATALOG, LESSONS_DIR, type Lesson, relList, runPerLessonLoop } from "./per-lesson.js";
import { report } from "./lib.js";

function userPrompt(lesson: Lesson, files: string[]): string {
  return `Lesson under review: \`${lesson.id}\` — "${lesson.title}".
Its signature line (eyebrow): ${lesson.eyebrow || "(none stated)"}.

All of this lesson's content lives under \`${LESSONS_DIR}/${lesson.id}/\`. Its ${files.length} files, relative to that directory:
${relList(lesson.id, files)}

For THIS loop:
- Read \`sections/*.jsx\` end to end — they carry the hero, the motivating opening, the arc, and the closing/coda.
- Skim \`labs/*.jsx\` for COUNT and whether each is load-bearing (not for engine-honesty — lab-fidelity owns that).
- Read this lesson's framing in \`${CATALOG}\` (eyebrow/title/subtitle/pitch) — the promise it makes.
- CROSS-LESSON: for the shared concepts this lesson leans on (e.g. "quorum", "happens-before", "compaction", "false positive", "tombstone"), Grep \`${LESSONS_DIR}/*/\` to see how SIBLING lessons name and define them, and check any explicit cross-reference this lesson makes ("see the … lesson", a "where to go next" pointer) names a real, correct neighbour.

Grade the lesson against the rubric in your instructions and emit the three-bucket map.`;
}

function systemPrompt(lesson: Lesson): string {
  return `You are the collection-coherence mapper for ONE lesson of the Glassbox repository — a React 19 + Vite collection of self-contained, intentionally-unique lessons. You are grading \`${lesson.id}\` ("${lesson.title}").

Your job: judge whether this lesson meets the COLLECTION's shared bar and is CONSISTENT with its siblings. You are NOT judging factual correctness (content-accuracy owns that), interaction honesty (lab-fidelity owns that), or visual/a11y/perf (other loops own those). Stay on structural completeness + cross-lesson consistency.

Your only tools are Read / Grep / Glob — you can investigate but CANNOT edit a file. The human acts on what they agree with.

THE RUBRIC — anatomy of a complete Glassbox lesson (the bar to grade against):
  1. SIGNATURE HERO — an eyebrow that is a credit / year / promise (never a generic "interactive lesson"/"masterclass"), a display title, a subtitle, and a lede that states the stakes.
  2. A MOTIVATING OPENING — a concrete "what breaks without this / why care" BEFORE the mechanism. The reader should want the answer before getting it.
  3. A LEGIBLE ARC — problem → core idea → mechanism (stepped) → limits & trade-offs → synthesis. Not a rigid template; a recognizable SHAPE. (Unique per lesson, not structureless.)
  4. REAL INTERACTIVE LABS — enough load-bearing interactions that the topic is felt, not just read. (Count varies by topic; you judge "is the interactive surface adequate for this subject", not engine-honesty.)
  5. A CLOSING — a distinct coda that names THE ONE IDEA to carry away and points WHERE TO GO NEXT. Not buried in the last content chapter; not just a decorative footer.

CROSS-LESSON CONSISTENCY (the collection, not the lesson):
  - TERMINOLOGY: a shared concept should be named/defined compatibly across lessons. If this lesson defines a term in a way that contradicts how a sibling defines it (grep to check), that's a coherence gap — name both sites.
  - CROSS-REFERENCES: any "see the X lesson" / "where to go next" pointer must name a real lesson/topic and describe it correctly. A dangling or wrong pointer is a gap.

Classify EACH observation into EXACTLY ONE of three buckets:

(1) GAP — close. A rubric beat MISSING or materially weak, or a cross-lesson inconsistency. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the exact evidence from your Read (the missing/weak beat with file:line, or the two conflicting definitions with both file:lines, or the dangling cross-ref). Cite or omit.
    (b) WHY it's a gap — which rubric beat fails, or which sibling it conflicts with, and the cost to the reader/collection.
    (c) ACTION — the concrete fix (add a motivating opening to §1; give §N a real coda naming the one idea + where-next; reconcile the term with lesson Y; correct the pointer).

(2) MEETS THE BAR — verified. For each rubric beat the lesson HITS, give an ANCHOR — the file:line / quoted line that satisfies it (e.g. \`hero eyebrow "BAYER & McCREIGHT · 1970" — sections/Hero.jsx:12\`, \`coda names the one idea + 4 where-next items — sections/Coda.jsx:30\`). A "meets" line with no anchor is inadmissible. This shows your work.

(3) INTENTIONAL DIVERGENCE (your call). A deliberate difference the collection MEANS to keep — a survey's extra length, an essay's brevity, fewer labs for a quiet topic, a bespoke section grammar. State the ONE-SENTENCE reason it's identity, not a gap. (The test: a difference is intentional only if you can say WHY in a sentence; if the only reason is "that's how it came out", it's a gap, bucket 1.)

KNOWN-CONTEXT AWARENESS:
- The collection is intentionally unique per lesson (per-lesson accent/font/voice/world). Variety of FORM is the point; do not flag a lesson for closing with "Onward" instead of "Coda", or for a distinct section grammar, as long as the BEAT is present.
- A closing can live in sections/ OR components/, be named Coda/Closing/Onward/Synthesis, or be a final section — what matters is the beat (names the one idea + points onward), not the filename.
- Length and lab-count legitimately vary by topic; only flag when a lesson is a stub (a beat genuinely missing) or sprawls without reason — and when it's deliberate, bucket (3) with the why.
- An empty bucket (1) with a populated bucket (2) is the expected, good result. Do not invent gaps.

Hard rules:
- Cite or omit. A gap with no quoted evidence from your own Read is a confabulation; suppress it.
- "Different" is not "deficient." Push deliberate, justifiable differences to bucket (3); reserve bucket (1) for a beat that is actually absent/weak or a real inconsistency.
- If the same gap pattern recurs, report it once with one action.

Output a structured map with exactly these three sections in this order:

## Gap — close (review & act)

(per item — which beat / which inconsistency · WHAT (quoted, file:line) · WHY · ACTION)

## Meets the bar — verified

(per rubric beat hit — beat · the anchor that satisfies it)

## Intentional divergence (your call)

(per item — the difference · the one-sentence reason it's identity not a gap)

End with a final summary line: "<X> gaps · <Y> met · <Z> intentional". Nothing after.`;
}

runPerLessonLoop({
  name: "Collection-coherence",
  blurb: "each lesson vs the shared rubric + sibling consistency (opus · effort:max), READ-ONLY",
  systemPrompt,
  userPrompt,
  model: "opus",
  effort: "max",
  maxTurns: 400,
  defaultBudget: 5,
  resultLine: (scope) =>
    `RESULT: PASS — maps above for ${scope}. Close the "Gap" items you agree with; treat "Intentional divergence" as the collection's deliberate uniqueness to keep.`,
}).catch((err: unknown) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
