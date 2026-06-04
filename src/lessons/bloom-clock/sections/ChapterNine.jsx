import { ChapterTitle, Prose, Section } from '../components/atoms.jsx';

const StrategyCard = ({ title, eyebrow, color, children, glyph }) => (
  <div
    style={{
      padding: 28,
      background: `${color}06`,
      border: `1px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: 4,
      position: 'relative',
      minHeight: 300,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 18,
        right: 22,
        fontFamily: 'Instrument Serif',
        fontStyle: 'italic',
        fontSize: 48,
        color: `${color}33`,
        lineHeight: 1,
      }}
    >
      {glyph}
    </div>
    <div className="bc-eyebrow" style={{ color, marginBottom: 10 }}>
      {eyebrow}
    </div>
    <div
      className="bc-italic"
      style={{ fontSize: 24, color: 'var(--bc-ink)', marginBottom: 16, lineHeight: 1.2 }}
    >
      {title}
    </div>
    <div style={{ fontSize: 15.5, color: 'var(--bc-ink-dim)', lineHeight: 1.6 }}>{children}</div>
  </div>
);

export const ChapterNine = () => (
  <Section id="ch9">
    <ChapterTitle
      number="IX"
      eyebrow="AGING"
      title="Keeping the clock from drowning"
      sub="Three families of fixes, three different trades."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          If you let counters accumulate forever, false-positive rate marches to one. The structure
          becomes useless. So every production Bloom clock needs a way to forget, a mechanism that
          lets old causal information decay or be deliberately discarded before the array fills past
          the point of usefulness. There are three main families. Each has the same shape as an
          analogous fix for Bloom filters proper.
        </p>
      </Prose>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 22,
        marginTop: 48,
      }}
    >
      <StrategyCard
        eyebrow="EPOCH WINDOWS"
        title="Reset, on schedule"
        color="var(--bc-gold)"
        glyph="i"
      >
        Divide time into epochs (say, a window of a few minutes). At the boundary, mint a fresh
        empty clock. Comparisons within an epoch use the current clock, while cross-epoch
        comparisons fall back to a coarse epoch counter that only has to distinguish one window from
        the next. Simple and surgical. It is the right answer when causality only matters within a
        bounded time horizon, which covers most practical systems.
      </StrategyCard>

      <StrategyCard
        eyebrow="STOCHASTIC DECAY"
        title="Forget a little, every event"
        color="var(--bc-violet)"
        glyph="ii"
      >
        On every local event, randomly decrement P slots by 1 (clamped to zero). No epoch boundary
        needed. This bounds the long-run weight. The cost is that long causal chains can slowly
        forget themselves. Old happens-before relationships fade, introducing a small false-
        <em>negative</em> rate against very old events. For "what happened recently" workloads, that
        trade is fine.
      </StrategyCard>

      <StrategyCard
        eyebrow="CHAINED CLOCKS"
        title="Stack new clocks as load grows"
        color="var(--bc-teal)"
        glyph="iii"
      >
        Inspired by scalable Bloom filters. Maintain a sequence of clocks: new events go into the
        newest one, and comparisons stitch across all of them. When the newest fills up, start
        another with tighter FPR target. This bounds long-run FPR even with no prior knowledge of
        weight, at the cost of more storage and a comparison routine that has to walk every clock in
        the chain instead of just one.
      </StrategyCard>
    </div>

    <div style={{ maxWidth: 760, marginTop: 56 }}>
      <Prose>
        <p>
          A few more wrinkles. Some systems augment the Bloom clock with a small scalar Lamport
          counter as a tie-breaker: a hybrid that gives you total ordering in degenerate cases where
          the Bloom verdict is ambiguous or saturated. Others partition nodes into groups and run a
          separate clock per group, keeping hash collisions confined within groups. And some
          research-stage variants try to preserve approximate event provenance, blurring the line
          between Bloom clocks and Invertible Bloom Lookup Tables.
        </p>
        <p>
          So the choice of aging strategy is workload-driven. Pick by shape. Epochs are simplest and
          fit best when transactions have bounded lifetimes; stochastic decay fits systems where the
          rate of events is roughly steady; chained clocks fit systems where the rate varies
          unpredictably and you want a hard FPR guarantee that holds no matter how the load moves.
        </p>
      </Prose>
    </div>
  </Section>
);
