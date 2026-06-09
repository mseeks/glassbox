# Glassbox: Agent Notes

## Project shape

- React 19 + Vite single-page app. A collection of lessons, one shell.
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
  tokens, incl. the family-glue light/dark values keyed on `data-theme`),
  `utilities.css` (shell-scoped utility classes + the global
  reduced-motion override, imported once from `App.jsx`), `theme.js`
  (the pure light/dark precedence model), `useTheme.js` (the store/hook that
  applies it to `<html data-theme>` and tracks the OS), `ThemeToggle.jsx` (the
  System/Light/Dark switch in the nav),
  `usePrefersReducedMotion.js`, `useInViewport.js` (pauses always-on animation
  loops when scrolled off-screen), `reveal.jsx` (`useRevealRoot` / `useReveal` /
  `<Reveal>`, all reveal-on-scroll), `useScrollSpy.js` (`useScrollSpy` +
  reduced-motion-aware `scrollToId`), `useScrollProgress.js` (0–100 reading-bar
  percent), `NavContext.js` + `LessonLink.jsx` (the cross-lesson link primitive:
  a soft-navigating, crawlable `?lesson=<id>` anchor, ink text with an
  accent-tinted underline; the `constellation` loop scans prose for where it
  belongs), and `lesson-kit/`, the token-driven structural UI kit (`Callout` /
  `Slider` / `SegmentedControl` / `Stat` / `StatGrid` / `Chip`, themed per lesson
  via the `--lk-*` contract; see `lesson-kit/README.md`). **Engines are colocated
  per lesson at `src/lessons/<slug>/engine/index.js`. There is no
  `src/shared/*-engine.js`.**
