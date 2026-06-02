// The three things gRPC stands on: Protocol Buffers, HTTP/2, generated stubs.
const COLS = [
  {
    c: 'var(--amber)',
    k: 'Protocol Buffers',
    d: 'A strict schema + a compact binary format. The contract both sides compile against.',
  },
  {
    c: 'var(--cyan)',
    k: 'HTTP/2',
    d: 'Many streams multiplexed over a single connection, so one socket carries the bytes for every call at once and real streaming becomes possible. The transport.',
  },
  {
    c: 'var(--violet)',
    k: 'Generated stubs',
    d: 'Code-gen turns the contract into typed client + server methods in your language.',
  },
];

export default function ThreePillars() {
  return (
    <div className="pil-grid">
      {COLS.map((p, i) => (
        <div
          key={i}
          className="gx-panel"
          style={{ padding: '18px 16px', borderTop: `2px solid ${p.c}` }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: p.c,
              letterSpacing: '0.12em',
            }}
          >
            0{i + 1}
          </div>
          <div
            style={{
              fontFamily: "'Bricolage Grotesque'",
              fontSize: 19,
              fontWeight: 600,
              color: 'var(--ink-bright)',
              margin: '8px 0 7px',
            }}
          >
            {p.k}
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{p.d}</div>
        </div>
      ))}
    </div>
  );
}
