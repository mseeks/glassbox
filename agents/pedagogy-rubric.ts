/**
 * The pedagogy rubric — the fixed, shared bar the `pedagogy` loop measures every
 * lesson against. THIS FILE IS THE LOOP'S ENTIRE UNIVERSE OF JUDGEMENT: the
 * evaluators may only speak to these named practices, never invent new ones. That
 * bound is what keeps the loop converging to a quiet PASS instead of generating
 * endless taste-driven advice. To raise the bar, add an item here — deliberately.
 *
 * Each item is a concrete, evidence-grounded teaching practice phrased as a binary
 * check ("does the lesson do this, well?"), not a vibe. Edit freely; the loop reads
 * this module and injects it into every evaluator's prompt.
 */
export interface RubricItem {
  /** Stable id used in verdicts + the accept-list (agents/pedagogy-accept.json). */
  id: string;
  /** Short human name for the report. */
  name: string;
  /** The check, phrased for the evaluator. */
  check: string;
}

export const RUBRIC: RubricItem[] = [
  {
    id: "motivation",
    name: "Motivation before mechanism",
    check:
      'A concrete "what breaks without this" / why-it-matters lands BEFORE any machinery, so the reader wants the answer before they are handed it.',
  },
  {
    id: "concrete-first",
    name: "Concrete before abstract",
    check:
      "A specific instance or worked example precedes the general rule, formula, or definition — the lesson does not open cold on the abstraction.",
  },
  {
    id: "scaffold-hard-step",
    name: "The hardest step is scaffolded",
    check:
      'The single most load-bearing idea is built up or shown, not asserted or hand-waved (the tell: "a short argument shows…" / "it can be shown that…" with the argument omitted).',
  },
  {
    id: "name-misconception",
    name: "Names and dispels the misconception",
    check:
      "The intuitive-but-wrong mental model a newcomer is likely to bring is surfaced and explicitly corrected, rather than left to silently mislead.",
  },
  {
    id: "active",
    name: "Active, not just exposition",
    check:
      "At least one lab makes a specific prose claim physical and load-bearing — the reader manipulates or predicts something and sees the consequence — rather than the lesson being read-only exposition.",
  },
  {
    id: "paced",
    name: "One new thing at a time",
    check:
      "Concepts arrive paced: terms are defined before they are used, and the reader is not asked to hold several brand-new ideas at once to follow a sentence.",
  },
  {
    id: "transfer",
    name: "Lands the transfer",
    check:
      "The close names the ONE transferable idea to carry to other problems, not merely a recap of what was covered.",
  },
  {
    id: "signpost",
    name: "Signposted",
    check:
      "The reader can always tell where they are in the arc and why this step follows the last — the lesson's shape (problem → idea → mechanism → limits → synthesis, or its own clear variant) is legible as you read.",
  },
];
