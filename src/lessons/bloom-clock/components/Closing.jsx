import { Eyebrow } from './atoms.jsx';

export const Closing = () => (
  <section
    id="close"
    className="bc-section"
    style={{
      minHeight: '90vh',
      maxWidth: 900,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <div style={{ marginBottom: 56 }}>
      <Eyebrow color="var(--bc-gold)">CODA</Eyebrow>
      <h2
        className="bc-display"
        style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          margin: 0,
          color: 'var(--bc-ink)',
          lineHeight: 1.05,
        }}
      >
        The single sentence
      </h2>
    </div>

    <div
      className="bc-pullquote"
      style={{ fontSize: 'clamp(22px, 3.4vw, 38px)', lineHeight: 1.32 }}
    >
      A Bloom clock is the structural dual of a Bloom filter (same hashing, same one-sided error,
      same fixed-size trick) applied to the
      <em style={{ color: 'var(--bc-gold)' }}> happens-before </em>
      partial order instead of set membership, where the
      <em style={{ color: 'var(--bc-emerald)' }}> exact </em>
      verdict it preserves is "certainly concurrent" and the
      <em style={{ color: 'var(--bc-violet)' }}> probabilistic </em>
      verdict is "happened before."
    </div>

    <div className="bc-closing-cards">
      <div style={{ flex: 1, minWidth: 240 }}>
        <Eyebrow color="var(--bc-gold)">WHAT IT GIVES UP</Eyebrow>
        <div
          className="bc-italic"
          style={{ fontSize: 22, color: 'var(--bc-ink-dim)', lineHeight: 1.45 }}
        >
          Perfect accuracy. Some fraction of "happened before" answers will be wrong.
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <Eyebrow color="var(--bc-emerald)">WHAT IT KEEPS</Eyebrow>
        <div
          className="bc-italic"
          style={{ fontSize: 22, color: 'var(--bc-ink-dim)', lineHeight: 1.45 }}
        >
          Fixed size, exact concurrency detection, dynamic membership for free.
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 240 }}>
        <Eyebrow color="var(--bc-violet)">THE SHAPE OF THE TRADE</Eyebrow>
        <div
          className="bc-italic"
          style={{ fontSize: 22, color: 'var(--bc-ink-dim)', lineHeight: 1.45 }}
        >
          Asymmetric error. The certain side stays certain. The other side becomes a knob.
        </div>
      </div>
    </div>

    <div style={{ marginTop: 96, textAlign: 'center' }}>
      <div
        className="bc-mono"
        style={{ fontSize: 10, letterSpacing: '0.3em', color: 'var(--bc-ink-faint)' }}
      >
        ─ FIN ─
      </div>
    </div>
  </section>
);
