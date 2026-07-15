# Glassbox

**The black box, made of glass.** A small library of systems lessons you can
poke, prod, and see straight through. It runs locally on Vite and React. The
hardest ideas in computing usually arrive sealed shut, taken on faith. Glassbox
cracks them open.

## The collection

| Lesson                  | Subject                                                         | Accent     | Display             | Credit                            |
| ----------------------- | --------------------------------------------------------------- | ---------- | ------------------- | --------------------------------- |
| Concurrency Foundations | Threads, primitives, patterns, memory models                    | steel-blue | Fraunces            | I–VII                             |
| The ACID Lab            | Atomicity, Consistency, Isolation, Durability                   | teal       | EB Garamond         | A · C · I · D                     |
| CAP & PACELC            | Distributed consistency trade-offs under partition and latency  | coral      | Spectral            | Brewer · Gilbert & Lynch · PACELC |
| SWIM                    | Failure detection + gossip in cluster membership                | warm rose  | Cormorant Garamond  | Das · Gupta · Motivala · 2002     |
| UDP                     | Datagram delivery, loss, duplication, and ordering              | tangerine  | Bricolage Grotesque | RFC 768 · 1980                    |
| Bloom Filters           | Probabilistic set membership at scale                           | violet     | Playfair Display    | Burton H. Bloom · 1970            |
| The Bloom Clock         | Probabilistic causality with constant-size clocks               | gold       | Instrument Serif    | Distributed causality             |
| The Cuckoo Filter       | Probabilistic set membership that also supports deletion        | coral      | Fraunces            | Fan et al. · 2014                 |
| LSM Trees               | Write-optimised storage where time becomes depth                | sediment   | Bitter              | O'Neil et al. · 1996              |
| The Weight of Memory    | From one hand-woven bit to an ocean nobody can picture          | amber      | Instrument Serif    | A history of almost nothing       |
| Merkle Trees            | Tamper-evident data with whisper-sized inclusion proofs         | patina     | Libre Caslon        | Ralph C. Merkle · 1979            |
| The One-Way Machine     | Cryptographic hashing: SHA-1, SHA-2, SHA-3                      | copper     | Zilla Slab          | NIST · FIPS 180                   |
| Trie                    | Prefix trees, drawn so the route is the word                    | pine       | Fraunces            | Edward Fredkin · 1960             |
| gRPC                    | Remote procedure calls: typed contracts on a binary HTTP/2 wire | cyan       | Bricolage Grotesque | Google · 2015                     |
| B-Trees                 | Balanced on-disk index where a node is a whole page             | petrol     | Zilla Slab          | Bayer & McCreight · 1970          |
| HyperLogLog             | Counting distinct items in fixed, tiny memory                   | brass      | Big Shoulders       | Flajolet et al. · 2007            |
| Vantage-Point Trees     | Nearest-neighbour search using only distance                    | amber      | Big Shoulders       | Peter Yianilos · 1993             |
| TLS                     | A private, verified channel across a hostile public wire        | aqua       | Spectral            | IETF · RFC 8446                   |
| Binary Trees            | Search, traversal, balance, and rotation, drawn as plates       | blueprint  | Syne                | A structural study                |
| SSTables                | Immutable sorted tables: one-seek reads and k-way compaction    | oxblood    | Bodoni Moda         | Sorted String Tables              |
| Paxos                   | Consensus on a single value a majority can never take back      | aegean     | Cinzel              | Leslie Lamport · 1998             |
| The Saga Pattern        | Distributed transactions as local commits with compensations    | gold       | Marcellus           | Garcia-Molina & Salem · 1987      |
| The Swarm               | BitTorrent: a crowd that becomes a server, named by its hash    | signal     | Yeseva One          | Bram Cohen · 2001                 |

Each lesson lives under `src/lessons/<slug>/`. It ships its own prose and CSS,
plus a few small interactive labs. They share a common paper (parchment ink,
**JetBrains Mono** for every numeric/credit/eyebrow), but each carries its own
display typography and accent color.

