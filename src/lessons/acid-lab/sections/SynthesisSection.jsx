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

        <WhereToGoNext />
      </div>
    </div>
  );
}

// Two concept families, each pointing outward from a single-node ACID database:
// what it costs to keep the guarantees across machines, and what you trade them
// for when you relax them. Each entry carries its own accent so the family reads
// at a glance; the colours are the same flip-aware tokens the rest of the lesson
// paints with, so the whole block themes for free in both modes.
const NEXT_FAMILIES = [
  {
    label: 'Holding the line across machines',
    blurb:
      'Everything here assumed one box. Spread the data over many, and each letter has to be re-earned over a network that drops messages and partitions.',
    accent: '--iso-teal',
    items: [
      [
        'Distributed transactions',
        'Two-phase commit and Saga patterns — how *all-or-nothing* survives when "all" is spread across several nodes that can each fail independently.',
      ],
      [
        'Spanner & CockroachDB',
        'Strict-serializable ACID *everywhere*, bought with synchronized clocks and Raft/Paxos consensus under every write. ACID as a global, not a local, contract.',
      ],
    ],
  },
  {
    label: 'Trading the guarantees away',
    blurb:
      'Sometimes the full contract costs more than the workload can pay. These are the deliberate relaxations — and exactly which letter each one gives up.',
    accent: '--iso-amber',
    items: [
      [
        'Optimistic vs. pessimistic locking',
        'Two ways to deliver Isolation: lock up front and serialize, or run free and abort on conflict at commit. The same I, two very different latency profiles.',
      ],
      [
        'Eventual consistency & read repair',
        'Drop linearizability for availability under partition (the CAP trade). Replicas reconcile after the fact instead of agreeing before the write returns.',
      ],
      [
        'CRDTs',
        'Conflict-free replicated data types: structure the data so concurrent writes *always* merge without coordination — convergence by algebra instead of by locks.',
      ],
    ],
  },
];

function WhereToGoNext() {
  return (
    <div style={{ marginTop: 36 }}>
      <div className="iso-rule-short" style={{ margin: '0 0 18px' }} />
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
        Where to go next
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
        Four guarantees, and the price of keeping them elsewhere
      </h3>
      <p
        className="iso-body"
        style={{
          fontSize: 15,
          lineHeight: 1.6,
          color: 'rgba(var(--iso-ink-rgb), 0.85)',
          margin: '14px 0 22px',
        }}
        dangerouslySetInnerHTML={{
          __html: renderProseMarkdown(
            'ACID is the contract a *single* database makes. The interesting questions start when you ask what it costs to keep that contract across many machines, or which letter you are willing to give up to go faster.',
          ),
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {NEXT_FAMILIES.map((family) => (
          <NextFamily key={family.label} family={family} />
        ))}
      </div>
    </div>
  );
}

function NextFamily({ family }) {
  return (
    <div
      style={{
        padding: '16px 18px',
        borderRadius: 8,
        background: `rgba(var(${family.accent}-rgb), 0.04)`,
        border: `1px solid rgba(var(${family.accent}-rgb), 0.2)`,
      }}
    >
      <div
        className="iso-ui"
        style={{
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: `var(${family.accent})`,
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        {family.label}
      </div>
      <p
        className="iso-body"
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: 'rgba(var(--iso-ink-rgb), 0.85)',
          margin: '0 0 14px',
          fontStyle: 'italic',
        }}
      >
        {family.blurb}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {family.items.map(([topic, detail]) => (
          <div
            key={topic}
            style={{
              display: 'grid',
              gridTemplateColumns: '6px 1fr',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                marginTop: 8,
                background: `var(${family.accent})`,
                flexShrink: 0,
              }}
            />
            <div>
              <span
                className="iso-display"
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  fontStyle: 'italic',
                }}
              >
                {topic}
              </span>
              <p
                className="iso-body"
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'rgba(var(--iso-ink-rgb), 0.82)',
                  margin: '3px 0 0',
                }}
                dangerouslySetInnerHTML={{ __html: renderProseMarkdown(detail) }}
              />
            </div>
          </div>
        ))}
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
