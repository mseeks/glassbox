# glassbox-agents

Autonomous maintenance loops for the Glassbox app, built on the
[Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-typescript).

This is a **separate, self-contained package**. Its dependencies (the Agent SDK,
`tsx`) never enter the app's dependency graph, and its `tsconfig` is never seen by
the app's lint/build. The app itself is pure JavaScript; this harness happens to be
TypeScript run through `tsx`, kept fully isolated (`eslint`, `prettier`, and `knip`
all ignore `agents/`). The loops operate on the parent app repo (`..`). They only
ever **propose** changes for a human to approve.

> Framework: these are the Many Hands Engineering loops, ported in spirit from the
> [`revisionist`](https://github.com/mseeks/revisionist) app. The human stays the
> **steward**. Agents propose, you approve and commit. Trust/track-record is tracked
> manually for now; pacing (CI/cron), earned auto-merge, and persistent signal state
> come later, on purpose. The fidelity is in the *shape* of each loop, not the
> technology underneath it.

## Setup (once)

```bash
npm install            # in this directory
claude setup-token     # mint a Claude Code OAuth token (uses your subscription)
cp .env.example .env   # then paste the token into .env
```

The loops authenticate with your **Claude Code subscription (OAuth)**, not an API
key. Ensure `ANTHROPIC_API_KEY` is unset, or the SDK would use it instead.

> **The outside reference.** Where the revisionist loops verified against
> `vitest + nuxt typecheck`, these verify against **`vitest run` + `eslint .` +
> `vite build`**: the JS-stack equivalent (behavior + the standing static lint gate
> + a real compile/bundle). Style-only `prettier --check` is deliberately excluded.
> A dependency bump can't change our source formatting, and a stray unformatted file
> shouldn't revert a good bump.

## Loops

### `npm run deps`: dependency-patch loop

The agent finds patch-level upgrades itself (`npm outdated` + `npm view`), applies
the safe ones with `npm install`, verifies each against `vitest run` + `eslint .` +
`vite build`, reverts any that go red, and leaves the survivors as **uncommitted**
changes for you to review (`git diff`) and commit. It always ends with a test-style
`RESULT: PASS / FAIL`.

- **Blast radius:** changes dependencies only through `npm install` (no file-edit
  tool is granted); hard-denied from commit / push / publish / reading `.env`.
- **Permissions (SDK-native):** `permissionMode: 'dontAsk'` + a small Bash
  allowlist; read-only tools (Read / Grep / Glob / WebFetch) are free.
- **Safety net:** an independent harness re-run of the suite is the final guardrail,
  and it reverts everything if the tree ends up red. The harness also normalizes
  spec-only drift. A reverted bump that left `1.2.3 → ^1.2.3` is restored to
  pristine rather than reported as a kept upgrade.
- **Cost:** spends Claude tokens, capped per run (`maxBudgetUsd`).

Bounded run for a quick check: `npm run deps -- --limit 2`.

Run from the app root as `npm run loop:deps`, or from here as `npm run deps`.

### `npm run security`: security-patch loop

Same shape, sharper signal. The agent runs `npm audit`, applies **only non-breaking
fixes** (`npm audit fix`; `--force` is structurally blocked by the allowlist), and
**lists breaking-fix / no-fix vulnerabilities for you to decide on**: MHE's
*availability* vs *application*. The harness reports vulnerability totals
before/after, verifies the suite, and reverts on red.

Run from the app root as `npm run loop:security`, or here as `npm run security`.

### `npm run deadcode`: dead-code loop

**Read-only.** The harness runs `knip` (a static analyzer; the dead-code equivalent
of `npm outdated` / `npm audit`) for a deterministic candidate list. The agent then
verifies each with Read/Grep/Glob, ruling out framework / command / config false
positives (e.g. `@playwright/test` used by the e2e suite, `eslint`/plugins wired
through `eslint.config.js`, `jsdom` / `@testing-library/*` via `vite.config.js`, and
the **lazy lessons** loaded by the template-literal dynamic import in
`src/lesson-catalog.js`). From that it emits a **cold-region map**.

- **Scope (optional):** pass a path to focus the map; default is whole-repo.
- knip is a pinned devDep + `knip.json` (registers `src/lessons/*/index.js` as
  entries so the lazy lessons aren't false-flagged, and ignores `agents/`).

Run from the app root as `npm run loop:deadcode`, or here as `npm run deadcode`.

### `npm run test-backfill <scope>`: test-backfill loop

**Read-only. Scope REQUIRED.** The harness runs `vitest run --coverage` for the
deterministic signal + 90-day per-file churn from `git log`, filters to scope, and
hands a prioritized candidate list to the agent. The agent (Read / Grep / Glob only)
classifies each into **Worth testing / Skip / Hard** with a strict articulate-the-value
bar.

- **The coverage signal is the engines.** glassbox gates coverage on
  `src/lessons/*/engine/**` only (the pure, unit-tested layer); the React/CSS layer
  is covered by the Playwright smoke, not line coverage. So the useful scopes are the
  per-lesson engines, e.g. `src/lessons/bloom-filters/engine/`.

Run from the app root as `npm run loop:test-backfill <scope>`, or here as `npm run test-backfill <scope>`.

### `npm run doc-coherence <scope>`: doc-coherence loop

**Read-only. Scope REQUIRED** (file or directory of `.md`). The harness scans for
**mechanical** drift via pure-node regex + fs checks: broken markdown links,
backticked file-path mentions that no longer exist, `` `npm run X` `` mentions whose
script is gone. The agent verifies each in context and finds **semantic** drift the
harness can't catch, then emits a strict three-bucket map. Known-context: `AGENTS.md`
deliberately keeps a "Done (kept so the record stays accurate)" history list. Those
past-tense entries are intentional, not drift.

- **Scope (required):** e.g. `AGENTS.md`, `README.md`, `agents/README.md`.

Run from the app root as `npm run loop:doc-coherence <scope>`, or here as `npm run doc-coherence <scope>`.

### `npm run suppression-debt <scope>`: suppression-debt loop

**Read-only. Scope REQUIRED.** The JS adaptation of revisionist's *type-debt* loop.
TypeScript escape hatches (`as any`, `@ts-ignore`, …) don't exist in a pure-JS
codebase, but the loop's spirit does: find every place the static safety net was
deliberately weakened. Here that net is **ESLint**, so the harness sweeps for the
**`eslint-disable` family**, the direct analog of `@ts-ignore` (`eslint-disable` /
`eslint-disable-line` / `eslint-disable-next-line`). The agent (Read /
Grep / Glob only) reads each directive in context and classifies it into **Removable
now / Legitimately needed / Judgment-heavy**, naming the disabled rule each time.

- **Scope (required):** e.g. `src/`, `src/lessons/bloom-filters/`, `src/shared/`.
- Uses **opus** for the clean-scan case. This repo currently has zero inline
  suppressions, and opus stays grounded in what it actually Read rather than
  confabulating plausible-looking findings.

Run from the app root as `npm run loop:suppression-debt <scope>`, or here as `npm run suppression-debt <scope>`.

### `npm run comment-debt <scope>`: comment-debt loop

**Read-only. Scope REQUIRED.** The harness sweeps the scope (`.js/.jsx/.mjs/.cjs/.css/.md`)
with pure-node regex for the canonical comment-debt markers: `TODO`, `FIXME`,
`HACK`, `XXX`. The agent reads each in context and classifies into **Action now /
Legitimately kept / Judgment-heavy** under a hard cite-or-omit rule.

- **Scope (required):** e.g. `src/`, `src/lessons/`, `src/shared/`, `tests/`.

Run from the app root as `npm run loop:comment-debt <scope>`, or here as `npm run comment-debt <scope>`.

### `npm run debug-cruft <scope>`: debug-cruft loop

**Read-only. Scope REQUIRED.** The harness sweeps the scope (`.js/.jsx/.mjs/.cjs`)
for leftover debug + intentional/forgotten skips: `console.log` / `console.debug` /
`debugger`, plus `.only` (highest severity, since it silently disables every other
test in the file), `.skip` / `xdescribe` / `xit` / `xtest`, and `.todo`. The agent
classifies into **Delete now / Intentional / Stale-skip**. Known-context: a lesson
`engine/*.js` may legitimately `console.warn` to guard invalid input with a justifying
comment (e.g. the cuckoo-filter power-of-two guard). That's bucket (2), not cruft.

- **Scope (required):** e.g. `src/`, `src/lessons/`, `tests/`.

Run from the app root as `npm run loop:debug-cruft <scope>`, or here as `npm run debug-cruft <scope>`.

### `npm run promise-hygiene <scope>`: promise-hygiene loop

**Read-only. Scope REQUIRED.** The harness combines three pure-node signals over
`.js/.jsx`: `.then(...)` chains without `.catch(...)` in a bracket-depth-aware
10-line lookahead, top-level discarded `new Promise(...)`, and a per-file marker for
files with `async` functions (where the agent samples for floating async-call sites).
The agent classifies into **Action now / Verified safe / Judgment-heavy**.
Known-context: the browser `fetch` doesn't throw on non-2xx; React effects can't be
`async` directly (the async-IIFE-in-`useEffect` pattern); event handlers that fire an
async function discard its promise; engines are pure + synchronous.

- **Scope (required):** e.g. `src/`, `src/lessons/`, `src/shared/`.

Run from the app root as `npm run loop:promise-hygiene <scope>`, or here as `npm run promise-hygiene <scope>`.

### `npm run console-runtime <scope>`: console-runtime hygiene loop

**Read-only. Scope REQUIRED** (file or directory of tests). The harness runs
`vitest run --reporter=verbose`, captures the per-test `stderr | <file> > <test>`
emissions vitest prints when a test emits `console.warn` / `console.error`, filters
to scope, and hands each to the agent. The agent Reads both the test file and the
suspected source to trace each emission, then classifies into **Action now /
Intentional / Forgotten leftover** under a hard paired-citation rule. Known-context:
`tests/e2e/` runs under Playwright (excluded from vitest); jsdom "Not implemented"
notices and React `act(...)` warnings from `@testing-library/react` are usually
test-environment artifacts; `tests/setup.js` stubs `matchMedia`.

Different axis from `debug-cruft`: that loop scans source for static console call
sites; this loop catches what actually **fires** during the test run.

- **Scope (required):** e.g. `tests/`, `tests/index-page.test.jsx`.

Run from the app root as `npm run loop:console-runtime <scope>`, or here as `npm run console-runtime <scope>`.

### `npm run motion-gate <scope>`: reduced-motion gating loop

**Read-only. Scope REQUIRED.** The one class of animation the global
reduced-motion block in `src/shared/utilities.css` cannot reach is **JS-driven
motion** (`requestAnimationFrame`, self-re-arming `setInterval` / `setTimeout`)
and **SVG SMIL** (`<animate>` / `<animateTransform>` / `<animateMotion>` /
`<set>`). AGENTS mandates gating *autoplay-on-mount* motion of those kinds with
`usePrefersReducedMotion()`; motion the user explicitly starts may keep
animating. The harness sweeps the scope with pure-node regex and notes per file
whether `usePrefersReducedMotion` is imported; the agent (Read / Grep / Glob)
Reads each hit and classifies it into **Ungated autoplay-on-mount (gate now) /
Gated or user-initiated / Judgment-heavy**. Known-context: CSS `@keyframes` are
out of scope (already neutralized); `useInViewport` pausing is **not**
reduced-motion compliance; a one-shot `setTimeout` (debounce/focus delay) is not
motion. Its outside reference is `tests/e2e/reduced-motion.spec.js`, which only
asserts "renders, no errors". This loop is the source-level guard that the
animation actually *freezes*.

- **Scope (required):** e.g. `src/lessons/`, `src/lessons/swim/`.
- Uses **opus** (the autoplay-vs-user-initiated call is judgment-heavy).

Run from the app root as `npm run loop:motion-gate <scope>`, or here as `npm run motion-gate <scope>`.

### `npm run style-isolation <scope>`: CSS leak / lesson-root escape loop

**Read-only. Scope REQUIRED.** Each lesson ships its own `<slug>.css` scoped
under a lesson root class (`.bt-root`, `.hll`, `.tls-root`, …); a bare
`:root{}`, `*{}`, or unscoped element selector **leaks into the shell and every
lazily-loaded lesson**. That is the exact bug `tls.css` and `vp-tree.css` shipped
with: a global `:root{ --ink }` that overrode the shell token after client-side nav.
A brace-aware pure-node walker parses each CSS file (skipping `@keyframes` step
selectors and at-rule preludes) and flags every top-level rule whose comma-parts
contain **no class/id**, i.e. they match globally. The agent classifies into
**Leak (scope it) / Intentionally global / Judgment-heavy**. Known-context:
`src/shared/tokens.css` and `src/shared/utilities.css` are the shell's global
layer by design, never a leak.

- **Scope (required):** e.g. `src/lessons/`, `src/lessons/tls/tls.css`, `src/`.
- Uses **opus** (separating an intentional shell global from a lesson leak).

Run from the app root as `npm run loop:style-isolation <scope>`, or here as `npm run style-isolation <scope>`.

### `npm run theme-parity <scope>`: light/dark dual-mode coverage loop

**Read-only. Scope REQUIRED.** The theming sibling of `style-isolation`. The
collection is dual-mode: the shell sets a `data-theme="light"|"dark"` attribute on
`<html>` (the switch is `src/shared/useTheme.js` + `ThemeToggle.jsx`; the
family-glue light/dark tokens live in `src/shared/tokens.css`), and each lesson
keeps its bespoke palette as its NATIVE mode while shipping the complementary mode
as a `[data-theme='…'] .<root>{}` override block in its own `<slug>.css`. A lesson
that ships only one mode looks broken in the other (dark text on a dark ground, an
un-recolored hardcoded gradient glowing through a light page). The harness parses
each CSS file with the same brace-aware walker and reports per file: the native
mode (from the root background's luminance), the count of `[data-theme]` override
rules per mode, a literal-color coverage proxy (base vs. theme), and any override
selector that may match GLOBALLY (a `[data-theme='light']` with nothing scoped
after it leaks into the shell + every other lesson, the same hazard
`style-isolation` guards). The agent Reads each and emits a strict three-bucket
map: **Missing/incomplete complementary mode (add or extend) / Verified parity /
Judgment-heavy** (a color deliberately the same in both modes, or inline-styled
JSX colors CSS can't reach).

- Visual parity is not something `vitest` / `eslint` / `vite build` can assert, so
  — like `content-accuracy` — this loop only ever **maps**; the human crafts the
  complementary skin. Every bucket-(1) finding is anchored to a quoted declaration.
- The two light-native lessons (b-trees, merkle-trees) need a DARK complement;
  every dark-native lesson needs a LIGHT one. The shell files
  (`tokens.css` / `utilities.css` / `nav.css`) OWN the global `data-theme` layer
  and are never a gap.
- **Scope (required):** e.g. `src/lessons/`, `src/lessons/tls/tls.css`, `src/lessons/swim/`.
- Uses **opus** (deciding whether a redefined token truly covers a declaration,
  and separating a deliberate theme-invariant color from a real gap, is judgment).

Run from the app root as `npm run loop:theme-parity <scope>`, or here as `npm run theme-parity <scope>`.

### `npm run token-hygiene <scope>`: CSS custom-property integrity loop

**Read-only. Scope REQUIRED.** The CSS-variable complement to the dead-code loop —
the dangling/dead **custom properties** knip cannot see (it only reads JS). After a
theme/token refactor a lesson accrues two faults: a `var(--x)` whose `--x` is defined
nowhere reachable (a rename typo, a cross-lesson reference, a deleted token — it
silently renders nothing or the fallback), and a `--x:` declared on a root that no
rule or inline style ever reads (dead weight). The harness scans every `.css` +
`.jsx`/`.js` in scope (**plus the shell layer and the lesson-kit, always reachable**,
so a `var(--ink)` counts as defined and a lesson's `--lk-accent:` counts as used by
the kit) for declarations (`--x:`) and references (`var(--x)`, incl. inline
`style={{'--x': …}}`), diffs the two sets, and hands the agent the dangling refs +
unused defs with file:line. The agent classifies into **Defect (fix) / Not-a-fault
(a deliberate `var(--x, fallback)`, a cross-boundary token set/read in JS, an `--lk-*`
contract) / Judgment-heavy**.

- **Scope (required):** e.g. `src/lessons/`, `src/lessons/bloom-clock/`, `src/`.
- Uses **opus** (separating a deliberate optional-with-fallback or JS-read token from
  a genuine dangling ref / dead declaration is judgment). `--accent` (set by Nav per
  pill) is whitelisted as cross-boundary.

Run from the app root as `npm run loop:token-hygiene <scope>`, or here as `npm run token-hygiene <scope>`.

### `npm run contrast [lesson-ids…]`: rendered color-contrast loop

**Read-only. The legibility gate, judged on the RENDERED page.** `a11y-source` (the
runtime axe gate) deliberately *excludes* color-contrast because the lessons use
intentional artistic low-contrast; this is the loop that **does** measure it — but as
a curated map, so decoration is kept and information text is fixed. Contrast can only
be judged on the real cascade + computed colors + the `data-theme` switch, so — like
`console-runtime` (which boots vitest) — the harness is **self-contained**: it builds
the app, boots `vite preview`, runs the reveal-aware axe sweep
(`scripts/contrast-audit.js` — every lesson × light/dark, scroll-revealed so below-fold
content isn't measured mid-fade), tears the server down, and collapses the failing
DOM nodes into **distinct foreground/background pairs**. The agent Reads each and
classifies into **Fix to AA (sub-AA information text) / Intentional decorative (faint
eyebrows, ghost chips, the dark originals' soft labels — keep) / Judgment-heavy**
(borderline small text, labels on data swatches, semantic constants).

- **No `<scope>`; default is the whole site (both themes).** Pass lesson ids to map a
  subset: `npm run contrast swim tls`. Needs no running server — it builds + previews
  itself (port 5191).
- **Read-only; it only ever maps.** Visual fixes are the human's (or a redesign
  workflow's) job — AA is not something `vitest`/`eslint`/`vite build` can assert, so
  this is the standing legibility guardrail next to `theme-parity` (coverage) and
  `token-hygiene` (variable integrity).
- Uses **opus** (separating intentional artistic low-contrast from a real defect is
  the crux judgment).

Run from the app root as `npm run loop:contrast [ids…]`, or here as `npm run contrast [ids…]`.

### `npm run a11y-source <scope>`: source-level accessibility loop

**Read-only. Scope REQUIRED.** The source-level complement to the runtime axe
gate (`tests/e2e/a11y.spec.js`, which only runs the committed lessons and skips
color-contrast). The harness scans JSX for three high-signal patterns:
`role="img"` elements without an accessible name (the bug that bit b-trees'
`TreeSVG`), `<input>`s without a label/`aria-label`, and `onClick` on a
**non-interactive** element (`<div>`/`<span>`/…) without a keyboard path. To do it,
the harness uses a small backward scan to attribute a prettier-split `onClick` to its
element. The agent Reads each (names/handlers usually sit on adjacent lines the
per-line scan can't see) and classifies into **Defect (fix) / Properly handled /
Judgment-heavy**. Known-context: decorative SVGs use `aria-hidden`; the shared
lesson-kit `Slider`/`SegmentedControl` auto-supply `aria-label`/`aria-pressed`;
color-contrast is out of scope by design.

- **Scope (required):** e.g. `src/lessons/`, `src/lessons/swim/`.
- Uses **opus** (must resist the prior that a flagged control is unlabeled).

Run from the app root as `npm run loop:a11y-source <scope>`, or here as `npm run a11y-source <scope>`.

### `npm run content-accuracy [lesson-ids…]`: content-accuracy loop

**Read-only. The deep-honesty pass, and by far the heaviest loop.** Every other
loop guards the *machinery*; this one guards the *truth of the teaching*. Is what
each lesson asserts (in its prose, its numbers, the algorithm its `engine/`
implements, and what its **labs and animations visually claim**) actually correct
for the topic it promises, and faithful to the canonical source named in its
eyebrow (RFC 8446, Bayer & McCreight 1970, Flajolet et al. 2007)?

Unlike the scope-required mappers, this loop is **per-lesson and runs the lessons
in parallel**: one agent per lesson on the most capable model at the highest
reasoning effort (**`opus` + `effort: "max"`**). Each agent reads the lesson's whole
content corpus (`sections/` prose, `labs/` interactives, the pure `engine/index.js`
that drives every visualization, `components/`, the engine's test, and the catalog
framing) and emits a strict three-bucket map: **Inaccuracy/error (cite-or-omit) /
Verified correct / Pedagogical simplification (honest vs misleading)**. The hard
discipline is the last bucket. A deliberate teaching simplification is *not* a bug,
and the prompt is built to keep the agent from flagging it as one.

- **No `<scope>`; default is all lessons** (the deliberate inversion of the other
  loops, since this one fans out per lesson). Pass lesson ids to review a subset:
  `npm run content-accuracy swim tls`. Bound a run with `--limit N`,
  `--concurrency N` (default 3), and `--budget N` (per-lesson USD cap, default 6).
  Preview scope and the cost ceiling first with `--dry-run`, which launches nothing.
- **Read-only. Read / Grep / Glob only;** structurally cannot edit. The human
  corrects what they agree with. There is no verify-and-revert here. Accuracy is not
  something `vitest` / `eslint` / `vite` can assert, so the "outside reference" is the
  canonical literature of each topic, brought by a domain-expert reviewer. Every
  finding is anchored to a quoted line, which is *why* it only ever maps.
- **Heavy and occasional.** N max-effort Opus agents, each reading a full lesson;
  cost scales with lesson count (worst case is lessons × budget). It is **not** a
  routine loop. Run it to stay honest, or scope it to the lesson(s) you just touched.
- Uses **opus** at **`effort: "max"`** (a wrong accuracy call is the most expensive
  false positive of any loop, so it gets the deepest reasoning available).

Run from the app root as `npm run loop:content-accuracy [ids…]`, or here as `npm run content-accuracy [ids…]`.
