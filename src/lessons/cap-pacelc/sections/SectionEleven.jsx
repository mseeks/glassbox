import { SectionLabel } from '../components/SectionLabel.jsx';
import { WIDER_FIELD } from '../components/data.js';

export function SectionEleven() {
  return (
    <section className="section" id="s11">
      <SectionLabel num="11" label="The Wider Field" />
      <h2 className="h-section">
        CAP is one cross-section of a much <em>larger</em> conversation.
      </h2>

      <p className="lede">
        The theorem is forty years into a debate it didn&rsquo;t end. Seven adjacent ideas worth
        carrying with you. None replace CAP, but each completes a face of the picture it leaves
        shadowed. Brief pointers; each one is a thread you can pull.
      </p>

      <div
        style={{
          marginTop: 32,
          padding: '0 28px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {WIDER_FIELD.map((e, i) => (
          <FieldEntry key={i} e={e} i={i} />
        ))}
      </div>
      <div className="figure-caption" style={{ marginBottom: 36 }}>
        <strong>Fig. 11</strong> &nbsp; Seven adjacent results. Each refines or complicates the
        picture CAP draws.
      </div>

      <p>
        Two threads tie these together. <strong>First</strong>: the most productive recent research
        has been less about &ldquo;how do we make consensus faster&rdquo; and more about &ldquo;what
        work can we do without consensus at all.&rdquo; CRDTs and CALM and coordination avoidance
        are all variants of one question. How little coordination does an invariant actually
        require? <strong>Second</strong>: the gap between what theory permits and what
        implementations deliver is wide enough that empirical work (Jepsen, PBS) is now a peer of
        theoretical work. The theorem is the floor; the engineering is everything above it.
      </p>
    </section>
  );
}

function FieldEntry({ e, i }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr',
        gap: 20,
        padding: '22px 0 26px',
        borderBottom: i === WIDER_FIELD.length - 1 ? 'none' : '1px solid var(--border)',
      }}
    >
      <div
        style={{
          fontFamily: 'Spectral, serif',
          fontSize: 36,
          color: 'var(--coral)',
          lineHeight: 1,
          fontWeight: 200,
          textAlign: 'center',
          marginTop: 4,
        }}
      >
        {e.glyph}
      </div>
      <div>
        <h4
          style={{
            fontFamily: 'Spectral, serif',
            fontWeight: 400,
            fontSize: 21,
            color: 'var(--ink)',
            margin: '0 0 10px',
            letterSpacing: '-0.005em',
          }}
        >
          {e.name}
        </h4>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.6,
            color: 'var(--ink-2)',
            margin: '0 0 10px',
          }}
        >
          {e.body}
        </p>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9.5,
            color: 'var(--ink-faint)',
            letterSpacing: '0.1em',
          }}
        >
          {e.by} &nbsp;·&nbsp; {e.year}
        </div>
      </div>
    </div>
  );
}