- Each lesson ships its own display fonts (via `@import` at the top of its
  `<slug>.css`) and its own CSS class prefix (`hero-`, `iso-`, `cap-`, `swim-`,
  `udp-`, `bf-`, `bc-`, `cf-`, `lsm`, `mw`, `mk-`, `sha-`, `trie-`, `gx-`, `bt-`,
  `hll`, `vp-`, `tls-`, `bst-`, `sst-`, `pax-`, `sg-`, `tor-`). Per-lesson visual
  identity is intentional. (`bst-` is Binary Trees, distinct from b-trees' `bt-`.)

## Lesson grammar

Treat the lessons as a _collection_, not a _template_. They are
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
| Binary Trees            | blueprint blue `#5fa8cf`        | Syne + Newsreader             | drafting table: graph-paper vellum, blueprint structure, red-pencil path   |
| SSTables                | oxblood `#b1303f`               | Bodoni Moda + Archivo         | letterpress type-specimen; sorted rows locked into an immutable page       |
| Paxos                   | aegean `#2f8fb0`                | Cinzel + Newsreader           | a Greek island assembly carving law in marble; gold for what is chosen     |
| The Saga Pattern        | gold `#dcae4e`                  | Marcellus + Cardo             | illuminated chronicle: gold saga thread, rubric-vermilion compensation     |
| The Swarm               | signal teal `#54d2c1`           | Yeseva One + Sora             | night-sky observatory; peers are points of light, transfers luminous       |

Shared family glue: warm-paper background, warm parchment ink, low-opacity
noise grain, `JetBrains Mono` for every numeric / credit / eyebrow. The mono is
_not_ varied per-lesson. It is the single strongest piece of connective tissue
across the collection.

The collection is **dual-mode**. The shell sets a `data-theme="light"|"dark"`
attribute on `<html>` before first paint and the family-glue paper/ink flips with
it (dark `#0a0a0f` / `#e8dec8` is the default; light is warm paper `#f4efe4` /
warm-black ink). The switch — a System / Light / Dark cycle that follows the OS
until the user picks, then persists their choice — lives in
`src/shared/useTheme.js` + `ThemeToggle.jsx`, with the pure precedence model in
`src/shared/theme.js` and the no-flash pre-paint script in `index.html`. Each
lesson keeps its bespoke palette as its NATIVE mode and ships the complementary
mode as a `[data-theme='…'] .<root>{}` override block in its own `<slug>.css`
(b-trees and merkle-trees are light-native, so their complement is dark; every
other lesson's complement is light). The `theme-parity` loop audits that every
lesson has both.

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
  `tests/bloom-math.test.js`) is the canonical example. Every lesson now follows
  this. Each engine is pure (no React/DOM), Prettier-clean, and backed by
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
npm run audit:contrast # rendered WCAG color-contrast audit, every lesson × light/dark
```

`audit:contrast` (`scripts/contrast-audit.js`) is the dual-theme QA gate: it drives a
headless browser over every lesson + the index in BOTH themes, scroll-reveals the
page so axe-core measures fully-revealed content (not mid-fade), and reports each
failing text/background pair. Run a `npm run preview` server first (defaults to
`http://127.0.0.1:5180`). Like the runtime axe gate it surfaces _candidates_ —
intentional decorative low-contrast (faint eyebrows, ghost chips) is for the human
to keep; information text should clear AA.

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
npm run loop:theme-parity <scope>      # lessons missing a light or dark version of their design
npm run loop:token-hygiene <scope>     # dangling / dead CSS custom properties (the var() knip can't see)
npm run loop:contrast [ids…]           # rendered WCAG color-contrast map, every lesson × light/dark
npm run loop:a11y-source <scope>       # source-level a11y debt (names + keyboard paths)
npm run loop:content-accuracy [ids…]      # deep per-lesson accuracy review (opus·effort:max; heavy)
npm run loop:lab-fidelity [ids…]          # are the labs engine-driven & claim-honest (opus·effort:max; heavy)
npm run loop:collection-coherence [ids…]  # each lesson vs the completeness rubric + sibling consistency (heavy)
npm run loop:visual-sanity [ids…]         # rendered layout-defect map, every lesson × theme × desktop/mobile
npm run loop:constellation                # unlinked cross-lesson mentions → wire <LessonLink> or ignore (drive to PASS)
```

`loop:constellation` is the odd one out in shape: it launches **no agent**. It is a
deterministic, pure-node scan (its "outside reference" is the on-disk sibling set —
`parseCatalog() ∩ lessonDirsOnDisk()`, a filesystem fact) that prints a `PASS/FAIL`
map of prose naming a sibling lesson but rendering it as dead text. You drive it to
green: wire each deliberate pointer with the shared `<LessonLink to="<id>">`, and
record an intentionally-plain or homonym mention in `agents/constellation-ignore.json`.
It is the connective-tissue loop — the one that turns the 23 islands into a graph.

The loops verify their work against the app's **outside reference**:
`vitest run` + `eslint .` + `vite build`. For the mutating two, they leave any
survivors uncommitted for you to review. See `agents/README.md` for per-loop detail.

`loop:content-accuracy` is the exception to that shape: the **deep-honesty pass**.
It is read-only, per-lesson, and fanned out **in parallel** (one `opus` +
`effort:"max"` agent per lesson) to check that each lesson's prose, engine logic,
labs, animations, and visuals are _correct for the topic_ and faithful to its
canonical source. There is no `vitest` outside reference for truth, so it only ever
**maps** (cite-or-omit, with a bucket for honest-vs-misleading pedagogical
simplification); the human fixes what they agree with. It is the heaviest loop, and
not routine. Default is all lessons; pass ids (or `--limit` / `--concurrency` /
`--budget`) to bound it, and `--dry-run` to preview scope and the cost ceiling.
See `agents/README.md`.

`loop:content-accuracy`, `loop:lab-fidelity`, and `loop:collection-coherence` are
the **per-lesson family** — same shape (one opus·max read-only agent per lesson,
cite-or-omit three-bucket map), so they share one scaffold in `agents/per-lesson.ts`
(catalog parse, selection, dry-run, bounded-concurrency fan-out). They differ only
in their outside reference: content-accuracy → the canonical literature of each
topic; lab-fidelity → the lesson's own `engine/` (is each lab really engine-driven
& claim-honest, or faking/dead?); collection-coherence → the shared "anatomy of a
complete lesson" rubric + sibling consistency (does each lesson hit every beat;
are terms/cross-refs consistent across lessons), bucketed intentional-vs-gap.
`loop:visual-sanity` is contrast-shaped instead (build → `vite preview` → measure):
it scrolls every lesson × theme × desktop/mobile and maps real layout breakage
(overflow, broken images, empty mains, stuck reveals) vs intentional full-bleed
atmosphere. Its aesthetic-judgment half (the model _seeing_ the screenshots) is
deferred — the Agent SDK's Read-on-image path is currently unreliable — so it maps
the deterministic breakage today, reliably.

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

Done (kept so the record stays accurate): engine extraction for **all**
lessons (incl. `concurrency-foundations`, whose store-buffer machine
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
workspace at `projects/glassbox`. Keep it self-contained: don't
reference workspace-parent paths, and don't commit workspace-level changes
(infra, other projects) from here. (Earlier notes referenced an `arlo`
workspace and a separate standalone repo; the current home is the `zo`
workspace.)
