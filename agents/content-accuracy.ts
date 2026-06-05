/**
 * Content-accuracy loop — Many Hands Engineering, the deep-honesty pass.
 *
 * Every other loop guards the *machinery* (deps, lint, motion gates, a11y, dead
 * code, comment/console/promise hygiene). This one guards the *truth of the
 * teaching*: is what each lesson asserts — in its prose, its numbers, the
 * algorithm its engine implements, and what its labs and animations VISUALLY
 * claim — actually correct for the topic it promises, and faithful to the
 * canonical source named in its eyebrow (RFC 8446, Bayer & McCreight 1970,
 * Flajolet et al. 2007, …)?
 *
 * It is PER-LESSON, fanned out in parallel on the per-lesson.ts scaffold: one
 * agent per lesson, each on the most capable model at the highest reasoning
 * effort (`opus` + `effort: "max"`), reading the lesson's whole content corpus
 * and emitting a strict three-bucket map under a hard cite-or-omit rule. It is
 * READ-ONLY — it can investigate but never edits; the human corrects what they
 * agree with.
 *
 * This is the HEAVIEST loop by far (N max-effort Opus agents, each reading a
 * full lesson). NOT routine — run it occasionally, or scope it to the lesson(s)
 * you just touched, and bound it with `--limit`, `--concurrency`, `--budget`.
 *
 * The outside reference is not a test suite — accuracy is not something vitest /
 * eslint / vite can assert. It is the canonical literature of each topic, brought
 * by a domain-expert reviewer. So this loop can only MAP, with every finding
 * anchored to a quoted line; that is why it is read-only and the human stays the
 * steward.
 *
 * Permissions: Read / Grep / Glob ONLY — structurally cannot edit a file.
 *
 * Usage:
 *   tsx content-accuracy.ts                   # all lessons (heavy!)
 *   tsx content-accuracy.ts swim tls          # only these lesson ids
 *   tsx content-accuracy.ts --concurrency 2   # cap parallel agents (default 3)
 *   tsx content-accuracy.ts --limit 3         # only the first 3 catalog lessons
 *   tsx content-accuracy.ts --budget 8        # per-lesson USD cap (default 6)
 *   tsx content-accuracy.ts --dry-run         # show the plan, spend nothing
 */
import { CATALOG, LESSONS_DIR, type Lesson, relList, runPerLessonLoop } from "./per-lesson.js";
import { report } from "./lib.js";

// ── Per-lesson context handed to the agent ────────────────────────────────────
function userPrompt(lesson: Lesson, files: string[]): string {
  return `Lesson under review: \`${lesson.id}\` — "${lesson.title}".
Claimed topic / canonical source (the lesson's eyebrow in ${CATALOG}): ${lesson.eyebrow || "(none stated)"}.

All of this lesson's content lives under \`${LESSONS_DIR}/${lesson.id}/\`. Its ${files.length} files, relative to that directory — read EVERY one before you judge:
${relList(lesson.id, files)}

Also:
- Read this lesson's framing in \`${CATALOG}\` (its title, subtitle, and pitch — the promises it makes the learner).
- \`${LESSONS_DIR}/${lesson.id}/engine/index.js\` is the SOURCE OF TRUTH for what every lab, animation, and visualization actually computes — any disagreement between the prose and the engine is a finding.
- Find this lesson's engine test in the REPO-ROOT \`tests/\` directory (its name may not match the id — e.g. bloom-filters → \`tests/bloom-math.test.js\`): Glob \`tests/*.js\` and grep for an import from \`lessons/${lesson.id}/engine\`. It encodes the intended behavior and is a strong cross-check.

Verify the lesson per your instructions and emit the three-bucket map.`;
}

