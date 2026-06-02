# Interactive Lessons: Agent Notes

## Project shape

- React 19 + Vite single-page app. Eighteen lessons, one shell.
- `src/App.jsx` is the shell: sticky lesson nav, `?lesson=` routing
  (history/popstate, no router lib), and focus management. The landing index is
  a separate component under `src/index-page/`. The lesson registry lives in
  `src/lesson-catalog.js`: a single `lessonMeta` array keyed by `id` (the slug),
  with each lazy `Component` derived from the id via
  `lazy(() => import(\`./lessons/\${id}/index.js\`))`. One source of truth, no
  per-lesson loader to hand-maintain. Lessons lazy-load so the main bundle stays
  small and each lesson ships its own chunk.
- Each lesson is fully self-contained under `src/lessons/<slug>/`: `sections/`
  (prose), `labs/` (interactive widgets), `components/` (lesson-local pieces),
  a pure `engine/index.js`, and its own `<slug>.css`, all wired by a lean
  `<Name>Lesson.jsx` and re-exported from `index.js`.
- `src/shared/` holds only cross-lesson primitives: `tokens.css` (design
  tokens), `utilities.css` (shell-scoped utility classes + the global
  reduced-motion override, imported once from `App.jsx`),
  `usePrefersReducedMotion.js`, `reveal.jsx` (`useRevealRoot` / `useReveal` /
  `<Reveal>`, all reveal-on-scroll), `useScrollSpy.js` (`useScrollSpy` +
  reduced-motion-aware `scrollToId`), `useScrollProgress.js` (0–100 reading-bar
  percent), and `lesson-kit/`, the token-driven structural UI kit (`Callout` /
  `Slider` / `SegmentedControl` / `Stat` / `StatGrid` / `Chip`, themed per lesson
  via the `--lk-*` contract; see `lesson-kit/README.md`). **Engines are colocated
  per lesson at `src/lessons/<slug>/engine/index.js`. There is no
  `src/shared/*-engine.js`.**
- Each lesson ships its own display fonts (via `@import` at the top of its
  `<slug>.css`) and its own CSS class prefix (`hero-`, `iso-`, `cap-`, `swim-`,
  `udp-`, `bf-`, `bc-`, `cf-`, `lsm`, `mw`, `mk-`, `sha-`, `trie-`, `gx-`, `bt-`,
  `hll`, `vp-`, `tls-`). Per-lesson
  visual identity is intentional.

## Lesson grammar

Treat the eighteen lessons as a _collection_, not a _template_. They are
intentionally unique:

| Lesson                  | Accent                          | Display font                  | Personality                                                                |
| ----------------------- | ------------------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| Concurrency Foundations | steel-blue `#9ab8e8`            | Fraunces                      | textbook chapter, cool intellectual rigor                                  |
| The ACID Lab            | teal `#5eead4`                  | EB Garamond + Newsreader      | jurisprudential notebook                                                   |
| CAP & PACELC            | coral `#f87171`                 | Spectral                      | theoretical paper as night observatory                                     |
| SWIM                    | warm rose `#fda4af`             | Cormorant Garamond            | field-naturalist observatory log                                           |
| UDP                     | tangerine `#ff8c42`             | Bricolage Grotesque           | terse engineering console                                                  |
| Bloom Filters           | violet `#c4b5fd`                | Playfair Display + Newsreader | probabilistic editorial                                                    |
| The Bloom Clock         | gold `#f5b942`                  | Instrument Serif              | constellation map of distributed causality                                 |
| The Cuckoo Filter       | signal coral `#ff5c3a`          | Fraunces + IBM Plex           | dark technical journal, restraint through typography                       |
| LSM Trees               | incandescent sediment `#e3582c` | Bitter + Vollkorn             | night survey table of illuminated core samples                             |
| The Weight of Memory    | amber `#f6b545`                 | Instrument Serif              | the magnetic core: each visual transforms when touched                     |
| Merkle Trees            | verdigris patina `#5bc0a3`      | Libre Caslon                  | engraved certificate of authenticity, security printing                    |
| The One-Way Machine     | molten copper `#e07a3c`         | Zilla Slab                    | an engineer's plate; warm near-black, cerise for danger                    |
| Trie                    | pine + vermilion `#46d3a8`      | Fraunces + Hanken             | cartographer's atlas, sea-glass paper and route colours                    |
| gRPC                    | signal cyan `#38ddcb`           | Bricolage Grotesque           | protocol analyzer / signal scope on a dark instrument deck                 |
| B-Trees                 | petrol blue `#4aa3c7`           | Zilla Slab + Libre Franklin   | mid-century library card catalog, oak drawers and ink stamps (light paper) |
| HyperLogLog             | brass `#e3a13c`                 | Big Shoulders + Literata      | dark control-room instrument, phosphor-cyan readout, hot-magenta variance  |
| Vantage-Point Trees     | amber `#ffb454`                 | Big Shoulders + Spectral      | acoustic-ranging sonar scope, abyssal teal ground and amber pings          |
| TLS                     | aqua `#46d6c6`                  | Spectral + Schibsted Grotesk  | cipher channel on a dark switchboard, brass seals, vermilion attacker      |

