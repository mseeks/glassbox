import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X as XIcon, Play, RotateCcw } from 'lucide-react';
import { SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §10 — QUIC AND THE MODERN STORY
   How UDP became the foundation of the next-generation web.
   ─────────────────────────────────────────────────────────────────────── */

const QuicFeature = ({ title, body }) => (
  <div className="udp-panel-bordered" style={{ padding: 20 }}>
    <h3
      className="udp-display"
      style={{ fontSize: 17, color: 'var(--ink-warm)', margin: '0 0 8px 0' }}
    >
      {title}
    </h3>
    <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink-dim)', margin: 0 }}>{body}</p>
  </div>
);

export const SectionTen = () => {
  const [scenario, setScenario] = useState('h2'); // 'h2' (HTTP/2 over TCP) or 'h3' (HTTP/3 over QUIC)
  const [phase, setPhase] = useState('idle');
  // Stream tints map to the lesson's semantic accents (tcp / ok / signal) via
  // tokens so they deepen correctly on paper; `soft` is the matching tinted fill.
  const [streams, setStreams] = useState([
    { id: 'A', name: 'index.html', packets: [], color: 'var(--tcp)', soft: 'var(--tcp-soft)' },
    { id: 'B', name: 'styles.css', packets: [], color: 'var(--ok)', soft: 'var(--ok-soft)' },
    { id: 'C', name: 'app.js', packets: [], color: 'var(--signal)', soft: 'var(--signal-soft)' },
  ]);
  const timers = useRef([]);

  const cleanup = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setStreams((s) => s.map((st) => ({ ...st, packets: [] })));
  }, [cleanup]);

  const run = useCallback(() => {
    reset();
    setPhase('running');

    // For each of 3 streams, fire 6 packets. Drop one packet on stream B (CSS) at position 3.
    const N = 6;
    const dropStream = 'B';
    const dropPos = 3;

    streams.forEach((st, sIdx) => {
      for (let i = 0; i < N; i++) {
        const t = setTimeout(
          () => {
            setStreams((prev) =>
              prev.map((p) => {
                if (p.id !== st.id) return p;

                const isDropped = st.id === dropStream && i === dropPos;
                // For HTTP/2 over TCP: if there's a missing packet earlier in the
                // SINGLE TCP byte-stream, NOTHING else delivers across ALL streams.
                // We'll approximate this by: after the drop, all subsequent packets
                // are "held" not delivered.
                return {
                  ...p,
                  packets: [...p.packets, { idx: i, dropped: isDropped }],
                };
              }),
            );
          },
          250 + sIdx * 80 + i * 380,
        );
        timers.current.push(t);
      }
    });

    // Retransmit recovery — both H2 and H3 eventually recover, but at very different times
    const t2 = setTimeout(() => setPhase('done'), 250 + 3 * 80 + (N - 1) * 380 + 1200);
    timers.current.push(t2);
  }, [reset, streams]);

  useEffect(() => () => cleanup(), [cleanup]);

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 10  ·  QUIC"
          title="UDP's revenge."
          lede={
            <>
              The reason HTTP/3 abandoned TCP comes back to the same problem we saw in §6:{' '}
              <strong>head-of-line blocking</strong>. For modern multiplexed web traffic, TCP's
              strict in-order guarantee became a tax nobody wanted to pay.
            </>
          }
        />

        <div className="udp-prose" style={{ marginTop: 24 }}>
          <p>
            HTTP/2 multiplexes multiple streams over a single TCP connection: your HTML, your CSS,
            your JS, your images, all of them interleaved together down one pipe instead of fighting
            for separate sockets. The hope was that one connection would replace the old HTTP/1.1
            connection-per-resource mess. It mostly worked.
          </p>
          <p>
            But TCP doesn't <em>know</em> about HTTP streams. To TCP, the whole thing is one byte
            sequence. So if a single packet is lost, <strong>every stream stalls</strong>, even
            streams whose data already arrived intact. The page can't render because the CSS is
            missing, <em>even though the HTML and JS are sitting in the kernel buffer.</em>
          </p>
          <p>
            QUIC rebuilds the transport from scratch, on top of UDP, with{' '}
            <strong>per-stream loss recovery</strong>. Each stream is independent. Lose a CSS
            packet, the HTML and JS keep flowing.
          </p>
        </div>

        {/* The interactive demo */}
        <div className="udp-panel" style={{ marginTop: 28, padding: 28 }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 22,
              flexWrap: 'wrap',
            }}
          >
            <button
              className={`udp-tab ${scenario === 'h2' ? 'udp-tab-active' : ''}`}
              onClick={() => {
                setScenario('h2');
                reset();
              }}
            >
              HTTP/2 over TCP
            </button>
            <button
              className={`udp-tab ${scenario === 'h3' ? 'udp-tab-active' : ''}`}
              onClick={() => {
                setScenario('h3');
                reset();
              }}
            >
              HTTP/3 over QUIC (UDP)
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 24,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              className="udp-btn udp-btn-primary"
              onClick={run}
              disabled={phase === 'running'}
            >
              <Play size={14} />
              {phase === 'running' ? 'Streaming...' : 'Stream 3 resources, drop a CSS packet'}
            </button>
            <button className="udp-btn udp-btn-ghost" onClick={reset}>
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          {/* Streams */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {streams.map((st) => {
              return (
                <div key={st.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 6,
                    }}
                  >
                    <div
                      className="udp-mono"
                      style={{
                        fontSize: 12,
                        color: st.color,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                      }}
                    >
                      Stream {st.id} · {st.name}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: 4,
                      height: 32,
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => {
                      const pkt = st.packets[i];
                      if (!pkt) {
                        return (
                          <div
                            key={i}
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--line)',
                              borderRadius: 2,
                            }}
                          />
                        );
                      }
                      let bg, bd, content;
                      if (pkt.dropped) {
                        bg = 'transparent';
                        bd = 'var(--lost)';
                        content = <XIcon size={14} color="var(--lost)" strokeWidth={2.5} />;
                      } else {
                        // In H2: if this packet is on or after a dropped one (in any stream — they share TCP), it's HELD
                        // In H3: if this packet is on the SAME stream and AFTER a drop, HELD. Otherwise delivered.
                        let isHeld = false;
                        if (scenario === 'h2') {
                          // Check if any stream had drop earlier
                          const anyDropTime = Math.min(
                            ...streams.map((ss) => {
                              const idx = ss.packets.findIndex((p) => p.dropped);
                              return idx === -1 ? Infinity : idx;
                            }),
                          );
                          if (anyDropTime !== Infinity && i > anyDropTime - 1) isHeld = true;
                          // For the dropping stream's own dropped packet, position i = dropPos. After that, held.
                        } else {
                          // H3: stalled only on the same stream
                          const myDrop = st.packets.findIndex((p) => p.dropped);
                          if (myDrop !== -1 && i > myDrop) isHeld = true;
                        }
                        if (isHeld) {
                          bg = 'var(--warn-soft)';
                          bd = 'var(--warn)';
                          content = (
                            <span
                              style={{
                                fontSize: 9,
                                color: 'var(--warn)',
                                fontFamily: 'JetBrains Mono',
                                fontWeight: 600,
                              }}
                            >
                              HOLD
                            </span>
                          );
                        } else {
                          bg = st.soft;
                          bd = st.color;
                          content = <Check size={14} color={st.color} strokeWidth={2.5} />;
                        }
                      }
                      return (
                        <div
                          key={i}
                          style={{
                            background: bg,
                            border: `1px solid ${bd}`,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'udp-fade-in 0.3s ease both',
                            transition: 'all 0.2s',
                          }}
                        >
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Observation */}
          {phase === 'done' && (
            <div
              className="udp-rise"
              style={{
                marginTop: 22,
                padding: '18px 22px',
                background: scenario === 'h2' ? 'var(--lost-soft)' : 'var(--ok-soft)',
                borderLeft: `3px solid ${scenario === 'h2' ? 'var(--lost)' : 'var(--ok)'}`,
                borderRadius: '0 4px 4px 0',
                fontSize: 14,
                color: 'var(--ink)',
                lineHeight: 1.7,
              }}
            >
              {scenario === 'h2' ? (
                <>
                  <strong style={{ color: 'var(--lost)' }}>HTTP/2 head-of-line.</strong> The CSS
                  drop stalled <em>every other stream</em>, even the HTML and JS that arrived
                  perfectly fine. The browser can't paint until TCP retransmits the CSS packet.
                </>
              ) : (
                <>
                  <strong style={{ color: 'var(--ok)' }}>QUIC per-stream recovery.</strong> The CSS
                  drop affects only the CSS stream. HTML and JS deliver immediately and the browser
                  can already start parsing. Independent streams stay independent.
                </>
              )}
            </div>
          )}
        </div>

        <div className="udp-divider">⌑ what QUIC builds on top of UDP</div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 18,
          }}
        >
          <QuicFeature
            title="Per-stream loss recovery"
            body="Streams are independent in both flow control and retransmission. A loss on one doesn't stall the others. They simply don't wait."
          />
          <QuicFeature
            title="0-RTT handshake"
            body="On a return visit, application data can be sent in the very first packet, with no waiting for a handshake to complete."
          />
          <QuicFeature
            title="Encryption is mandatory"
            body="TLS 1.3 is fused directly into the transport, so there is simply no such thing as unencrypted QUIC on the wire. Middleboxes can't peek or modify packets."
          />
          <QuicFeature
            title="Connection migration"
            body="A QUIC connection is identified by a Connection ID, not an IP+port tuple. Switch from WiFi to LTE mid-download and the connection survives the change of address entirely. No reconnect."
          />
        </div>

        <p className="udp-prose" style={{ marginTop: 28 }}>
          The bigger lesson: when TCP's promises stopped fitting the application's needs, the answer
          wasn't to extend TCP. It was to{' '}
          <strong>drop down to UDP and build the right transport on top.</strong> Down, not around.
          That's the recurring pattern. UDP is the foundation; the transport you actually use is the
          one you compose above it.
        </p>
      </div>
    </section>
  );
};
