import { forwardRef } from 'react';
import { SectionDivider } from '../components/SectionDivider.jsx';
import { SYNTHESIS_PHASES } from '../components/data.js';
import { renderProseMarkdown } from '../components/helpers.js';

export const SynthesisSection = forwardRef(function SynthesisSection(_props, ref) {
  return (
    <>
      <div ref={ref} style={{ scrollMarginTop: 16, marginTop: 32 }}>
        <SectionDivider
          letter="∴"
          kicker="Putting it all together"
          name="Synthesis"
          accent="var(--ink)"
        />
      </div>
      <SynthesisBody />
    </>
  );
});

function SynthesisBody() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 2 }}>
      <div className="iso-card" style={{ padding: '24px 28px', borderRadius: 12 }}>
        <div
          className="iso-ui"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(var(--iso-ink-rgb), 0.72)',
            marginBottom: 6,
          }}
        >
          ACID is a coordinate system, not a checklist
        </div>
        <h3
          className="iso-display"
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--ink)',
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          The lifecycle of one transaction
        </h3>

        <div className="iso-rule-short" style={{ margin: '20px 0' }} />

        <p
          className="iso-body"
          style={{
            fontSize: 16,
            lineHeight: 1.65,
            color: 'rgba(var(--iso-ink-rgb), 0.85)',
            margin: '0 0 22px',
          }}
          dangerouslySetInnerHTML={{
            __html: renderProseMarkdown(
              "A single transaction's journey, end to end, exercises all four properties. Each phase has different letters doing different work. Understanding *which* property is active *when* is what makes ACID feel less like a memorized list and more like a coordinate system.",
            ),
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SYNTHESIS_PHASES.map((p, i) => (
            <SynthesisPhase key={i} phase={p} isLast={i === SYNTHESIS_PHASES.length - 1} />
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            padding: '16px 18px',
            borderRadius: 8,
            background: 'rgba(var(--iso-teal-rgb), 0.04)',
            border: '1px solid rgba(var(--iso-teal-rgb), 0.2)',
          }}
        >
          <div
            className="iso-ui"
            style={{
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--iso-teal)',
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            The takeaway
          </div>
          <p
            className="iso-body"
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: 'rgba(var(--iso-ink-rgb), 0.88)',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{
              __html: renderProseMarkdown(
                'A and I do not subsume each other. Atomicity protects you from *partial* transactions; isolation protects you from *interfering* ones. You can have a lost update at any isolation level (an isolation problem) on a perfectly atomic database. You can have a half-applied transaction after a crash (an atomicity problem) regardless of how strong your isolation is. Different axes, different machinery, different bugs when each fails.',
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SynthesisPhase({ phase, isLast }) {
  const propColors = {
    A: 'var(--iso-violet)',
    C: 'var(--iso-pink)',
    I: 'var(--iso-teal)',
    D: 'var(--iso-amber)',
  };
  // Channel triples for the letter chip's wash + border, so they darken on
  // paper in step with the text colours above (1f ≈ 0.12, 55 ≈ 0.33).
  const propRgb = {
    A: '--iso-violet-rgb',
    C: '--iso-pink-rgb',
    I: '--iso-teal-rgb',
    D: '--iso-amber-rgb',
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          alignItems: 'flex-start',
          gap: 18,
          padding: '14px 0',
        }}
        className="iso-synth-row"
      >
        <div style={{ paddingTop: 2 }}>
          <div
            className="iso-display"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--ink)',
              letterSpacing: '0.04em',
            }}
          >
            {phase.phase}
          </div>
          <div
            className="iso-body"
            style={{
              fontSize: 12,
              color: 'rgba(var(--iso-ink-rgb), 0.72)',
              marginTop: 4,
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}
          >
            {phase.detail}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {phase.activeProps.length === 0 ? (
            <div
              className="iso-body"
              style={{
                fontSize: 13,
                color: 'rgba(var(--iso-ink-rgb), 0.78)',
                fontStyle: 'italic',
                padding: '6px 0',
              }}
            >
              The transaction is complete. No further work for any property.
            </div>
          ) : (
            Object.entries(phase.annotations).map(([letter, note]) => (
              <div
                key={letter}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '34px 1fr',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: `rgba(var(${propRgb[letter]}), 0.12)`,
                    border: `1px solid rgba(var(${propRgb[letter]}), 0.33)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="iso-display"
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: propColors[letter],
                    }}
                  >
                    {letter}
                  </span>
                </div>
                <div
                  className="iso-body"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: 'rgba(var(--iso-ink-rgb), 0.85)',
                  }}
                  dangerouslySetInnerHTML={{ __html: renderProseMarkdown(note) }}
                />
              </div>
            ))
          )}
        </div>
      </div>
      {!isLast && (
        <div
          style={{
            height: 1,
            background: 'rgba(var(--iso-ink-rgb), 0.06)',
            marginLeft: 0,
            marginRight: 0,
          }}
        />
      )}
    </div>
  );
}
