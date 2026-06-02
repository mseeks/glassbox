import { useState } from 'react';
import { SectionLabel } from '../components/SectionLabel.jsx';
import { MYTHS } from '../components/data.js';

export function SectionTen() {
  return (
    <section className="section" id="s10">
      <SectionLabel num="10" label="Myths & Misconceptions" />
      <h2 className="h-section">
        Six things people say about CAP that are <em>wrong</em>.
      </h2>

      <p className="lede">
        The shorthand outlives the theorem. Most of what gets repeated about CAP, in interviews, on
        whiteboards, in vendor marketing, is a compressed slogan that lost its referent somewhere on
        the way down. Each card below is a sentence you have probably heard, and the precise reason
        it&rsquo;s incorrect.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
          margin: '32px 0',
        }}
      >
        {MYTHS.map((m, i) => (
          <MythCard key={i} m={m} idx={i} />
        ))}
      </div>
      <div className="figure-caption" style={{ marginBottom: 36 }}>
        <strong>Fig. 10</strong> &nbsp; Six common myths. Tap any card to flip.
      </div>

      <p>
        One thread runs through all six. <em>Imprecision</em> is the enemy of useful reasoning here.
        The slogans collapse distinctions that the theorem deliberately preserves: single-object
        versus multi-object ordering, real-time versus equivalence, system properties versus
        transaction properties, the ideal versus the achievable. Restoring those distinctions is
        most of the work of thinking clearly about distributed data.
      </p>
    </section>
  );
}

function MythCard({ m, idx }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={flipped ? `Hide truth for myth ${idx + 1}` : `Reveal truth for myth ${idx + 1}`}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
      style={{
        background: flipped ? 'var(--surface)' : 'var(--bg-deep)',
        border: '1px solid var(--border)',
        borderLeft: `2px solid ${flipped ? 'var(--emerald)' : 'var(--coral)'}`,
        padding: '22px 24px 24px',
        cursor: 'pointer',
        transition: 'all 280ms ease',
        position: 'relative',
        minHeight: 180,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: flipped ? 'var(--emerald)' : 'var(--coral)',
            textTransform: 'uppercase',
          }}
        >
          {flipped
            ? `truth · ${String(idx + 1).padStart(2, '0')}`
            : `myth · ${String(idx + 1).padStart(2, '0')}`}
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: 'var(--ink-faint)',
            letterSpacing: '0.1em',
          }}
        >
          {flipped ? '↶ flip back' : 'tap to reveal →'}
        </div>
      </div>

      {!flipped ? (
        <>
          <div
            style={{
              fontFamily: 'Spectral, serif',
              fontWeight: 300,
              fontSize: 22,
              lineHeight: 1.25,
              color: 'var(--coral)',
              marginBottom: 10,
              letterSpacing: '-0.005em',
            }}
          >
            {m.myth}
          </div>
          <div
            style={{
              fontFamily: 'Spectral, serif',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--ink-dim)',
            }}
          >
            {m.short}
          </div>
        </>
      ) : (
        <div
          style={{
            fontFamily: 'Lora, serif',
            fontSize: 14.5,
            lineHeight: 1.6,
            color: 'var(--ink-2)',
          }}
        >
          {m.truth}
        </div>
      )}
    </div>
  );
}