The whole collection is **light/dark**. A System / Light / Dark switch in the nav
sets a `data-theme` attribute on `<html>` — it follows your OS until you pick,
then your choice persists and wins. Every lesson ships a complementary version of
its design for the other mode, so the toggle re-skins the entire site.

Lessons load lazily via `React.lazy`. The entry bundle stays small, and each
lesson's chunk only ships when it's opened.

## Run locally

```sh
npm install
npm run dev
```

Deep-link a specific lesson with the `?lesson=` query parameter, e.g.
`?lesson=swim`.

## Build, test, lint, format

```sh
npm run build         # production bundle into dist/
npm run preview       # serve the production bundle locally
npm test              # run the Vitest suite once
npm run test:coverage # Vitest with v8 coverage (engines gated at 90%)
npm run test:watch    # re-run on change
npm run test:e2e      # Playwright smoke (boots a dev server itself)
npm run lint          # ESLint over the source tree
npm run format        # Prettier write
npm run format:check  # Prettier check (CI-friendly)
```

CI runs lint, `format:check`, the Vitest suite, the production build, and the
Playwright smoke on every push and pull request. The workflow lives in
[`.github/workflows/ci.yml`](./.github/workflows/ci.yml). Node version is pinned
in [`.nvmrc`](./.nvmrc).

## Deploy

The site is hosted on **Vercel** at **https://glassbox.mseeks.me**. Deploys
ride Vercel's git integration: every push to `main` becomes the production
deployment, and every pull request gets a preview URL. There is nothing to run
here.

[`vercel.json`](./vercel.json) carries the two serving rules that matter: the
content-hashed `/assets` are cached for a year (immutable), and unknown paths
fall back to the app shell so a stray deep link or refresh never 404s (routing
is client-side via `?lesson=`). Compression, TLS, and HTML revalidation are
Vercel defaults.

## Layout

Each lesson is fully self-contained under `src/lessons/<slug>/`: prose
`sections/`, interactive `labs/`, lesson-local `components/`, a pure
`engine/index.js`, and its own `<slug>.css`. A lean `<Name>Lesson.jsx` wires
them together. `index.js` re-exports it for the lazy loader.

```
src/
  main.jsx                 entry — mounts <App>
  App.jsx                  shell: sticky nav, ?lesson= routing, focus management
  lesson-catalog.js        the lesson registry (id-keyed metadata; Component
                           derived per id, one source of truth)
  index-page/              the landing index (IndexPage, Glyph, index-page.css)
  shared/
    tokens.css             design tokens (paper, parchment ink, --font-mono;
                           light/dark values keyed on data-theme)
    utilities.css          shell-scoped utility classes + global reduced-motion
    theme.js               pure light/dark precedence model (System/Light/Dark)
    useTheme.js            store/hook: applies the theme to <html>, tracks the OS
    ThemeToggle.jsx        the System/Light/Dark switch parked in the nav
    usePrefersReducedMotion.js   gate JS/SMIL motion (see Design notes)
    reveal.jsx             reveal-on-scroll hooks + <Reveal>
    useScrollSpy.js        active-section spy + reduced-motion scrollToId
  lessons/
    <slug>/
      index.js             re-exports the lesson's default component
      <Name>Lesson.jsx     wires sections + labs into the page
      sections/            prose chapters
      labs/                interactive widgets
      components/          lesson-local building blocks
      engine/index.js      pure, unit-tested logic, no React/DOM (all 23)
      <slug>.css           the lesson's own type + accent system, both modes
tests/
  <lesson>-engine.test.js  Vitest, one suite per engine
  lesson-catalog.test.js   registry shape + query-param resolution
  index-page.test.jsx      jsdom + Testing-Library component test
  e2e/                     Playwright smoke (index ↔ lesson round trips)
```

Every lesson keeps its logic in a pure `engine/index.js`, backed by a Vitest
suite. `src/lessons/bloom-filters/engine/index.js` (tested in
`tests/bloom-math.test.js`) is the canonical example.

## Design notes

See [AGENTS.md](./AGENTS.md) for the lesson grammar (hero eyebrow format,
section numbering, family glue vs. per-lesson personality).
