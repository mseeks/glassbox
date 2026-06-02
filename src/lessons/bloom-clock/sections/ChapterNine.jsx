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
      style={{ fontSize: 24, color: '#f0e8d2', marginBottom: 16, lineHeight: 1.2 }}
    >
      {title}
    </div>
    <div style={{ fontSize: 15.5, color: '#c8bfa5', lineHeight: 1.6 }}>{children}</div>
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
          becomes useless. So every production Bloom clock needs a strategy for forgetting — for
          letting old causal information decay or be deliberately discarded. There are three main
          families, each with the same shape as analogous fixes for Bloom filters proper.
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
      <StrategyCard eyebrow="EPOCH WINDOWS" title="Reset, on schedule" color="#f5b942" glyph="i">
        Divide time into epochs (say, a window of a few minutes). At the boundary, mint a fresh
        empty clock. Comparisons within an epoch use the current clock; cross-epoch comparisons fall
        back to a coarse epoch counter. Simple, surgical, and the right answer when causality only
        matters within a bounded time horizon — which is most practical systems.
      </StrategyCard>

      <StrategyCard
        eyebrow="STOCHASTIC DECAY"
        title="Forget a little, every event"
        color="#b794f4"
        glyph="ii"
      >
        On every local event, randomly decrement P slots by 1 (clamped to zero). This bounds the
        long-run weight without ever needing an epoch boundary. The cost is that long causal chains
        can slowly forget themselves — old happens-before relationships fade, introducing a small
        false-<em>negative</em> rate against very old events. For "what happened recently"
        workloads, that trade is fine.
      </StrategyCard>

      <StrategyCard
        eyebrow="CHAINED CLOCKS"
        title="Stack new clocks as load grows"
        color="#5eead4"
        glyph="iii"
      >
        Inspired by scalable Bloom filters. Maintain a sequence of clocks: new events go into the
        newest one; comparisons stitch across all of them. When the newest fills up, start another
        with tighter FPR target. Bounds long-run FPR even with no prior knowledge of weight, at the
        cost of more storage and a more complex comparison routine.
      </StrategyCard>
    </div>

    <div style={{ maxWidth: 760, marginTop: 56 }}>
      <Prose>
        <p>
          A few more wrinkles worth flagging. Some systems augment the Bloom clock with a small
          scalar Lamport counter as a tie-breaker — a hybrid that gives you total ordering in
          degenerate cases where the Bloom verdict is ambiguous or saturated. Others partition nodes
          into groups and run a separate clock per group, keeping hash collisions confined within
          groups. And some research-stage variants try to preserve approximate event provenance,
          blurring the line between Bloom clocks and Invertible Bloom Lookup Tables.
        </p>
        <p>
          The choice of aging strategy is workload-driven. Epochs are simplest and fit best when
          transactions have bounded lifetimes; stochastic decay fits systems where the rate of
          events is roughly steady; chained clocks fit systems where the rate varies unpredictably
          and you want a hard FPR guarantee.
        </p>
      </Prose>
    </div>
  </Section>
);
