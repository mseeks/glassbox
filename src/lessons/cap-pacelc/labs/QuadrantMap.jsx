import { useState } from 'react';

export function QuadrantMap() {
  const [hover, setHover] = useState(null);

  const systems = [
    // PC/EC quadrant — consistent during partition, consistent in normal operation
    {
      name: 'Spanner',
      x: 0.82,
      y: 0.18,
      q: 'PC/EC',
      notes:
        'TrueTime (atomic-clock + GPS hardware in every datacenter) gives Spanner a globally-synchronized clock that closes the timing gap; pays latency continuously for external consistency.',
    },
    {
      name: 'CockroachDB',
      x: 0.72,
      y: 0.22,
      q: 'PC/EC',
      notes:
        'Distributed serializable transactions. CP under partition, C-preferring at all times.',
    },
    {
      name: 'FoundationDB',
      x: 0.88,
      y: 0.12,
      q: 'PC/EC',
      notes: 'Strict serializable; designed for predictable behavior under chaos.',
    },
    {
      name: 'etcd',
      x: 0.78,
      y: 0.32,
      q: 'PC/EC',
      notes: 'Raft. Linearizable. Optimized for configuration and coordination, not data volume.',
    },
    {
      name: 'Zookeeper',
      x: 0.85,
      y: 0.36,
      q: 'PC/EC',
      notes: 'Zab consensus; the original coordination kernel.',
    },

    // PA/EL quadrant — available during partition, latency-optimized otherwise
    {
      name: 'DynamoDB',
      x: 0.16,
      y: 0.74,
      q: 'PA/EL',
      notes: 'Always-on. Eventual by default; strong-read consistency option costs a round-trip.',
    },
    {
      name: 'Cassandra',
      x: 0.22,
      y: 0.82,
      q: 'PA/EL',
      notes: 'Tunable per-query (ONE/QUORUM/ALL). Optimized for write throughput.',
    },
    {
      name: 'Riak',
      x: 0.3,
      y: 0.88,
      q: 'PA/EL',
      notes: 'Leaderless. Vector clocks surface siblings to the application.',
    },
    {
      name: 'Voldemort',
      x: 0.18,
      y: 0.92,
      q: 'PA/EL',
      notes: "LinkedIn's Dynamo. Less common today, but textbook PA/EL.",
    },

    // PC/EL quadrant — consistent during partition, latency-first in normal op
    {
      name: 'MongoDB',
      x: 0.62,
      y: 0.62,
      q: 'PC/EL',
      notes: 'Primary-secondary. Strong reads from primary; secondaries are stale by design.',
    },
    {
      name: 'HBase',
      x: 0.68,
      y: 0.72,
      q: 'PC/EL',
      notes: 'Region servers; strong reads from owning RS. CP during partition.',
    },

    // PA/EC quadrant — available during partition, consistent in normal op (rare/contradictory)
    {
      name: 'Cosmos DB',
      x: 0.32,
      y: 0.32,
      q: 'PA/EC',
      notes: 'Configurable. Strong consistency in normal op; weakens on partition. Five levels.',
    },
    {
      name: 'PNUTS',
      x: 0.4,
      y: 0.42,
      q: 'PA/EC',
      notes:
        "Yahoo's timeline. Per-record mastership; consistent in normal op, available under partition.",
    },
  ];

  const quadInfo = {
    'PC/EC': {
      title: 'PC / EC',
      tagline: 'Consistent under partition. Consistent always.',
      color: 'var(--emerald)',
      desc: 'During a partition, sacrifice availability to preserve consistency. Else, sacrifice latency to preserve consistency. The "always strong" stance. You pay latency continuously.',
    },
    'PA/EL': {
      title: 'PA / EL',
      tagline: 'Available under partition. Fast always.',
      color: 'var(--cyan)',
      desc: 'During a partition, sacrifice consistency to keep serving. Else, sacrifice consistency to stay fast. The "always cheap" stance. You eat eventual consistency continuously.',
    },
    'PC/EL': {
      title: 'PC / EL',
      tagline: 'Consistent under partition. Fast in normal operation.',
      color: 'var(--violet)',
      desc: 'During a partition, prefer consistency. Else, prefer speed. Typically: strong reads only when explicitly requested; everything else is local. A pragmatic middle.',
    },
    'PA/EC': {
      title: 'PA / EC',
      tagline: 'Available under partition. Consistent in normal operation.',
      color: 'var(--amber)',
      desc: 'The "best of both" pitch. Strong consistency when the network is healthy; weakens when forced. Partition-time semantics still bite; the marketing simply hides them better.',
    },
  };

  return (
    <div className="panel" style={{ padding: 0, background: 'var(--bg-deep)' }}>
      <div
        className="stack-on-mobile"
        style={{
          gridTemplateColumns: '1fr minmax(220px, 280px)',
        }}
      >
        {/* The 2x2 */}
        <div style={{ background: 'var(--surface)', padding: '32px 28px', minWidth: 0 }}>
          <svg viewBox="0 0 400 400" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <pattern
                id="quad-grid"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="var(--border)"
                  strokeOpacity="0.3"
                  strokeWidth="0.3"
                />
              </pattern>
            </defs>

            {/* Background grid */}
            <rect x="40" y="20" width="340" height="340" fill="url(#quad-grid)" />

            {/* Axes */}
            <line
              x1="40"
              y1="20"
              x2="40"
              y2="360"
              stroke="var(--border-bright)"
              strokeWidth="0.8"
            />
            <line
              x1="40"
              y1="360"
              x2="380"
              y2="360"
              stroke="var(--border-bright)"
              strokeWidth="0.8"
            />

            {/* Quadrant labels */}
            <g fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="0.16em">
              <text x="105" y="48" fill="var(--amber)" textAnchor="middle">
                PA / EC
              </text>
              <text x="295" y="48" fill="var(--emerald)" textAnchor="middle">
                PC / EC
              </text>
              <text x="105" y="350" fill="var(--cyan)" textAnchor="middle">
                PA / EL
              </text>
              <text x="295" y="350" fill="var(--violet)" textAnchor="middle">
                PC / EL
              </text>
            </g>

            {/* Mid-line dividers */}
            <line
              x1="210"
              y1="20"
              x2="210"
              y2="360"
              stroke="var(--border-bright)"
              strokeOpacity="0.5"
              strokeDasharray="3,4"
              strokeWidth="0.5"
            />
            <line
              x1="40"
              y1="190"
              x2="380"
              y2="190"
              stroke="var(--border-bright)"
              strokeOpacity="0.5"
              strokeDasharray="3,4"
              strokeWidth="0.5"
            />

            {/* Axis labels */}
            <text
              x="210"
              y="385"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--ink-dim)"
            >
              partition behavior — A (left) ⟷ C (right)
            </text>
            <text
              x="20"
              y="190"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--ink-dim)"
              transform="rotate(-90 20 190)"
            >
              normal-op preference — L (bottom) ⟷ C (top)
            </text>

            {/* System points */}
            {systems.map((s, i) => {
              const x = 40 + s.x * 340;
              const y = 20 + s.y * 340;
              const color = quadInfo[s.q].color;
              const isHover = hover === i;
              return (
                <g
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHover ? 7 : 4.5}
                    fill={color}
                    fillOpacity="0.3"
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  <text
                    x={x + 10}
                    y={y + 4}
                    fontFamily="JetBrains Mono, monospace"
                    fontSize="10.5"
                    fill={isHover ? color : 'var(--ink-2)'}
                    fontWeight={isHover ? 600 : 400}
                  >
                    {s.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail */}
        <div style={{ background: 'var(--surface)', padding: '24px 22px' }}>
          {hover !== null ? (
            <>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  color: quadInfo[systems[hover].q].color,
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                {systems[hover].q}
              </div>
              <h4
                style={{
                  fontFamily: 'Spectral, serif',
                  fontWeight: 400,
                  fontSize: 24,
                  color: 'var(--ink)',
                  margin: '0 0 6px',
                  letterSpacing: '-0.01em',
                }}
              >
                {systems[hover].name}
              </h4>
              <p
                style={{
                  fontFamily: 'Spectral, serif',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: quadInfo[systems[hover].q].color,
                  margin: '0 0 14px',
                }}
              >
                {quadInfo[systems[hover].q].tagline}
              </p>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                {systems[hover].notes}
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  color: 'var(--ink-faint)',
                  marginBottom: 14,
                  textTransform: 'uppercase',
                }}
              >
                The four flavors
              </div>
              {Object.values(quadInfo).map((q, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      color: q.color,
                      letterSpacing: '0.1em',
                      marginBottom: 4,
                    }}
                  >
                    {q.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Spectral, serif',
                      fontStyle: 'italic',
                      fontSize: 12.5,
                      color: 'var(--ink-2)',
                      lineHeight: 1.4,
                    }}
                  >
                    {q.tagline}
                  </div>
                </div>
              ))}
              <div
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border)',
                  fontFamily: 'Spectral, serif',
                  fontStyle: 'italic',
                  fontSize: 12,
                  color: 'var(--ink-faint)',
                }}
              >
                Hover any system to learn more.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
