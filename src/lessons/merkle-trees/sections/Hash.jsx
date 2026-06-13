import { Reveal } from '../../../shared/reveal.jsx';
import LessonLink from '../../../shared/LessonLink.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import AvalancheDemo from '../labs/AvalancheDemo.jsx';

// §2 — The one primitive: a cryptographic hash. Three property cards +
// the avalanche demo + a footnote.
export default function Hash() {
  return (
    <section className="mk-section">
      <SectionHeader id="hash" kicker="The Primitive" title="A hash is a fingerprint" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          Everything rests on one tool: a <em>cryptographic hash function</em>. Feed it any data, a
          single byte or a whole library, and it returns a short, fixed-length string that serves as
          a fingerprint of the input.
        </p>
        <p>Three properties are all we need:</p>
      </Reveal>

      <Reveal base="mk-reveal">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '6px 0 24px' }}>
          {[
            ['Deterministic', 'Same input, same fingerprint. Always.'],
            ['Avalanche', 'Change one bit and the whole fingerprint scrambles, unpredictably.'],
            [
              'One-way & collision-resistant',
              'You cannot run it backward, nor find two inputs that share a fingerprint.',
            ],
          ].map(([t, d]) => (
            <div
              key={t}
              className="mk-plate mk-plate-corner"
              style={{ padding: '14px 16px', flex: '1 1 200px' }}
            >
              <div
                className="mk-mono"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: 'var(--patina)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                {t}
              </div>
              <div style={{ fontSize: 15, color: 'var(--paper-dim)', lineHeight: 1.45 }}>{d}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal base="mk-reveal">
        <AvalancheDemo />
        <p
          className="mk-prose"
          style={{ marginTop: 16, fontSize: 15, color: 'var(--paper-faint)', fontStyle: 'italic' }}
        >
          (Real systems use <LessonLink to="sha">SHA-256</LessonLink> or BLAKE3, producing 256-bit
          digests. This lesson uses a small 12-character hash so the trees stay readable. Nothing
          else changes. The behavior is the same.)
        </p>
      </Reveal>
    </section>
  );
}
