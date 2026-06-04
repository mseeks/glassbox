import { forwardRef } from 'react';
import { SectionDivider } from '../components/SectionDivider.jsx';
import { renderProseMarkdown } from '../components/helpers.js';

export const ConsistencySection = forwardRef(function ConsistencySection(_props, ref) {
  return (
    <>
      <div ref={ref} style={{ scrollMarginTop: 16, marginTop: 32 }}>
        <SectionDivider
          letter="C"
          kicker="The invariants axis"
          name="Consistency"
          accent="var(--iso-pink)"
          intro="The softest of the four. It is also the one you have actually been studying all along, without it being named."
        />
      </div>
      <ConsistencyBody />
    </>
  );
});

function ConsistencyBody() {
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
          The softest of the four
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
          You have already met C
        </h3>

        <div className="iso-rule-short" style={{ margin: '20px 0' }} />

        <p
          className="iso-body"
          style={{
            fontSize: 16,
            lineHeight: 1.65,
            color: 'rgba(var(--iso-ink-rgb), 0.88)',
            margin: 0,
          }}
          dangerouslySetInnerHTML={{
            __html: renderProseMarkdown(
              'Every chapter of the Isolation Lab opened with an *invariant we hope to preserve*: X + Y = 200. At least one doctor on call. Every increment must persist. Those invariants **are** the C in ACID.',
            ),
          }}
        />

        <p
          className="iso-body"
          style={{
            fontSize: 16,
            lineHeight: 1.65,
            color: 'rgba(var(--iso-ink-rgb), 0.88)',
            margin: '14px 0 0',
          }}
          dangerouslySetInnerHTML={{
            __html: renderProseMarkdown(
              "The other three properties tell you what the database does *for* you. Atomicity gives you all-or-nothing. Isolation gives you a coherent view amid concurrency. Durability gives you persistence across failure. **But the thing being preserved, the rules of what makes a valid database state, that's consistency.** And that's mostly your responsibility.",
            ),
          }}
        />

        <div
          style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
          className="iso-c-grid"
        >
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 8,
              background: 'rgba(var(--iso-pink-rgb), 0.04)',
              border: '1px solid rgba(var(--iso-pink-rgb), 0.2)',
            }}
          >
            <div
              className="iso-ui"
              style={{
                fontSize: 9,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--iso-pink)',
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              What the database enforces
            </div>
            <div
              className="iso-body"
              style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(var(--iso-ink-rgb), 0.85)' }}
            >
              <strong style={{ color: 'var(--ink)' }}>Constraints.</strong> NOT NULL, UNIQUE, CHECK,
              foreign keys, primary keys. The narrow slice of consistency the database can guarantee
              directly. A transaction that would violate any of these is rejected at commit time.
            </div>
          </div>

          <div
            style={{
              padding: '16px 18px',
              borderRadius: 8,
              background: 'rgba(var(--iso-ink-rgb), 0.04)',
              border: '1px solid rgba(var(--iso-ink-rgb), 0.12)',
            }}
          >
            <div
              className="iso-ui"
              style={{
                fontSize: 9,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(var(--iso-ink-rgb), 0.7)',
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              What you enforce
            </div>
            <div
              className="iso-body"
              style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(var(--iso-ink-rgb), 0.85)' }}
            >
              <strong style={{ color: 'var(--ink)' }}>Application logic.</strong> Higher-level
              business rules: "withdrawal cannot exceed balance," "at least one moderator per
              channel." The database does not know your domain. Your transactions must individually
              preserve these rules; the database guarantees only that *if* they do, concurrency
              cannot break them.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            padding: '14px 18px',
            borderRadius: 8,
            background: 'rgba(var(--iso-coral-rgb), 0.06)',
            border: '1px solid rgba(var(--iso-coral-rgb), 0.2)',
          }}
        >
          <div
            className="iso-ui"
            style={{
              fontSize: 9,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--iso-coral)',
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            A famous source of confusion
          </div>
          <p
            className="iso-body"
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: 'rgba(var(--iso-ink-rgb), 0.85)',
              margin: 0,
            }}
            dangerouslySetInnerHTML={{
              __html: renderProseMarkdown(
                'The C in **ACID** is not the C in **CAP**. ACID-C is about application invariants: semantic correctness. CAP-C is about *linearizability*: every read sees the most recent write, in real time. Two completely different ideas, sharing one unfortunate letter. When someone says "consistent," ask which one they mean.',
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
