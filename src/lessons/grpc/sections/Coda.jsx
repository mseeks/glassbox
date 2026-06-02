import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';

// § 06 — where gRPC fits among REST, GraphQL, and queues; its browser caveat;
// threads to pull next; and the closing line.
const ROWS = [
  ['gRPC', 'Internal service-to-service, streaming, polyglot, low latency', 'var(--cyan)'],
  ['REST / JSON', 'Public APIs, browser clients, human-debuggable, cacheable', 'var(--amber)'],
  ['GraphQL', 'Client-shaped queries over many resources, aggregation layers', 'var(--violet)'],
  [
    'Message queue',
    'Async, fire-and-forget, decoupled producers/consumers, durability',
    'var(--mint)',
  ],
];

const NEXT = [
  [
    'Write one end-to-end.',
    'Define a service, generate Go stubs with protoc, and implement a bidi stream. The seams teach more than any reading.',
  ],
  [
    'Interceptors & middleware.',
    "gRPC's equivalent of HTTP middleware: the layer where auth, logging, tracing and retries actually live.",
  ],
  [
    'Deadline & retry policy.',
    'Service configs, exponential backoff, hedging, plus the idempotency design that makes them safe.',
  ],
  [
    'gRPC over QUIC / HTTP/3.',
    'How moving off TCP removes the last head-of-line stall, and what changes for gRPC.',
  ],
  [
    'Protobuf internals.',
    'Packed repeated fields, oneof, maps on the wire, and the FileDescriptor reflection format.',
  ],
];

export default function Coda() {
  return (
    <section className="gx-block" style={{ background: 'var(--bg2)' }}>
      <div className="gx-section narrow">
        <SectionHead
          tag="§ 06 · where it fits"
          title="When to reach for it. And when not."
          lede="gRPC is sharp for one job and awkward for others. Knowing the edge is the skill."
        />
        <div className="gx-prose">
          <Reveal base="gx-fade">
            <div className="gx-panel pad">
              <div className="gx-panel-label">
                <span className="dot" />
                the right tool by job
              </div>
              <div style={{ display: 'grid', gap: 9 }}>
                {ROWS.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '108px 1fr',
                      gap: 12,
                      alignItems: 'baseline',
                      paddingBottom: 9,
                      borderBottom: i < ROWS.length - 1 ? '1px solid var(--line)' : 'none',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: r[2] }}>
                      {r[0]}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--ink-dim)' }}>{r[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal base="gx-fade">
            <p style={{ marginTop: 26 }}>
              The biggest practical caveat: <strong>browsers can't speak raw gRPC</strong>. They
              can't fully control HTTP/2 framing or read trailers from JavaScript. You need a{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                grpc-web
              </code>{' '}
              shim and a proxy. And because the wire is binary, you lose{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                curl
              </code>
              -and-eyeball debugging; you reach for{' '}
              <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                grpcurl
              </code>{' '}
              and reflection instead. For a public, cache-friendly, human-poked API that browsers
              and curious humans hit directly, REST is still usually the right call. Reach for it.
            </p>
          </Reveal>
          <Reveal base="gx-fade">
            <h3 className="gx-h3" style={{ marginTop: 34 }}>
              Where to go next
            </h3>
            <p>
              You now have the real model: a typed contract in Protocol Buffers, multiplexed streams
              over HTTP/2, four call shapes with built-in backpressure, and a deliberately leaky
              abstraction over the network. Threads worth pulling:
            </p>
            <ul
              style={{ paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10, marginTop: 14 }}
            >
              {NEXT.map((x, i) => (
                <li key={i} style={{ display: 'flex', gap: 11 }}>
                  <span
                    style={{
                      color: 'var(--cyan)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 15 }}>
                    <strong style={{ color: 'var(--ink-bright)' }}>{x[0]}</strong>{' '}
                    <span style={{ color: 'var(--ink-dim)' }}>{x[1]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal base="gx-fade">
            <p
              style={{
                marginTop: 30,
                fontSize: 17,
                color: 'var(--ink-bright)',
                fontFamily: "'Bricolage Grotesque'",
                lineHeight: 1.4,
              }}
            >
              The wire was never hidden. What gRPC gave it was a contract, a fast alphabet, and
              enough honesty to admit when it breaks.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
