import { Check, X as XIcon } from 'lucide-react';

export const AsymmetryVisualization = () => (
  <div className="bc-panel-elevated" style={{ padding: 40 }}>
    <div className="bc-grid-2" style={{ gap: 32 }}>
      {/* Left: If A → B */}
      <div
        style={{
          padding: 22,
          background: 'rgba(110, 231, 183, 0.05)',
          border: '1px solid rgba(110, 231, 183, 0.3)',
          borderRadius: 4,
        }}
      >
        <div className="bc-eyebrow" style={{ color: '#6ee7b7', marginBottom: 14 }}>
          IF A → B HAPPENS
        </div>
        <div
          className="bc-italic"
          style={{ fontSize: 18, color: '#f0e8d2', marginBottom: 18, lineHeight: 1.45 }}
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
            <div className="bc-italic" style={{ fontSize: 24, color: '#f5b942' }}>
              A
            </div>
            <div className="bc-mono" style={{ fontSize: 11, color: '#5e5747', marginTop: 4 }}>
              some clock
            </div>
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: '#6ee7b7' }}>
            →
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="bc-italic" style={{ fontSize: 24, color: '#5eead4' }}>
              B
            </div>
            <div className="bc-mono" style={{ fontSize: 11, color: '#5e5747', marginTop: 4 }}>
              contains A's history
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 14,
            background: 'rgba(110, 231, 183, 0.08)',
            border: '1px solid rgba(110, 231, 183, 0.25)',
            borderRadius: 3,
          }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: '#6ee7b7', letterSpacing: '0.1em', marginBottom: 6 }}
          >
            CONSEQUENCE
          </div>
          <div style={{ fontSize: 16, color: '#c8bfa5', lineHeight: 1.55 }}>
            B[i] ≥ A[i] at <em>every</em> position i. So if you ever see A[i] {'>'} B[i] anywhere, A{' '}
            <em>cannot</em> have happened before B.
          </div>
        </div>
      </div>

      {/* Right: If concurrent */}
      <div
        style={{
          padding: 22,
          background: 'rgba(183, 148, 244, 0.05)',
          border: '1px solid rgba(183, 148, 244, 0.3)',
          borderRadius: 4,
        }}
      >
        <div className="bc-eyebrow" style={{ color: '#b794f4', marginBottom: 14 }}>
          IF A ‖ B (CONCURRENT)
        </div>
        <div
          className="bc-italic"
          style={{ fontSize: 18, color: '#f0e8d2', marginBottom: 18, lineHeight: 1.45 }}
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
            <div className="bc-italic" style={{ fontSize: 24, color: '#f5b942' }}>
              A
            </div>
            <div className="bc-mono" style={{ fontSize: 11, color: '#5e5747', marginTop: 4 }}>
              independent
            </div>
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: '#b794f4' }}>
            ‖
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="bc-italic" style={{ fontSize: 24, color: '#5eead4' }}>
              B
            </div>
            <div className="bc-mono" style={{ fontSize: 11, color: '#5e5747', marginTop: 4 }}>
              independent
            </div>
          </div>
        </div>
        <div
          style={{
            padding: 14,
            background: 'rgba(183, 148, 244, 0.08)',
            border: '1px solid rgba(183, 148, 244, 0.25)',
            borderRadius: 3,
          }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: '#b794f4', letterSpacing: '0.1em', marginBottom: 6 }}
          >
            CONSEQUENCE
          </div>
          <div style={{ fontSize: 16, color: '#c8bfa5', lineHeight: 1.55 }}>
            B's increments are independent of A's. They might <em>happen</em> to dominate A in every
            position by coincidence. That's the false positive.
          </div>
        </div>
      </div>
    </div>

    {/* The two errors */}
    <div style={{ marginTop: 32 }}>
      <div className="bc-eyebrow" style={{ marginBottom: 16, color: '#a89e85' }}>
        THE ERROR TABLE
      </div>
      <div className="bc-asym-table">
        <div
          className="bc-asym-cell-h"
          style={{
            padding: '14px 18px',
            background: 'rgba(15, 19, 38, 0.6)',
            borderBottom: '1px solid rgba(45, 52, 88, 0.5)',
          }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: '#a89e85', letterSpacing: '0.12em' }}
          >
            VERDICT
          </div>
        </div>
        <div
          className="bc-asym-cell-h"
          style={{
            padding: '14px 18px',
            background: 'rgba(15, 19, 38, 0.6)',
            borderBottom: '1px solid rgba(45, 52, 88, 0.5)',
            borderLeft: '1px solid rgba(45, 52, 88, 0.5)',
          }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: '#a89e85', letterSpacing: '0.12em' }}
          >
            FALSE POSITIVE?
          </div>
        </div>
        <div
          className="bc-asym-cell-h"
          style={{
            padding: '14px 18px',
            background: 'rgba(15, 19, 38, 0.6)',
            borderBottom: '1px solid rgba(45, 52, 88, 0.5)',
            borderLeft: '1px solid rgba(45, 52, 88, 0.5)',
          }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: '#a89e85', letterSpacing: '0.12em' }}
          >
            FALSE NEGATIVE?
          </div>
        </div>

        <div
          data-asym-label="verdict"
          style={{ padding: '18px', borderBottom: '1px solid rgba(45, 52, 88, 0.4)' }}
        >
          <div className="bc-italic" style={{ fontSize: 19, color: '#b794f4' }}>
            A → B
          </div>
          <div style={{ fontSize: 13, color: '#5e5747', marginTop: 4 }}>"probably caused"</div>
        </div>
        <div
          data-asym-label="false positive?"
          style={{
            padding: '18px',
            borderBottom: '1px solid rgba(45, 52, 88, 0.4)',
            borderLeft: '1px solid rgba(45, 52, 88, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <XIcon size={16} color="#fb7185" />
          <span style={{ fontSize: 14, color: '#fb7185' }}>yes, possible</span>
        </div>
        <div
          data-asym-label="false negative?"
          style={{
            padding: '18px',
            borderBottom: '1px solid rgba(45, 52, 88, 0.4)',
            borderLeft: '1px solid rgba(45, 52, 88, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={16} color="#6ee7b7" />
          <span style={{ fontSize: 14, color: '#6ee7b7' }}>never</span>
        </div>

        <div data-asym-label="verdict" style={{ padding: '18px' }}>
          <div className="bc-italic" style={{ fontSize: 19, color: '#6ee7b7' }}>
            A ‖ B
          </div>
          <div style={{ fontSize: 13, color: '#5e5747', marginTop: 4 }}>"certainly concurrent"</div>
        </div>
        <div
          data-asym-label="false positive?"
          style={{
            padding: '18px',
            borderLeft: '1px solid rgba(45, 52, 88, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={16} color="#6ee7b7" />
          <span style={{ fontSize: 14, color: '#6ee7b7' }}>never</span>
        </div>
        <div
          data-asym-label="false negative?"
          style={{
            padding: '18px',
            borderLeft: '1px solid rgba(45, 52, 88, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={16} color="#6ee7b7" />
          <span style={{ fontSize: 14, color: '#6ee7b7' }}>never</span>
        </div>
      </div>
    </div>
  </div>
);
