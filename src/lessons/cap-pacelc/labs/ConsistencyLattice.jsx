import { useState } from 'react';
import { CONSISTENCY_LEVELS } from '../components/data.js';

export function ConsistencyLattice() {
  const [selected, setSelected] = useState('lin');
  const level = CONSISTENCY_LEVELS.find((l) => l.id === selected);

  return (
    <div className="panel" style={{ padding: 0, background: 'var(--bg-deep)' }}>
      <div className="stack-on-mobile-lattice">
        {/* Ladder */}
        <div
          style={{
            background: 'var(--surface)',
            padding: '22px 14px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--ink-faint)',
              textTransform: 'uppercase',
              marginBottom: 14,
              padding: '0 4px',
            }}
          >
            strongest
          </div>

          {CONSISTENCY_LEVELS.map((l) => (
            <div
              key={l.id}
              role="button"
              tabIndex={0}
              aria-label={`Select consistency level: ${l.name}`}
              aria-pressed={selected === l.id}
              onClick={() => setSelected(l.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(l.id);
                }
              }}
              style={{
                padding: '9px 12px',
                marginLeft: `${l.tier * 4}px`,
                marginBottom: 3,
                cursor: 'pointer',
                background:
                  selected === l.id
                    ? `${l.color === 'var(--emerald)' ? 'var(--emerald-soft)' : l.color === 'var(--cyan)' ? 'var(--cyan-soft)' : l.color === 'var(--violet)' ? 'var(--violet-soft)' : 'var(--amber-soft)'}`
                    : 'transparent',
                border: `1px solid ${selected === l.id ? l.color : 'transparent'}`,
                borderLeft: `2px solid ${l.color}`,
                transition: 'all 200ms ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'Spectral, serif',
                  fontSize: 13.5,
                  fontWeight: selected === l.id ? 500 : 400,
                  color: selected === l.id ? l.color : 'var(--ink-2)',
                  letterSpacing: '-0.005em',
                  lineHeight: 1.2,
                  whiteSpace: 'normal',
                }}
              >
                {l.name}
              </div>
            </div>
          ))}

          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--ink-faint)',
              textTransform: 'uppercase',
              marginTop: 14,
              padding: '0 4px',
            }}
          >
            weakest
          </div>
        </div>

        {/* Detail */}
        <div style={{ background: 'var(--surface)', padding: '24px 28px' }}>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              color: level.color,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            Level
          </div>
          <h3
            style={{
              fontFamily: 'Spectral, serif',
              fontWeight: 300,
              fontSize: 32,
              lineHeight: 1.05,
              color: 'var(--ink)',
              margin: '0 0 8px',
              letterSpacing: '-0.015em',
            }}
          >
            {level.name}
          </h3>
          <p
            style={{
              fontFamily: 'Spectral, serif',
              fontStyle: 'italic',
              fontSize: 17,
              color: level.color,
              margin: '0 0 22px',
            }}
          >
            {level.short}
          </p>

          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 22 }}>
            {level.desc}
          </p>

          <div
            style={{
              display: 'grid',
              gap: 14,
              marginBottom: 18,
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  color: 'var(--emerald)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Prevents
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>
                {level.rules}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  color: 'var(--coral)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Permits
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>
                {level.permits}
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 18,
            }}
          >
            <div style={{ flex: '1 1 200px' }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  color: 'var(--ink-faint)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Systems
              </div>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: 'var(--ink-2)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {level.systems.join(', ')}
              </div>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  letterSpacing: '0.16em',
                  color: 'var(--ink-faint)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Cost
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--ink-2)' }}>
                {level.cost}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
