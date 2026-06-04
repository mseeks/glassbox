import { LEVELS, MATRIX } from './data.js';

export function MapMatrix({ scenarioId, levelId, onSelectCell }) {
  // Reduce matrix to the 5 anomalies that match our 5 chapters
  const rows = [
    { anomaly: 'Dirty Read', sid: 'dirty_read' },
    { anomaly: 'Non-Repeatable Read', sid: 'non_repeatable' },
    { anomaly: 'Read Skew', sid: 'read_skew', hint: 'Phantom reads belong to this family.' },
    { anomaly: 'Lost Update', sid: 'lost_update' },
    { anomaly: 'Write Skew', sid: 'write_skew' },
  ];

  return (
    <section
      className="iso-fade-in"
      style={{
        width: '100%',
        maxWidth: 800,
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        minWidth: 0,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div
          className="iso-ui"
          style={{
            fontSize: 10,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(var(--iso-ink-rgb), 0.78)',
            marginBottom: 6,
          }}
        >
          The territory
        </div>
        <h2
          className="iso-display"
          style={{
            fontSize: 'clamp(22px, 2.4vw, 28px)',
            fontWeight: 500,
            margin: 0,
            color: 'var(--ink)',
            fontStyle: 'italic',
          }}
        >
          Five anomalies, five promises
        </h2>
        <p
          className="iso-body"
          style={{
            fontSize: 14,
            color: 'rgba(var(--iso-ink-rgb), 0.78)',
            margin: '8px auto 0',
            maxWidth: 480,
            lineHeight: 1.55,
          }}
        >
          Tap any cell to study that anomaly at the level named in its column. The cell with the dot
          is where you are right now. Start anywhere.
        </p>
      </div>

      <div className="iso-card" style={{ padding: '20px 22px', borderRadius: 12, minWidth: 0 }}>
        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
          <table
            style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 520 }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '4px 10px 12px',
                    fontSize: 9,
                    color: 'rgba(var(--iso-ink-rgb), 0.78)',
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                  className="iso-ui"
                >
                  Anomaly &nbsp;\ &nbsp;Level
                </th>
                {LEVELS.map((l) => {
                  const active = l.id === levelId;
                  return (
                    <th
                      key={l.id}
                      style={{
                        textAlign: 'center',
                        padding: '4px 6px 12px',
                        fontSize: 10,
                        color: active ? 'var(--ink)' : 'rgba(var(--iso-ink-rgb), 0.65)',
                        fontWeight: active ? 700 : 500,
                        letterSpacing: '0.06em',
                      }}
                      className="iso-ui"
                    >
                      {l.short}
                      <div
                        style={{
                          height: 2,
                          marginTop: 6,
                          background: active ? 'var(--iso-teal)' : 'transparent',
                          borderRadius: 999,
                        }}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const isActiveRow = row.sid === scenarioId;
                const matrixRow =
                  MATRIX.find((m) => m.anomaly === row.anomaly) ||
                  MATRIX.find((m) => m.anomaly.includes(row.anomaly.split(' ')[0]));
                return (
                  <tr key={row.sid}>
                    <td
                      className="iso-body"
                      style={{
                        padding: '10px 10px',
                        fontSize: 13,
                        color: isActiveRow ? 'var(--ink)' : 'rgba(var(--iso-ink-rgb), 0.65)',
                        fontWeight: isActiveRow ? 600 : 400,
                        borderTop: ri > 0 ? '1px solid rgba(var(--iso-ink-rgb), 0.05)' : 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: 4,
                          height: 4,
                          borderRadius: 999,
                          background: isActiveRow ? 'var(--iso-teal)' : 'transparent',
                          marginRight: 8,
                          transform: 'translateY(-2px)',
                        }}
                      />
                      {row.anomaly}
                    </td>
                    {LEVELS.map((l) => {
                      const v = matrixRow ? matrixRow.levels[l.id] : 0;
                      const isActiveCell = l.id === levelId && isActiveRow;
                      return (
                        <td
                          key={l.id}
                          style={{
                            textAlign: 'center',
                            padding: '6px 6px',
                            borderTop: ri > 0 ? '1px solid rgba(var(--iso-ink-rgb), 0.05)' : 'none',
                          }}
                        >
                          <button
                            onClick={() => onSelectCell(row.sid, l.id)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 6,
                              border: isActiveCell
                                ? '1px solid var(--iso-teal)'
                                : '1px solid transparent',
                              background: isActiveCell
                                ? 'rgba(var(--iso-teal-rgb), 0.15)'
                                : v === 1
                                  ? 'rgba(var(--iso-green-rgb), 0.06)'
                                  : v === 0.5
                                    ? 'rgba(var(--iso-amber-rgb), 0.06)'
                                    : 'rgba(var(--iso-coral-rgb), 0.06)',
                              color:
                                v === 1
                                  ? 'var(--iso-green)'
                                  : v === 0.5
                                    ? 'var(--iso-amber)'
                                    : 'var(--iso-coral)',
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 200ms ease',
                              position: 'relative',
                            }}
                            title={`${row.anomaly} at ${l.name}: ${v === 1 ? 'prevented' : v === 0.5 ? 'depends' : 'permitted'}`}
                            onMouseEnter={(e) => {
                              if (!isActiveCell)
                                e.currentTarget.style.background = 'rgba(var(--iso-ink-rgb), 0.06)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isActiveCell) {
                                e.currentTarget.style.background =
                                  v === 1
                                    ? 'rgba(var(--iso-green-rgb), 0.06)'
                                    : v === 0.5
                                      ? 'rgba(var(--iso-amber-rgb), 0.06)'
                                      : 'rgba(var(--iso-coral-rgb), 0.06)';
                              }
                            }}
                          >
                            {v === 1 ? '✓' : v === 0.5 ? '~' : '✗'}
                            {isActiveCell && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: -4,
                                  right: -4,
                                  width: 8,
                                  height: 8,
                                  borderRadius: 999,
                                  background: 'var(--iso-teal)',
                                  boxShadow: '0 0 8px var(--iso-teal)',
                                }}
                              />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className="iso-body"
          style={{
            fontSize: 12,
            color: 'rgba(var(--iso-ink-rgb), 0.78)',
            marginTop: 16,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          <span style={{ color: 'var(--iso-green)', fontWeight: 600 }}>✓ prevented</span>{' '}
          &nbsp;·&nbsp;
          <span style={{ color: 'var(--iso-amber)', fontWeight: 600 }}>
            ~ implementation-dependent
          </span>{' '}
          &nbsp;·&nbsp;
          <span style={{ color: 'var(--iso-coral)', fontWeight: 600 }}>✗ permitted</span>
        </div>
      </div>
    </section>
  );
}