Shared family glue: dark warm-paper background (`#0a0a0f`), warm parchment ink
(`#e8dec8` family), low-opacity noise grain, `JetBrains Mono` for every numeric
/ credit / eyebrow. The mono is _not_ varied per-lesson. It is the single
strongest piece of connective tissue across the collection.

## Vocabulary

- A page is a **Lesson**.
- An interactive widget inside a lesson is a **Lab**.
- Top-level subdivisions are **Chapters** or **Parts** (Concurrency uses Roman
  numerals).
- Hero eyebrows carry **per-lesson signature lines** (a credit, a year, a
  promise). Never generic phrases like "Interactive lesson" or "Masterclass".

## Editing conventions

- When adding interactive content, extract pure-function logic from React
  render code into the lesson's `engine/index.js` so it can be unit-tested
  independently. `src/lessons/bloom-filters/engine/index.js` (tested in
  `tests/bloom-math.test.js`) is the canonical example. All eighteen lessons now
  follow this. Each engine is pure (no React/DOM), Prettier-clean, and backed by
  a `tests/<lesson>-engine.test.js` suite. Mirror it for any new logic.
- Don't re-implement reveal-on-scroll, TOC scroll-spy, or the reading-progress
  bar per lesson. Use the shared `src/shared/reveal.jsx` (`useRevealRoot` for a
  root that reveals `.rev`/`.reveal` descendants, or `<Reveal base="...">` /
  `useReveal` for self-revealing blocks), `src/shared/useScrollSpy.js`
  (`useScrollSpy(ids, opts)` for the active section, `scrollToId` for
  reduced-motion-aware smooth scroll), and `src/shared/useScrollProgress.js` (the
  0–100 top-bar percent; used by b-trees / hyperloglog / merkle-trees / sha).
- Pure logic is unit-tested in node; component behavior can use the jsdom +
  Testing-Library tier. Add `// @vitest-environment jsdom` at the top of the
  spec (see `tests/index-page.test.jsx`). Engine line/branch coverage is gated
  at 90% in `vite.config.js` (`npm run test:coverage`).
- Honor `prefers-reduced-motion`. CSS `@keyframes`/transitions are already
  neutralized globally by the reduced-motion block in `utilities.css`, so you
  get that for free. For **JS-driven motion** (`requestAnimationFrame` /
  `setInterval`) and **SVG SMIL** (`<animate>`), which that CSS block cannot
  reach, gate always-on/autoplay-on-mount motion with the
  `usePrefersReducedMotion()` hook (`src/shared/usePrefersReducedMotion.js`):
  skip the loop and render a sensible static frame. Motion the user explicitly
  starts (a play button they pressed) may keep animating.
