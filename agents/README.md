# glassbox-agents

Autonomous maintenance loops for the Glassbox app, built on the
[Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-typescript).

This is a **separate, self-contained package** — its dependencies (the Agent SDK,
`tsx`) never enter the app's dependency graph, and its `tsconfig` is never seen by
the app's lint/build. The app itself is pure JavaScript; this harness happens to be
TypeScript run through `tsx`, kept fully isolated (`eslint`, `prettier`, and `knip`
all ignore `agents/`). The loops operate on the parent app repo (`..`); they only
ever **propose** changes for a human to approve.

> Framework: these are the Many Hands Engineering loops, ported in spirit from the
> [`revisionist`](https://github.com/mseeks/revisionist) app. The human stays the
> **steward** — agents propose, you approve and commit. Trust/track-record is tracked
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
> `vite build`** — the JS-stack equivalent (behavior + the standing static lint gate
> + a real compile/bundle). Style-only `prettier --check` is deliberately excluded:
> a dependency bump can't change our source formatting, and a stray unformatted file
> shouldn't revert a good bump.

## Loops

### `npm run deps` — dependency-patch loop

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
  spec-only drift — a reverted bump that left `1.2.3 → ^1.2.3` is restored to
  pristine rather than reported as a kept upgrade.
- **Cost:** spends Claude tokens, capped per run (`maxBudgetUsd`).

Bounded run for a quick check: `npm run deps -- --limit 2`.

Run from the app root as `npm run loop:deps`, or from here as `npm run deps`.

### `npm run security` — security-patch loop

Same shape, sharper signal. The agent runs `npm audit`, applies **only non-breaking
fixes** (`npm audit fix`; `--force` is structurally blocked by the allowlist), and
**lists breaking-fix / no-fix vulnerabilities for you to decide on** — MHE's
*availability* vs *application*. The harness reports vulnerability totals
before/after, verifies the suite, and reverts on red.

Run from the app root as `npm run loop:security`, or here as `npm run security`.

### `npm run deadcode` — dead-code loop

**Read-only.** The harness runs `knip` (a static analyzer; the dead-code equivalent
of `npm outdated` / `npm audit`) for a deterministic candidate list, and the agent
verifies each with Read/Grep/Glob — ruling out framework / command / config false
positives (e.g. `@playwright/test` used by the e2e suite, `eslint`/plugins wired
through `eslint.config.js`, `jsdom` / `@testing-library/*` via `vite.config.js`, and
the **lazy lessons** loaded by the template-literal dynamic import in
`src/lesson-catalog.js`) — then emits a **cold-region map**.

- **Scope (optional):** pass a path to focus the map; default is whole-repo.
- knip is a pinned devDep + `knip.json` (registers `src/lessons/*/index.js` as
  entries so the lazy lessons aren't false-flagged, and ignores `agents/`).

Run from the app root as `npm run loop:deadcode`, or here as `npm run deadcode`.

### `npm run test-backfill <scope>` — test-backfill loop

**Read-only — scope REQUIRED.** The harness runs `vitest run --coverage` for the
deterministic signal + 90-day per-file churn from `git log`, filters to scope, and
hands a prioritized candidate list to the agent. The agent (Read / Grep / Glob only)
classifies each into **Worth testing / Skip / Hard** with a strict articulate-the-value
bar.

- **The coverage signal is the engines.** glassbox gates coverage on
  `src/lessons/*/engine/**` only (the pure, unit-tested layer); the React/CSS layer
  is covered by the Playwright smoke, not line coverage. So the useful scopes are the
  per-lesson engines, e.g. `src/lessons/bloom-filters/engine/`.

Run from the app root as `npm run loop:test-backfill <scope>`, or here as `npm run test-backfill <scope>`.

### `npm run doc-coherence <scope>` — doc-coherence loop

**Read-only — scope REQUIRED** (file or directory of `.md`). The harness scans for
**mechanical** drift — broken markdown links, backticked file-path mentions that no
longer exist, `` `npm run X` `` mentions whose script is gone — via pure-node regex +
fs checks. The agent verifies each in context and finds **semantic** drift the harness
can't catch, then emits a strict three-bucket map. Known-context: `AGENTS.md`
deliberately keeps a "Done (kept so the record stays accurate)" history list — those
past-tense entries are intentional, not drift.

- **Scope (required):** e.g. `AGENTS.md`, `README.md`, `agents/README.md`.

Run from the app root as `npm run loop:doc-coherence <scope>`, or here as `npm run doc-coherence <scope>`.

### `npm run suppression-debt <scope>` — suppression-debt loop

**Read-only — scope REQUIRED.** The JS adaptation of revisionist's *type-debt* loop.
TypeScript escape hatches (`as any`, `@ts-ignore`, …) don't exist in a pure-JS
codebase — but the loop's spirit does: find every place the static safety net was
deliberately weakened. Here that net is **ESLint**, so the harness sweeps for the
**`eslint-disable` family** (`eslint-disable` / `eslint-disable-line` /
`eslint-disable-next-line` — the direct analog of `@ts-ignore`). The agent (Read /
Grep / Glob only) reads each directive in context and classifies it into **Removable
now / Legitimately needed / Judgment-heavy**, naming the disabled rule each time.

- **Scope (required):** e.g. `src/`, `src/lessons/bloom-filters/`, `src/shared/`.
- Uses **opus** for the clean-scan case (this repo currently has zero inline
  suppressions, and opus stays grounded in what it actually Read rather than
  confabulating plausible-looking findings).

Run from the app root as `npm run loop:suppression-debt <scope>`, or here as `npm run suppression-debt <scope>`.

### `npm run comment-debt <scope>` — comment-debt loop

**Read-only — scope REQUIRED.** The harness sweeps the scope (`.js/.jsx/.mjs/.cjs/.css/.md`)
with pure-node regex for the canonical comment-debt markers — `TODO`, `FIXME`,
`HACK`, `XXX`. The agent reads each in context and classifies into **Action now /
Legitimately kept / Judgment-heavy** under a hard cite-or-omit rule.

- **Scope (required):** e.g. `src/`, `src/lessons/`, `src/shared/`, `tests/`.

Run from the app root as `npm run loop:comment-debt <scope>`, or here as `npm run comment-debt <scope>`.

### `npm run debug-cruft <scope>` — debug-cruft loop

**Read-only — scope REQUIRED.** The harness sweeps the scope (`.js/.jsx/.mjs/.cjs`)
for leftover debug + intentional/forgotten skips — `console.log` / `console.debug` /
`debugger`, plus `.only` (highest severity — silently disables every other test in
the file), `.skip` / `xdescribe` / `xit` / `xtest`, and `.todo`. The agent classifies
into **Delete now / Intentional / Stale-skip**. Known-context: a lesson `engine/*.js`
may legitimately `console.warn` to guard invalid input with a justifying comment (e.g.
the cuckoo-filter power-of-two guard) — that's bucket (2), not cruft.

- **Scope (required):** e.g. `src/`, `src/lessons/`, `tests/`.

Run from the app root as `npm run loop:debug-cruft <scope>`, or here as `npm run debug-cruft <scope>`.

### `npm run promise-hygiene <scope>` — promise-hygiene loop

**Read-only — scope REQUIRED.** The harness combines three pure-node signals over
`.js/.jsx`: `.then(...)` chains without `.catch(...)` in a bracket-depth-aware
10-line lookahead, top-level discarded `new Promise(...)`, and a per-file marker for
files with `async` functions (where the agent samples for floating async-call sites).
The agent classifies into **Action now / Verified safe / Judgment-heavy**.
Known-context: the browser `fetch` doesn't throw on non-2xx; React effects can't be
`async` directly (the async-IIFE-in-`useEffect` pattern); event handlers that fire an
async function discard its promise; engines are pure + synchronous.

- **Scope (required):** e.g. `src/`, `src/lessons/`, `src/shared/`.

Run from the app root as `npm run loop:promise-hygiene <scope>`, or here as `npm run promise-hygiene <scope>`.

### `npm run console-runtime <scope>` — console-runtime hygiene loop

**Read-only — scope REQUIRED** (file or directory of tests). The harness runs
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

### `npm run motion-gate <scope>` — reduced-motion gating loop

**Read-only — scope REQUIRED.** The one class of animation the global
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
asserts "renders, no errors" — this loop is the source-level guard that the
animation actually *freezes*.

- **Scope (required):** e.g. `src/lessons/`, `src/lessons/swim/`.
- Uses **opus** (the autoplay-vs-user-initiated call is judgment-heavy).

Run from the app root as `npm run loop:motion-gate <scope>`, or here as `npm run motion-gate <scope>`.

### `npm run style-isolation <scope>` — CSS leak / lesson-root escape loop

**Read-only — scope REQUIRED.** Each lesson ships its own `<slug>.css` scoped
under a lesson root class (`.bt-root`, `.hll`, `.tls-root`, …); a bare
`:root{}`, `*{}`, or unscoped element selector **leaks into the shell and every
lazily-loaded lesson** (the exact bug `tls.css` and `vp-tree.css` shipped with —
a global `:root{ --ink }` that overrode the shell token after client-side nav).
A brace-aware pure-node walker parses each CSS file (skipping `@keyframes` step
selectors and at-rule preludes) and flags every top-level rule whose comma-parts
contain **no class/id** — i.e. they match globally. The agent classifies into
**Leak (scope it) / Intentionally global / Judgment-heavy**. Known-context:
`src/shared/tokens.css` and `src/shared/utilities.css` are the shell's global
layer by design — never a leak.

- **Scope (required):** e.g. `src/lessons/`, `src/lessons/tls/tls.css`, `src/`.
- Uses **opus** (separating an intentional shell global from a lesson leak).

Run from the app root as `npm run loop:style-isolation <scope>`, or here as `npm run style-isolation <scope>`.

### `npm run a11y-source <scope>` — source-level accessibility loop

**Read-only — scope REQUIRED.** The source-level complement to the runtime axe
gate (`tests/e2e/a11y.spec.js`, which only runs the committed lessons and skips
color-contrast). The harness scans JSX for three high-signal patterns —
`role="img"` elements without an accessible name (the bug that bit b-trees'
`TreeSVG`), `<input>`s without a label/`aria-label`, and `onClick` on a
**non-interactive** element (`<div>`/`<span>`/…) without a keyboard path — using
a small backward scan to attribute a prettier-split `onClick` to its element.
The agent Reads each (names/handlers usually sit on adjacent lines the per-line
scan can't see) and classifies into **Defect (fix) / Properly handled /
Judgment-heavy**. Known-context: decorative SVGs use `aria-hidden`; the shared
lesson-kit `Slider`/`SegmentedControl` auto-supply `aria-label`/`aria-pressed`;
color-contrast is out of scope by design.

- **Scope (required):** e.g. `src/lessons/`, `src/lessons/swim/`.
- Uses **opus** (must resist the prior that a flagged control is unlabeled).

Run from the app root as `npm run loop:a11y-source <scope>`, or here as `npm run a11y-source <scope>`.