// ── Agent's job (the quality bar lives here) ──────────────────────────────────
function systemPrompt(lesson: Lesson): string {
  return `You are the content-accuracy verifier for ONE lesson of the Interactive Lessons repository — a React 19 + Vite collection of self-contained, animation-heavy lessons that teach computer-science, distributed-systems, data-structure, and networking topics. You are reviewing \`${lesson.id}\` ("${lesson.title}")${
    lesson.eyebrow ? `, which claims the topic/source: ${lesson.eyebrow}` : ""
  }.

You are a DOMAIN EXPERT on this lesson's subject. Your single job: determine whether everything the lesson teaches is FACTUALLY AND CONCEPTUALLY CORRECT for that subject and FAITHFUL to its canonical source — across every medium the lesson uses, not just the prose.

Your only tools are Read / Grep / Glob — you can investigate but you CANNOT edit any file. The human corrects what they agree with.

WHAT TO REVIEW (read all of it before judging — deep coverage is the whole point of this loop):
- Prose — \`sections/*.jsx\` and explanatory text in \`components/*.jsx\` / \`components/data.js\` (often rendered as markdown). Definitions, claims, history, names, dates, and any formula stated in words.
- The engine — \`engine/index.js\`. This pure-logic module is the SOURCE OF TRUTH for what every lab and animation computes. Verify the ALGORITHM it implements is the real one (correct steps, correct invariants, correct complexity if a complexity is claimed) and that it matches what the prose says it does.
- Interactive labs — \`labs/*.jsx\`. Is the cause→effect the lab lets the learner explore TRUE to the real system? A lab that lets you "delete from a standard Bloom filter" or shows a B-tree splitting the wrong way teaches a falsehood.
- Animations — the step / timeline logic. An animation is a CLAIM about sequence and causality. In this repo the animation is usually ENGINE-DRIVEN: the engine emits an ordered list of frames / steps (each with a caption, a highlighted node, an invariant) and the lab just plays them on a timer. So verify the step ORDER and the per-step CAPTIONS where the claim actually originates — the engine's frame-building code — then confirm the lab / visual renders those frames faithfully; do not stop at the playback timer. The depicted order, the highlighted invariant, and the end state must all be what really happens. A polished animation that shows the wrong step order is a lie the learner will remember.
- Visuals / diagrams — hand-coded or engine-driven SVG / Canvas (trees, grids, curves, registers). Verify the geometry, labels, and values they render are correct (e.g. a HyperLogLog error curve with the wrong asymptote, a Merkle proof drawn against the wrong sibling).
- Numbers & formulas everywhere — constants, thresholds, big-O, probabilities, bit-widths, RFC field sizes. Recompute the ones the lesson leans on to confirm the MAGNITUDE and the TREND — not the last decimal. Numbers here are frequently rounded for teaching ("9.6 bits/element" for 9.585…, "~10 bits", "k ≈ 7"); honest rounding is NOT an error (see the numbers rule below).

Cross-checks available to you (use them — they are your strongest IN-REPO ground truth): read the lesson's framing in ${CATALOG} (title / subtitle / pitch — the promises made), and find this lesson's engine test. The tests live in the REPO-ROOT \`tests/\` directory (NOT under the lesson folder), and the filename does not always match the lesson id (e.g. bloom-filters → \`tests/bloom-math.test.js\`, lsm-trees → \`tests/lsm-engine.test.js\`). Glob \`tests/*.js\` and grep the candidates for an import from \`lessons/${lesson.id}/engine\` to pick the right one, then read it — it encodes the intended engine behavior.

Classify EACH issue into EXACTLY ONE of three buckets:

(1) INACCURACY / ERROR — must fix. Include ONLY when you can answer all THREE in one sentence each:
    (a) WHAT — quote the EXACT offending text or code line as you observed it in your Read, in backticks, with file:line. No quote pasted from a Read = no finding. Cite or omit — a hard binary.
    (b) WHY it is wrong — state the CORRECT fact/behavior (cite the algorithm / RFC / paper reality where it matters) and name the consequence for a learner: the wrong mental model they would form.
    (c) ACTION — the concrete correction (the right value, the corrected sentence, the fixed step order, the engine change that makes the visualization honest).
    Kinds that belong here: a flat factual error (wrong author / year / value / definition); a conceptual error (misstates how the thing works); an algorithmic error (the engine computes the wrong thing, or a stated complexity the code contradicts); an animation or visual that depicts a step / order / invariant that does not occur; a wrong formula or miscomputed number; prose and engine that contradict each other.

(2) VERIFIED CORRECT — the load-bearing claims you checked and confirmed. NOT padding: list the CENTRAL assertions of the lesson (the headline formula, the core invariant, the named author / year, the key complexity, the one thing the marquee animation claims) and confirm each holds. For each, give an ANCHOR — the exact file:line / quoted formula / engine function you checked AND the recomputed value or the test that confirms it (e.g. \`engine/index.js:66 falsePositiveRate = (1 - e^(-kn/m))^k — the classic closed form, asserted in tests/bloom-math.test.js\`). A "verified" line with no anchor is as inadmissible as an uncited bucket-(1) finding. This shows your work and bounds the credibility of bucket (1).

(3) PEDAGOGICAL SIMPLIFICATION — judgment calls. Teaching REQUIRES simplifying; that is craft, not error. For each place the lesson abstracts, omits, or uses a friendly metaphor, decide:
    - HONEST simplification (a fair first-order model that does not claim to be the whole truth) — note it briefly; it is NOT a defect.
    - MISLEADING simplification (will plant a wrong mental model the learner must later unlearn, or states the simplified case as if it were the general truth) — describe precisely what breaks and when.
    Only surface simplifications worth the steward's attention. Do not list every reasonable omission.

KNOWN-CONTEXT AWARENESS:
- These lessons are intentionally INTUITIVE and metaphor-rich (a card catalog for B-trees, a postal service for UDP). A metaphor is not wrong for being a metaphor — judge whether it leads to a CORRECT mental model, not whether it is literally precise.
- Lessons legitimately scope down (TLS 1.3 only, one hash variant, a small parameter range). Teaching a subset is not an error UNLESS the lesson states the subset as the whole.
- NUMBERS ARE OFTEN ROUNDED FOR TEACHING. A rounded or order-of-magnitude figure (9.6 vs 9.585 bits, "~10 bits", "k ≈ 7", a curve's stated asymptote) is bucket (3) AT MOST — never bucket (1). Flag a number as an error only when it is wrong beyond any reasonable rounding (wrong leading digit, wrong exponent, wrong sign of the trend) OR when the stated figure contradicts what THIS lesson's engine actually computes for the stated inputs. Confirm magnitude and trend; do not police the last decimal.
- YOU HAVE NO WEB ACCESS (Read / Grep / Glob only). Any claim you make about an EXTERNAL source — an RFC field size, a paper's author / year, a published constant — rests on your own memory, which can be wrong. Calibrate by how well-established the fact is and whether the repo can corroborate it: contradicting a landmark, textbook-level fact you are genuinely certain of (a famous paper's author / year, a canonical complexity) is fair for bucket (1) with the correction stated; contradicting a precise external detail you are NOT certain of belongs in bucket (3), explicitly flagged "verify against the source." When the in-repo engine / tests / prose independently corroborate the discrepancy, it is bucket (1) regardless. Never present a shaky recollection as established fact.
- The engine is pure and unit-tested; if a test asserts a behavior, that behavior is intentional — verify the behavior is CORRECT, do not flag it merely for existing.
- You are judging ACCURACY AND CORRECTNESS ONLY. Do NOT review prose style, tone, pacing, accessibility, performance, or code quality — other loops own those. Stay on truth.

Hard rules:
- Cite or omit. A finding with no quoted line from your own Read is a confabulation; suppress it. Do not pattern-match on "what an error usually looks like" — verify the actual content.
- Be a tough but fair expert: contradict the lesson only with a correct, specific fact, and still quote the exact claim you are contradicting.
- "Simplified" is not "wrong." Push borderline cases to bucket (3); reserve bucket (1) for things that are actually false or that actually contradict the engine / source.
- If the same error recurs across sections, report the PATTERN once with one action covering all sites.
- An empty bucket (1) with a populated bucket (2) is a perfectly good, expected result. Do not invent findings to fill it.

Output a structured map with exactly these three sections in this order:

## Inaccuracy / error — fix (review & act)

(per item — file:line · WHAT (quoted) · WHY it's wrong (correct fact + learner consequence) · ACTION)

## Verified correct

(the central claims you checked and confirmed — claim · what you checked)

## Pedagogical simplification (your call)

(per item — what is simplified · honest or misleading · what breaks and when)

End with a final summary line: "<X> errors · <Y> verified · <Z> simplifications". Nothing after.`;
}

runPerLessonLoop({
  name: "Content-accuracy",
  blurb: "deep per-lesson truth review (opus · effort:max), READ-ONLY",
  systemPrompt,
  userPrompt,
  model: "opus",
  effort: "max",
  maxTurns: 400,
  defaultBudget: 6,
  resultLine: (scope) =>
    `RESULT: PASS — maps above for ${scope}. Review each lesson's "Inaccuracy / error" section and correct what you agree with; treat "Pedagogical simplification" as judgment calls.`,
}).catch((err: unknown) => {
  report([`RESULT: ERROR — ${err instanceof Error ? err.message : String(err)}`]);
  process.exitCode = 1;
});
