# The Collection — coherence rubric & scorecard (PROPOSAL)

> **Status: draft for discussion. No lesson or code changes were made to produce
> this.** It exists to make one decision possible: _what does "the same level"
> mean_, and which differences between lessons are **intentional identity** vs
> **uneven quality**. Everything below is a starting point to argue with, not a
> verdict.

The 23 lessons were authored independently and vary ~3–5× in prose length, ~12×
in engine size, and ~20× in test depth. Some of that is the point (a survey
_should_ be longer than an essay); some is just whichever bar the author hit that
day. You can't level a collection you can't see side-by-side, so this doc is the
mirror: a shared bar, then every lesson measured against it.

---

## 1. The bar — anatomy of a complete Glassbox lesson

A lesson is **complete** when it has all of these. (The first group is the
_pedagogy_; the second is the _craft_, now largely enforced by the MHE loops.)

**Pedagogy — the part that varies today**

1. **Signature hero** — eyebrow that is a credit / year / promise (never
   "Interactive lesson"), a display title, a one-line subtitle, a lede that
   states the stakes. _(AGENTS.md already mandates this.)_
2. **A motivating opening** — a concrete "what breaks without this / why should I
   care" _before_ any mechanism. The reader should want the answer before they
   get it.
3. **A legible arc** — problem → core idea → mechanism (stepped) → limits &
   trade-offs → synthesis. Not a rigid template; a recognizable _shape_. The
   collection is meant to be unique per lesson, **not** structureless.
4. **Real interactive labs** — each lab makes _one_ claim physical and is driven
   by the lesson's engine (not a static diagram). Count is allowed to vary by
   topic; "is it actually interactive and load-bearing" is not.
5. **A closing** — a coda that names _the one idea to carry away_ and points
   where to go next. **This is the single most common gap today (≈9 lessons).**

**Craft — now mostly uniform (verified by the loops)**

6. **Pure engine + tests** — `engine/index.js`, ≥90% covered. (Uniform; _depth_
   still varies — see the scorecard.)
7. **Family glue** — JetBrains Mono for numerics/credits/eyebrows, both light &
   dark themes, reduced-motion gating, AA contrast, scoped CSS, keyboard a11y.
   _(All green as of the latest loop sweep.)_
8. **A sane length band** — target ≈ 8–16 reading-minutes, with **declared**
   exceptions (a survey or an essay can opt out, on purpose, in writing).

---

## 2. Intentional uniqueness vs quality gap — how to tell them apart

This is the whole game. The same metric can be either, depending on intent:

| Looks like a difference               | **Intentional identity** (keep)                    | **Quality gap** (close)                           |
| ------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| Per-lesson accent / font / world      | always — it's the point                            | —                                                 |
| Long (concurrency 34 min, udp 48 min) | a _survey_ or _history_, declared as such          | a lesson that sprawled because no one edited it   |
| Short (memory 6 min)                  | a tight _essay_, declared as such                  | a stub that never got its mechanism or labs       |
| Few labs (paxos/saga/trie = 4)        | topic has fewer natural interactions               | a topic that _begs_ for interaction and got prose |
| Thin engine (cap 42, udp 53 LOC)      | genuinely little pure logic to extract             | rich logic left un-extracted / untestable         |
| No coda                               | **never intentional** — every lesson earns a close | the gap                                           |

**Rule of thumb:** a difference is _intentional_ only if someone can say, in one
sentence, _why_ — and that sentence belongs in the lesson's own notes. If the
only answer is "that's just how it came out," it's a gap.

---

## 3. Scorecard (deterministic columns measured; judgment columns are the audit's job)

Clusters and tiers below are a **first-pass proposal** to ratify. `words` is
section-prose only (a rough proxy; the audit refines it); `read` ≈ words ÷ 200;
`coda?` is by section filename (so it _undercounts_ — some lessons close inline).

| Lesson                  | Cluster              | Tier         | secs | labs | ~words | read | engLOC | tests | coda? |
| ----------------------- | -------------------- | ------------ | ---: | ---: | -----: | ---: | -----: | ----: | :---: |
| binary-trees            | data-structures      | Foundational |   10 |    9 |   1789 |    9 |    394 |    56 |   ✓   |
| b-trees                 | data-structures      | Intermediate |   10 |    8 |   1913 |   10 |    302 |    32 |   ✓   |
| trie                    | data-structures      | Intermediate |   10 |    4 |   2278 |   11 |    113 |    12 |   ✓   |
| vp-tree                 | data-structures      | Intermediate |    8 |    5 |   1992 |   10 |    394 |    39 |   —   |
| bloom-filters           | probabilistic        | Foundational |   14 |    6 |   2537 |   13 |     80 |    14 |   —   |
| cuckoo-filter           | probabilistic        | Intermediate |    9 |    6 |   2408 |   12 |    159 |    18 |   —   |
| hyperloglog             | probabilistic        | Intermediate |    9 |    7 |   1857 |    9 |    121 |    28 |   ✓   |
| bloom-clock             | probabilistic        | Advanced     |   11 |    7 |   3950 |   20 |     88 |     9 |   —   |
| memory                  | storage              | Foundational |    7 |    5 |   1275 |    6 |     43 |     9 |   ✓   |
| lsm-trees               | storage              | Intermediate |   10 |    8 |   2498 |   12 |    186 |    25 |   ✓   |
| sstables                | storage              | Advanced     |    6 |    5 |   1995 |   10 |    394 |    45 |   —   |
| sha                     | hashing-integrity    | Foundational |   10 |    6 |   3013 |   15 |    229 |    14 |   ✓   |
| merkle-trees            | hashing-integrity    | Intermediate |   12 |    7 |   2856 |   14 |     93 |    10 |   ✓   |
| concurrency-foundations | concurrency-txn      | Foundational |   25 |    1 |   6885 |   34 |     67 |     8 |   —   |
| acid-lab                | concurrency-txn      | Intermediate |    5 |    2 |   1818 |    9 |    321 |    10 |   ✓   |
| saga                    | concurrency-txn      | Advanced     |   10 |    4 |   2571 |   13 |    379 |    31 |   ✓   |
| cap-pacelc              | consensus-membership | Advanced     |   11 |    6 |   3871 |   19 |     42 |     6 |   —   |
| swim                    | consensus-membership | Advanced     |   10 |    6 |   2530 |   13 |    189 |    12 |   —   |
| paxos                   | consensus-membership | Advanced     |    9 |    4 |   1614 |    8 |    252 |    23 |   ✓   |
| udp                     | networking-rpc       | Foundational |   11 |   \* |   9623 |   48 |     53 |     3 |   —   |
| tls                     | networking-rpc       | Intermediate |    9 |    7 |   1753 |    9 |    228 |    37 |   ✓   |
| grpc                    | networking-rpc       | Intermediate |    7 |    6 |   2212 |   11 |    163 |    32 |   ✓   |
| torrents                | networking-rpc       | Advanced     |   11 |    9 |   2002 |   10 |    495 |    59 |   ✓   |

