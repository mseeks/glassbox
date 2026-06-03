# Lesson kit

Shared, **token-driven** structural UI primitives for the lessons. This is the
shared system AGENTS anticipated ("do not bleed styles across lesson boundaries
_until/unless we extract a shared system_").

The collection is intentionally a _collection, not a template_: each lesson owns
its colors, display font, and personality. So the kit ships **one DOM shape and
one base stylesheet**. Every visual decision is a CSS custom property a lesson
sets on its root. A lesson keeps its identity. The kit just removes the
boilerplate of re-implementing the same widget structure.

The mono is never tokenized. It stays the family-glue `--font-mono`
(JetBrains Mono), the single strongest piece of connective tissue.

## Usage

```jsx
import { Callout, Slider, SegmentedControl, Stat, StatGrid, Chip } from '../../shared/lesson-kit/index.js';

// On the lesson root, map the contract to the lesson's own palette:
// .my-root { --lk-accent: var(--accent); --lk-ink-dim: var(--ink-2); ... }

<Callout label="The one rule">A node never grows at the leaves.</Callout>
<Slider label="Precision p" value={p} display={`p=${p}`} min={4} max={14} onChange={setP} />
<SegmentedControl options={['paint', 'numbers']} value={mode} onChange={setMode} ariaLabel="Mode" />
<StatGrid cols={3}>
  <Stat value={height} label="height" />
  <Stat value={keys} label="keys filed" valueColor="var(--accent)" />
</StatGrid>
<Chip>pages read: {n}</Chip>
```

## Token contract

Every token falls back to a family-glue default, so the kit renders sensibly
with zero setup and a lesson overrides only what it needs.

| Token              | Purpose                          | Fallback         |
| ------------------ | -------------------------------- | ---------------- |
| `--lk-accent`      | primary accent                   | `--ink`          |
| `--lk-accent-tint` | low-alpha accent wash for fills  | `--rule-soft`    |
| `--lk-ink`         | body text                        | `--ink`          |
| `--lk-ink-dim`     | secondary text                   | parchment · 0.72 |
| `--lk-ink-faint`   | tertiary / labels                | parchment · 0.45 |
| `--lk-panel`       | raised surface                   | `--rule-soft`    |
| `--lk-rule`        | hairline border                  | `--rule`         |
| `--lk-radius`      | corner radius                    | `10px`           |
| `--lk-display`     | display face for numerics/values | `inherit`        |

Per-component metric knobs (also tokens, optional): `--lk-callout-bar`,
`--lk-callout-pad`, `--lk-callout-radius`, `--lk-stat-cols`, `--lk-seg-gap`, and
more. See `lesson-kit.css` for the full set. Setting these lets a lesson
reproduce a bespoke look pixel-for-pixel while still sharing the component.

## Components

- **`<Callout label>`**: accent-barred, tinted aside with a mono label.
- **`<Slider label value display min max step onChange ariaLabel>`**: a labelled
  range with a value readout and a guaranteed accessible name.
- **`<SegmentedControl options value onChange ariaLabel>`**: mutually-exclusive
  pills; `options` is `[{value,label}]` or `[value,…]`; carries `aria-pressed`.
- **`<Stat value label valueColor>` / `<StatGrid cols>`**: value plus label
  readout cells in a grid.
- **`<Chip>`**: a small mono pill.

## Adoption

Today **b-trees** is the only lesson that imports the kit — its `Callout`, kept
**pixel-identical** to the hand-built widget it replaced. The other seventeen
lessons keep their bespoke components by design. The kit is their incremental
adoption path, not a forced retrofit: reach for it first when building a **new**
lesson, and migrate an existing widget only where the kit is pixel-identical to
it.
