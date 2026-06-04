import { Check, X as XIcon } from 'lucide-react';

export const AsymmetryVisualization = () => (
  <div className="bc-panel-elevated" style={{ padding: 40 }}>
    <div className="bc-grid-2" style={{ gap: 32 }}>
      {/* Left: If A → B */}
      <div
        style={{
          padding: 22,
          background: 'var(--bc-emerald-wash)',
          border: '1px solid var(--bc-emerald-edge)',
          borderRadius: 4,
        }}
      >
        <div className="bc-eyebrow" style={{ color: 'var(--bc-emerald)', marginBottom: 14 }}>
          IF A → B HAPPENS
        </div>
        <div
          className="bc-italic"
          style={{ fontSize: 18, color: 'var(--bc-ink)', marginBottom: 18, lineHeight: 1.45 }}
        >
          Then every increment that went into A gets merged into B via pointwise max.
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="bc-italic" style={{ fontSize: 24, color: 'var(--bc-gold)' }}>
              A
            </div>
            <div
              className="bc-mono"
              style={{ fontSize: 11, color: 'var(--bc-ink-faint)', marginTop: 4 }}
            >
              some clock
            </div>
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: 'var(--bc-emerald)' }}>
            →
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="bc-italic" style={{ fontSize: 24, color: 'var(--bc-teal)' }}>
              B
            </div>
            <div
              className="bc-mono"
              style={{ fontSize: 11, color: 'var(--bc-ink-faint)', marginTop: 4 }}
            >
              contains A's history
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 14,
            background: 'var(--bc-emerald-wash)',
            border: '1px solid var(--bc-emerald-edge)',
            borderRadius: 3,
          }}
        >
          <div
            className="bc-mono"
            style={{
              fontSize: 11,
              color: 'var(--bc-emerald)',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            CONSEQUENCE
          </div>
          <div style={{ fontSize: 16, color: 'var(--bc-ink-dim)', lineHeight: 1.55 }}>
            B[i] ≥ A[i] at <em>every</em> position i. So if you ever see A[i] {'>'} B[i] anywhere, A{' '}
            <em>cannot</em> have happened before B.
          </div>
        </div>
      </div>

      {/* Right: If concurrent */}
      <div
        style={{
          padding: 22,
          background: 'var(--bc-violet-wash)',
          border: '1px solid var(--bc-violet-edge)',
          borderRadius: 4,
        }}
      >
        <div className="bc-eyebrow" style={{ color: 'var(--bc-violet)', marginBottom: 14 }}>
          IF A ‖ B (CONCURRENT)
        </div>
        <div
          className="bc-italic"
          style={{ fontSize: 18, color: 'var(--bc-ink)', marginBottom: 18, lineHeight: 1.45 }}
        >
          A and B accumulated independently. They might overlap by chance.
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="bc-italic" style={{ fontSize: 24, color: 'var(--bc-gold)' }}>
              A
            </div>
            <div
              className="bc-mono"
              style={{ fontSize: 11, color: 'var(--bc-ink-faint)', marginTop: 4 }}
            >
              independent
            </div>
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: 'var(--bc-violet)' }}>
            ‖
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="bc-italic" style={{ fontSize: 24, color: 'var(--bc-teal)' }}>
              B
            </div>
            <div
              className="bc-mono"
              style={{ fontSize: 11, color: 'var(--bc-ink-faint)', marginTop: 4 }}
            >
              independent
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 14,
            background: 'var(--bc-violet-wash)',
            border: '1px solid var(--bc-violet-edge)',
            borderRadius: 3,
          }}
        >
          <div
            className="bc-mono"
            style={{
              fontSize: 11,
              color: 'var(--bc-violet)',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            CONSEQUENCE
          </div>
          <div style={{ fontSize: 16, color: 'var(--bc-ink-dim)', lineHeight: 1.55 }}>
            B's increments are independent of A's. They might <em>happen</em> to dominate A in every
            position by coincidence. That's the false positive.
          </div>
        </div>
      </div>
    </div>

    {/* The two errors */}
    <div style={{ marginTop: 32 }}>
      <div className="bc-eyebrow" style={{ marginBottom: 16, color: 'var(--bc-ink-muted)' }}>
        THE ERROR TABLE
      </div>
      <div className="bc-asym-table">
        <div
          className="bc-asym-cell-h"
          style={{
            padding: '14px 18px',
            background: 'var(--bc-inset-6)',
            borderBottom: '1px solid var(--bc-rule)',
          }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: 'var(--bc-ink-muted)', letterSpacing: '0.12em' }}
          >
            VERDICT
          </div>
        </div>
        <div
          className="bc-asym-cell-h"
          style={{
            padding: '14px 18px',
            background: 'var(--bc-inset-6)',
            borderBottom: '1px solid var(--bc-rule)',
            borderLeft: '1px solid var(--bc-rule)',
          }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: 'var(--bc-ink-muted)', letterSpacing: '0.12em' }}
          >
            FALSE POSITIVE?
          </div>
        </div>
        <div
          className="bc-asym-cell-h"
          style={{
            padding: '14px 18px',
            background: 'var(--bc-inset-6)',
            borderBottom: '1px solid var(--bc-rule)',
            borderLeft: '1px solid var(--bc-rule)',
          }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: 'var(--bc-ink-muted)', letterSpacing: '0.12em' }}
          >
            FALSE NEGATIVE?
          </div>
        </div>

        <div
          data-asym-label="verdict"
          style={{ padding: '18px', borderBottom: '1px solid var(--bc-rule-soft)' }}
        >
          <div className="bc-italic" style={{ fontSize: 19, color: 'var(--bc-violet)' }}>
            A → B
          </div>
          <div style={{ fontSize: 13, color: 'var(--bc-ink-faint)', marginTop: 4 }}>
            "probably caused"
          </div>
        </div>
        <div
          data-asym-label="false positive?"
          style={{
            padding: '18px',
            borderBottom: '1px solid var(--bc-rule-soft)',
            borderLeft: '1px solid var(--bc-rule)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <XIcon size={16} color="var(--bc-rose)" />
          <span style={{ fontSize: 14, color: 'var(--bc-rose)' }}>yes, possible</span>
        </div>
        <div
          data-asym-label="false negative?"
          style={{
            padding: '18px',
            borderBottom: '1px solid var(--bc-rule-soft)',
            borderLeft: '1px solid var(--bc-rule)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={16} color="var(--bc-emerald)" />
          <span style={{ fontSize: 14, color: 'var(--bc-emerald)' }}>never</span>
        </div>

        <div data-asym-label="verdict" style={{ padding: '18px' }}>
          <div className="bc-italic" style={{ fontSize: 19, color: 'var(--bc-emerald)' }}>
            A ‖ B
          </div>
          <div style={{ fontSize: 13, color: 'var(--bc-ink-faint)', marginTop: 4 }}>
            "certainly concurrent"
          </div>
        </div>
        <div
          data-asym-label="false positive?"
          style={{
            padding: '18px',
            borderLeft: '1px solid var(--bc-rule)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={16} color="var(--bc-emerald)" />
          <span style={{ fontSize: 14, color: 'var(--bc-emerald)' }}>never</span>
        </div>
        <div
          data-asym-label="false negative?"
          style={{
            padding: '18px',
            borderLeft: '1px solid var(--bc-rule)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={16} color="var(--bc-emerald)" />
          <span style={{ fontSize: 14, color: 'var(--bc-emerald)' }}>never</span>
        </div>
      </div>
    </div>
  </div>
);
