import React from 'react';

export function LatencyComparison() {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '24px 24px 26px',
        marginTop: 24,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: '14px 16px',
          alignItems: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
        }}
      >
        {[
          {
            label: 'local read',
            bar: 0.04,
            t: '0.2 ms',
            color: 'var(--cyan)',
            desc: 'serve from this node, no check',
          },
          {
            label: 'session-cached read',
            bar: 0.08,
            t: '0.6 ms',
            color: 'var(--cyan)',
            desc: 'serve from this node, validate session token',
          },
          {
            label: 'quorum read (R=2/3)',
            bar: 0.55,
            t: '3.5 ms',
            color: 'var(--violet)',
            desc: 'wait for two replicas to agree',
          },
          {
            label: 'leader read + lease',
            bar: 0.55,
            t: '3.5 ms',
            color: 'var(--violet)',
            desc: 'route to leader, verify lease',
          },
          {
            label: 'linearizable read',
            bar: 0.92,
            t: '6.0 ms',
            color: 'var(--emerald)',
            desc: 'leader read with read-index, ensure majority',
          },
          {
            label: 'cross-region commit',
            bar: 1.0,
            t: '60+ ms',
            color: 'var(--emerald)',
            desc: 'consensus across geographies',
          },
        ].map((row, i) => (
          <React.Fragment key={i}>
            <span style={{ color: 'var(--ink-dim)' }}>{row.label}</span>
            <div
              style={{
                background: 'var(--bg-deep)',
                height: 14,
                borderRadius: 1,
                position: 'relative',
              }}
            >
              <div
                style={{
                  background: row.color,
                  height: '100%',
                  width: `${row.bar * 100}%`,
                  opacity: 0.7,
                  borderRadius: 1,
                }}
              />
            </div>
            <span style={{ color: row.color, fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
              {row.t}
            </span>
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: 'Spectral, serif',
          fontStyle: 'italic',
          fontSize: 12,
          color: 'var(--ink-faint)',
          textAlign: 'center',
        }}
      >
        Illustrative same-DC numbers. Cross-region multiplies everything by 10×–100×.
      </div>
    </div>
  );
}