`*` udp keeps its labs in `components/`, not `labs/` — itself a small structural
inconsistency worth normalizing.

---

## 4. What the data already says (before any reading)

- **Closings are the cheapest, highest-signal fix.** ≈9 lessons have no named
  closing section (bloom-filters, cuckoo, bloom-clock, sstables, cap-pacelc,
  swim, vp-tree, concurrency, udp). A consistent "the one idea + where next"
  coda is a small, uniform win that immediately raises the floor.
- **Engine depth ↔ test depth ↔ topic richness are mismatched in places.**
  cap-pacelc (42 LOC / 6 tests) and udp (53 / 3) and concurrency (67 / 8) and
  bloom-clock (88 / 9) are thin where the topic is rich — candidates for "is the
  interactive core under-built, or genuinely simple?" swim is rich in prose but
  light in tests (189 / 12).
- **Two declared outliers, not gaps:** concurrency (survey, 34 min) and udp
  (history/console, 48 min). These should _stay_ long — but say so in writing.
- **Structure varies but isn't chaos.** Most lessons are 9–12 sections / 5–7
  labs. The outliers (acid 5/2, sstables 6/5, concurrency 25/1) are each
  arguably intentional — the audit confirms.

---

## 5. The progression question — defer it, let the data decide

Don't commit to a tree yet; you don't have the dependency data. The scorecard's
**tier** + **cluster** + a future **prerequisites** column produce exactly that
data. Two cheap, reversible steps toward an answer, in order:

1. **Add `tier` + `tags` to `lesson-catalog.js`** (pure metadata, no UI). Lets
   the index _group_ and _filter_ — surfaces a suggested reading order without
   committing to a tree. ~30 min, fully reversible.
2. **Only if clean prerequisite chains emerge** (e.g. merkle → torrents,
   acid → saga, concurrency → cap → paxos), graduate to a real progression
   graph. If instead it's 7 loosely-coupled clusters (likely), **tags + a
   "start here" path beats a tree** and costs far less.

My read: this is a _clustered collection_, not a strict curriculum, so tags +
one or two suggested paths will feel better than a dependency tree. But that's a
hypothesis the prerequisites data should confirm.

---

## 6. Proposed path — smallest steps first

1. **Ratify this bar** (§1) and the intentional-vs-gap test (§2). One
   conversation. Nothing ships until the bar is agreed.
2. **Normalize the one universal gap: closings.** Give every lesson a coda in
   its own voice (the one idea + where next). Uniform shape, per-lesson texture —
   the exact "coherent but separate" target, at the lowest risk.
3. **Stand up a `collection-coherence` MHE loop** (sketch in §7) to fill the
   judgment columns — arc completeness, lab load-bearingness, motivation, and an
   _intentional-vs-gap_ verdict per lesson, cite-or-omit. Read-only; it maps, you
   fix.
4. **Close gaps lesson-by-lesson**, worst-first off the loop's map, each as its
   own small reviewable change.
5. **Add `tier` + `tags` metadata**; revisit tree-vs-paths with real prerequisite
   data.

---

## 7. Sketch — a `collection-coherence` MHE loop

Same shape as the existing read-only loops (`content-accuracy`, `theme-parity`):
deterministic signal → one locked-down `opus` agent per lesson → strict
cite-or-omit map. Per lesson it would emit:

- the §1 checklist, each item **present / thin / missing** with a quoted cite;
- the arc shape it actually follows, and where it breaks;
- each lab rated **load-bearing / decorative / static-that-should-be-live**;
- a proposed **tier**, **cluster**, and **prerequisites**;
- and the key call: each shortfall bucketed **intentional identity** (keep, with
  the one-sentence why) vs **quality gap** (close, with the smallest fix).

Output is one collection-wide table — this scorecard, with the judgment columns
filled — that turns "they feel uneven" into a worst-first punch-list.

---

_Appendix — method: metrics gathered read-only from the source tree (section /
lab file counts, section-prose word counts, `engine/index.js` LOC, `it()`/`test()`
counts in each engine suite, closing-section filename detection). Clusters &
tiers are the author's first-pass proposal. No lesson or code was modified._