- Use the existing per-lesson class prefix when adding styles; do not bleed
  styles across lesson boundaries. The one sanctioned shared system is
  `src/shared/lesson-kit/`. Its `lk-` classes are token-driven (`--lk-*`), so a
  lesson reproduces its own look by mapping the contract on its root rather than
  by styling another lesson's classes. Reach for the kit first in a **new**
  lesson; the older hand-built lessons keep their bespoke widgets by design (the
  collection is intentionally unique, so adopt the kit only where it is
  pixel-identical, e.g. b-trees' `Callout`).
- ESLint config disables three rules deliberately:
  `react/no-unescaped-entities`, `react/jsx-no-comment-textnodes`, and
  `no-irregular-whitespace`. All three are false-positives in pedagogical
  prose with code samples and Unicode math notation. Do not re-enable.

## Scripts

```sh
npm run dev           # vite dev server
npm run build         # production bundle into dist/
npm run preview       # serve the production bundle
npm test              # vitest run (single pass)
npm run test:coverage # vitest run with v8 coverage (engines gated at 90%)
npm run test:watch    # vitest watch mode
npm run test:e2e      # playwright smoke (boots its own dev server)
npm run lint          # eslint over the source tree
npm run format        # prettier --write
npm run format:check  # prettier --check (CI-friendly)
```

## Many Hands Engineering loops (`agents/`)

`agents/` is a self-contained package of autonomous maintenance loops built on the
Claude Agent SDK (ported in spirit from the `revisionist` app). Each loop is a
deterministic signal → a locked-down agent → a strict cite-or-omit map → a
test-style `PASS/FAIL` report. They only ever **propose**. The human stays the
steward; nothing lands without your review. The package is fully isolated: its TS +
`tsx` toolchain never enters the app graph, and `eslint` / `prettier` / `knip` all
ignore `agents/`.

Run from the app root (one-time: `npm --prefix agents install` + `claude
setup-token` + `cp agents/.env.example agents/.env`):

```sh
npm run loop:deps             # patch-level dependency upgrades, verified green
npm run loop:security         # non-breaking vuln fixes; escalates breaking ones
npm run loop:deadcode         # knip-driven cold-region map (verified)
npm run loop:test-backfill <scope>     # high-value missing-test map (engine coverage)
npm run loop:doc-coherence <scope>     # doc-drift map (.md)
npm run loop:suppression-debt <scope>  # eslint-disable suppressions map
npm run loop:comment-debt <scope>      # TODO/FIXME/HACK/XXX map
npm run loop:debug-cruft <scope>       # leftover console/debugger/.only/.skip map
npm run loop:promise-hygiene <scope>   # floating-promise / async-hazard map
npm run loop:console-runtime <scope>   # console warnings fired during the test run
npm run loop:motion-gate <scope>       # ungated JS/SMIL autoplay-on-mount motion map
npm run loop:style-isolation <scope>   # CSS selectors that leak out of a lesson root
npm run loop:a11y-source <scope>       # source-level a11y debt (names + keyboard paths)
```

The loops verify their work against the app's **outside reference**:
`vitest run` + `eslint .` + `vite build`. For the mutating two, they leave any
survivors uncommitted for you to review. See `agents/README.md` for per-loop detail.

## Known follow-ups

Open items:

- **`?chapter=` deep-linking.** Only `?lesson=` is honored at the shell level;
  each lesson's internal TOC manages its own state and does not sync to the URL.
- **Font loading.** Every lesson `@import`s its display fonts (and JetBrains
  Mono, redundantly) from Google Fonts at the top of its `<slug>.css`: render
  blocking and duplicated 18×. Consolidate (shared mono preconnect/`<link>`,
  per-lesson display faces only) without losing the per-lesson identity.
- **Entry chunk size.** The shared entry bundle is ~212 kB (≈68 kB gzip);
  the index page + `Glyph` ship in it eagerly. Consider lazy-loading the index.

Done (kept so the record stays accurate): engine extraction for **all
eighteen** lessons (incl. `concurrency-foundations`, whose store-buffer machine
now lives in `engine/index.js`) each with a Vitest suite (incl.
`memory`-engine); a jsdom + Testing-Library component tier and v8 coverage gated
at 90% (`vite.config.js`); the single-source lesson registry (`lessonMeta` keyed
by id, no per-lesson loaders); shared `reveal.jsx` + `useScrollSpy.js`
(per-lesson copies removed); `usePrefersReducedMotion` wired through always-on
JS/SMIL motion; aria-labelled sliders and keyboard-operable custom controls; the
full per-lesson `sections/ labs/ components/ engine/` split; unifying every
lesson onto the shared **JetBrains Mono**; SHA's default export renamed to
`ShaLesson`; lint clean (0/0); and the Playwright smoke (`tests/e2e/`, one
headless index ↔ lesson round trip per lesson).

## Repository home

This lesson app is developed as a self-contained project inside the **`zo`**
workspace at `projects/interactive-lessons`. Keep it self-contained: don't
reference workspace-parent paths, and don't commit workspace-level changes
(infra, other projects) from here. (Earlier notes referenced an `arlo`
workspace and a separate standalone repo; the current home is the `zo`
workspace.)
