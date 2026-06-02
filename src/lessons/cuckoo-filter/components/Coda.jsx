export function Coda() {
  return (
    <section style={{ marginTop: 160, marginBottom: 100 }}>
      <div className="cf-page">
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            textAlign: 'center',
            padding: '60px 0',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div className="cf-eyebrow cf-eyebrow-cuc" style={{ marginBottom: 28 }}>
            Coda
          </div>

          <h2
            style={{
              fontFamily: 'Fraunces',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(26px, 4.4vw, 56px)',
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--text)',
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
            }}
          >
            Four moves: <span style={{ color: 'var(--cuc)' }}>hash</span>, place, evict,{' '}
            <span style={{ color: 'var(--cuc)' }}>forget</span>.
            <br />
            The rest is parameters.
          </h2>

          <div
            style={{
              marginTop: 36,
              maxWidth: 580,
              margin: '36px auto 0',
              fontFamily: 'IBM Plex Serif',
              fontSize: 16.5,
              lineHeight: 1.65,
              color: 'var(--text-2)',
              fontWeight: 300,
            }}
          >
            The cuckoo filter is no larger than its description. A short hash, an XOR, a small
            budget of kicks; eight bits per entry, three percent wrong, deletes for free. There is
            very little here. That is the point.
          </div>

          <div
            style={{
              marginTop: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
            }}
          >
            <div style={{ width: 40, height: 1, background: 'var(--line-strong)' }} />
            <div
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 10.5,
                letterSpacing: '0.32em',
                color: 'var(--cuc)',
              }}
            >
              END
            </div>
            <div style={{ width: 40, height: 1, background: 'var(--line-strong)' }} />
          </div>

          <div
            style={{
              marginTop: 24,
              fontFamily: 'IBM Plex Serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--text-mute)',
              letterSpacing: 0,
            }}
          >
            Fan, Andersen, Kaminsky & Mitzenmacher. <br />
            <span
              className="cf-mono"
              style={{
                fontStyle: 'normal',
                fontSize: 11,
                letterSpacing: '0.06em',
                color: 'var(--text-faint)',
              }}
            >
              "Cuckoo Filter: Practically Better Than Bloom" · CoNEXT 2014
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
