// A representative slice of gRPC's ~17 status codes, toned by what they tell you
// to do: ok (green), don't-retry (coral), maybe-retry (cyan).
const STATUS = [
  ['0', 'OK', 'Success.', 'ok'],
  ['3', 'INVALID_ARGUMENT', "Client sent bad data. Don't retry.", 'warn'],
  [
    '4',
    'DEADLINE_EXCEEDED',
    'Ran past the deadline. The work may or may not have happened.',
    'warn',
  ],
  ['5', 'NOT_FOUND', 'No such entity.', 'warn'],
  ['8', 'RESOURCE_EXHAUSTED', 'Rate-limited / out of quota. Back off and retry.', 'info'],
  ['13', 'INTERNAL', 'Server bug or invariant broken.', 'warn'],
  ['14', 'UNAVAILABLE', 'Transient — server down, connection dropped. Safe to retry.', 'info'],
];

export default function StatusGrid() {
  const tone = { ok: 'var(--mint)', warn: 'var(--coral)', info: 'var(--cyan)' };
  return (
    <div className="gx-panel pad" style={{ marginTop: 22 }}>
      <div className="gx-panel-label">
        <span className="dot" />a slice of the 17 status codes
      </div>
      <div style={{ display: 'grid', gap: 7 }}>
        {STATUS.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '26px 1fr',
              gap: 11,
              alignItems: 'baseline',
              paddingBottom: 7,
              borderBottom: i < STATUS.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: tone[s[3]],
                textAlign: 'right',
              }}
            >
              {s[0]}
            </span>
            <div>
              <span
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-bright)' }}
              >
                {s[1]}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-dim)', marginLeft: 8 }}>{s[2]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
