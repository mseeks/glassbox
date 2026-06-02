export function Hero() {
  return (
    <section
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}
    >
      {/* Top masthead — small mono cues */}
      <div className="cf-page cf-rise" style={{ paddingTop: 36 }}>
        <div
          className="cf-hero-masthead"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 18,
            fontFamily: 'JetBrains Mono',
            fontSize: 10.5,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-mute)',
            paddingBottom: 18,
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div>
            <span className="cf-live-dot" />
            &nbsp;&nbsp;Membership, with deletion
          </div>
          <div>Subject ┈ Cuckoo Filter</div>
          <div>Fan et al. ┈ 2014</div>
          <div style={{ textAlign: 'right' }}>9 sections &nbsp;·&nbsp; 6 figures</div>
        </div>
      </div>

      {/* Center title */}
      <div
        className="cf-page"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 60,
          paddingBottom: 60,
        }}
      >
        <div className="cf-eyebrow cf-eyebrow-cuc cf-rise cf-d1" style={{ marginBottom: 36 }}>
          A study of an unusual little data structure
        </div>

        <h1
          className="cf-display cf-rise cf-d2"
          style={{
            fontSize: 'clamp(72px, 14vw, 220px)',
            margin: 0,
            fontWeight: 400,
            color: 'var(--text)',
          }}
        >
          The{' '}
          <em
            style={{
              fontStyle: 'italic',
              color: 'var(--cuc)',
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
            }}
          >
            Cuckoo
          </em>
          <br />
          Filter
        </h1>

        {/* Deck */}
        <div
          className="cf-rise cf-d3"
          style={{
            maxWidth: 720,
            marginTop: 56,
            fontFamily: 'IBM Plex Serif',
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: 'clamp(22px, 2.6vw, 30px)',
            lineHeight: 1.32,
            color: 'var(--text-2)',
            letterSpacing: '-0.01em',
          }}
        >
          A small structure that answers{' '}
          <span style={{ color: 'var(--cuc)', fontStyle: 'normal', fontWeight: 400 }}>
            is this one in the set?
          </span>{' '}
          with a handful of bits per entry. And, unusually for its kind, it knows how to forget.
        </div>

        {/* Technical strip — three readouts */}
        <div
          className="cf-rise cf-d4 cf-hero-stats"
          style={{
            marginTop: 80,
            paddingTop: 22,
            borderTop: '1px solid var(--line)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}
        >
          {[
            ['~9 bits', 'per stored item'],
            ['3%', 'typical false-positive rate'],
            ['2 buckets', 'read per lookup'],
            ['Deletes', 'first-class operation'],
          ].map(([v, l], i) => (
            <div key={i}>
              <div
                className="cf-display"
                style={{ fontSize: 30, color: 'var(--text)', marginBottom: 4, fontWeight: 400 }}
              >
                {v}
              </div>
              <div className="cf-eyebrow" style={{ fontSize: 9.5 }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table of contents */}
      <div className="cf-page cf-rise cf-d6" style={{ paddingBottom: 36 }}>
        <div
          className="cf-cols-toc"
          style={{
            display: 'grid',
            paddingTop: 28,
            borderTop: '1px solid var(--line)',
          }}
        >
          {[
            ['01', 'Membership, and its discontents'],
            ['02', 'Cuckoo hashing'],
            ['03', 'Anonymous traces'],
            ['04', 'The pact'],
            ['05', 'Three operations'],
            ['06', 'The mathematics'],
            ['07', 'The cliff'],
            ['08', 'The hazard'],
            ['09', 'Lineage & practice'],
          ].map(([n, t]) => (
            <div key={n} className="cf-toc-item">
              <div className="cf-toc-num">{n}</div>
              <div className="cf-toc-title">{t}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 36,
            textAlign: 'center',
            fontFamily: 'JetBrains Mono',
            fontSize: 10,
            letterSpacing: '0.42em',
            color: 'var(--text-mute)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          <span style={{ width: 14, height: 1, background: 'var(--line)' }} />
          <span style={{ color: 'var(--text-mute)' }}>begin</span>
          <span style={{ color: 'var(--cuc)', fontSize: 11 }}>↓</span>
        </div>
      </div>
    </section>
  );
}
