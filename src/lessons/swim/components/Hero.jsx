import { HeroCluster } from './HeroCluster.jsx';

export function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        padding: '120px 0 96px',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse 78% 52% at 55% 34%, rgba(163, 230, 53, 0.045), transparent 64%), linear-gradient(180deg, var(--bg-deeper) 0%, var(--bg) 82%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 45%, transparent, var(--bg) 80%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
      <HeroCluster />
      <div className="swim-page" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        <div style={{ maxWidth: 820 }}>
          <div className="swim-eyebrow" style={{ marginBottom: 28 }}>
            Das · Gupta · Motivala <span className="swim-mark" /> 2002
          </div>
          <h1
            className="swim-display"
            style={{
              fontSize: 'clamp(56px, 9vw, 132px)',
              lineHeight: 0.92,
              margin: 0,
              color: 'var(--ink-bright)',
              fontWeight: 300,
              letterSpacing: '-0.03em',
            }}
          >
            <em>SWIM</em>
          </h1>
          <div
            style={{
              marginTop: 14,
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(22px, 2.6vw, 30px)',
              lineHeight: 1.25,
              color: 'var(--ink-dim)',
              fontStyle: 'italic',
              fontWeight: 300,
              maxWidth: 700,
            }}
          >
            Scalable Weakly-consistent Infection-style
            <br />
            process group Membership
          </div>
          <div className="swim-rule-short" style={{ marginTop: 36, marginBottom: 28 }} />
          <p
            style={{
              fontFamily: 'Inter Tight, sans-serif',
              fontSize: 'clamp(16px, 1.6vw, 18px)',
              lineHeight: 1.65,
              color: 'var(--ink)',
              maxWidth: 580,
              margin: 0,
              fontWeight: 400,
            }}
          >
            A protocol for answering one question across a thousand machines:
            <em style={{ color: 'var(--ink-bright)', fontStyle: 'italic' }}>
              {' '}
              who is still here?
            </em>{' '}
            This is a study of how it is asked, how it is answered, and how the answer travels.
          </p>
          <div style={{ marginTop: 44, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span className="swim-chip" data-tone="alive">
              <span className="swim-chip-dot" />
              Alive
            </span>
            <span className="swim-chip" data-tone="suspect">
              <span className="swim-chip-dot" />
              Suspect
            </span>
            <span className="swim-chip" data-tone="dead">
              <span className="swim-chip-dot" />
              Dead
            </span>
            <span className="swim-chip" data-tone="probe">
              <span className="swim-chip-dot" />
              Probe
            </span>
            <span className="swim-chip" data-tone="gossip">
              <span className="swim-chip-dot" />
              Gossip
            </span>
          </div>
        </div>
      </div>
      {/* coordinates ornament bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 32,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          color: 'var(--ink-faint)',
          letterSpacing: '0.12em',
          zIndex: 3,
        }}
      >
        DAS · GUPTA · MOTIVALA <span style={{ color: 'var(--brass)' }}>·</span> 2002
      </div>
    </section>
  );
}
