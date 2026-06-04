// One unary gRPC call, framed on HTTP/2: HEADERS → DATA → (DATA…) → trailers.
const FRAMES = [
  {
    t: 'HEADERS',
    c: 'var(--amber)',
    lines: [':method = POST', ':path = /bank.Account/Withdraw', 'content-type = application/grpc'],
  },
  {
    t: 'DATA',
    c: 'var(--cyan)',
    lines: [
      '[1 byte] compressed-flag = 0',
      '[4 bytes] message length',
      '[N bytes] protobuf-encoded Request',
    ],
  },
  { t: 'DATA …', c: 'var(--cyan)', lines: ['(more messages, if streaming)'] },
  {
    t: 'HEADERS (trailers)',
    c: 'var(--mint)',
    lines: ['grpc-status = 0  (OK)', 'grpc-message = ""'],
  },
];

export default function CallAnatomy() {
  return (
    <div className="gx-panel pad" style={{ marginTop: 22 }}>
      <div className="gx-panel-label">
        <span className="dot" />
        one unary call, framed on HTTP/2
      </div>
      <div style={{ display: 'grid', gap: 9 }}>
        {FRAMES.map((f, i) => (
          <div
            key={i}
            style={{
              border: `1px solid var(--line2)`,
              borderLeft: `3px solid ${f.c}`,
              borderRadius: 8,
              padding: '11px 14px',
              background: 'var(--gx-well)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                color: f.c,
                letterSpacing: '0.06em',
                marginBottom: 6,
              }}
            >
              {f.t}
            </div>
            {f.lines.map((l, j) => (
              <div
                key={j}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11.5,
                  color: 'var(--ink-dim)',
                  lineHeight: 1.7,
                }}
              >
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13.5, color: 'var(--ink-dim)', margin: '14px 0 0' }}>
        The method is just an HTTP/2 path:{' '}
        <code className="gx-kw" style={{ color: 'var(--ink)' }}>
          /package.Service/Method
        </code>
        . The status rides in{' '}
        <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>trailers</em>. Those are headers
        sent <b>after</b> the body, so a server can start streaming before it knows the final
        outcome.
      </p>
    </div>
  );
}
