import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Send, Check, X as XIcon } from 'lucide-react';
import { Pill, Label, SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §1 — THE WIRE UNDERNEATH
   The substrate of best-effort IP that every transport protocol rides.
   ─────────────────────────────────────────────────────────────────────── */

export const SectionOne = () => {
  const [packet, setPacket] = useState(null);
  const [hopIdx, setHopIdx] = useState(0);
  const [drop, setDrop] = useState(false);
  const timerRef = useRef(null);

  const hops = useMemo(
    () => [
      { label: 'Source', sub: 'your host' },
      { label: 'R1', sub: 'home router' },
      { label: 'R2', sub: 'ISP edge' },
      { label: 'R3', sub: 'backbone' },
      { label: 'R4', sub: 'peer ISP' },
      { label: 'R5', sub: 'remote edge' },
      { label: 'Dest', sub: 'their host' },
    ],
    [],
  );

  const send = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPacket('flying');
    setHopIdx(0);
    setDrop(false);
    const willDrop = Math.random() < 0.18;
    const dropAt = willDrop ? 2 + Math.floor(Math.random() * 3) : -1;
    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      setHopIdx(i);
      if (i === dropAt) {
        setDrop(true);
        clearInterval(timerRef.current);
        setTimeout(() => setPacket(null), 1400);
      } else if (i >= hops.length - 1) {
        clearInterval(timerRef.current);
        setTimeout(() => {
          setPacket('arrived');
        }, 200);
        setTimeout(() => {
          setPacket(null);
        }, 1800);
      }
    }, 380);
  }, [hops.length]);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 01  ·  Substrate"
          title="The wire underneath everything."
          lede={
            <>
              Before any protocol, there is <strong>IP</strong>. It is the best-effort delivery
              service the internet is actually built on. Packets get launched into it the way
              letters are launched into the postal system: with hope, not a guarantee.
            </>
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)',
            gap: 48,
            marginTop: 32,
          }}
          className="udp-grid-collapse"
        >
          <div className="udp-prose">
            <p>
              Every packet that crosses the internet hops through a sequence of routers, each one
              independently deciding where to forward it next. Each hop is a fresh decision. Routers
              have finite buffers, links have finite bandwidth, and the choices made at each hop are
              guided by routing tables that update continuously as the topology shifts.
            </p>
            <p>
              When a router's buffer fills, the simplest thing it can do is{' '}
              <strong>drop the packet</strong>. Just drop it. When two paths exist, packets in the
              same conversation may take <strong>different routes</strong> and arrive out of order,
              and when something goes briefly wrong a copy can get made and{' '}
              <strong>duplicated</strong>.
            </p>
            <p>
              IP makes <em>no promises about any of this.</em> It promises only "best effort."
              Reliability, ordering, deduplication: if you want them, you build them on top.
            </p>
            <p>
              This is the substrate UDP exposes. Every guarantee TCP hands you is an elaborate
              fiction, painstakingly maintained, layered on top of this same lossy reality.
            </p>
          </div>

          <div>
            <div className="udp-panel" style={{ padding: 24 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                <Label>Fig. 1: A packet's journey</Label>
                <button
                  className="udp-btn udp-btn-primary"
                  onClick={send}
                  style={{ padding: '8px 14px' }}
                >
                  <Send size={12} />
                  Send
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  position: 'relative',
                }}
              >
                {hops.map((hop, i) => {
                  const isActive = packet && i === hopIdx;
                  const isPassed = packet && i < hopIdx;
                  const isDropped = drop && i === hopIdx;
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 12px',
                        background: isActive
                          ? isDropped
                            ? 'var(--lost-soft)'
                            : 'var(--signal-soft)'
                          : 'transparent',
                        border: `1px solid ${isActive ? (isDropped ? 'var(--lost-edge)' : 'var(--signal-edge)') : 'var(--line-faint)'}`,
                        borderRadius: 3,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 3,
                          background: isActive
                            ? isDropped
                              ? 'var(--lost)'
                              : 'var(--signal)'
                            : isPassed
                              ? 'var(--surface-3)'
                              : 'transparent',
                          border: `1px solid ${isPassed ? 'var(--line-bright)' : 'var(--line)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isActive ? '#1a1108' : 'var(--ink-faint)',
                          fontFamily: 'JetBrains Mono',
                          fontSize: 10,
                          fontWeight: 700,
                          boxShadow: isActive && !isDropped ? '0 0 12px var(--signal)' : 'none',
                        }}
                      >
                        {isDropped ? '×' : isPassed ? '✓' : i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          className="udp-mono"
                          style={{
                            fontSize: 12,
                            color: isActive ? 'var(--ink-warm)' : 'var(--ink)',
                            fontWeight: 500,
                          }}
                        >
                          {hop.label}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{hop.sub}</div>
                      </div>
                      {isDropped && (
                        <Pill tone="lost" icon={XIcon}>
                          Buffer full: drop
                        </Pill>
                      )}
                      {packet === 'arrived' && i === hops.length - 1 && (
                        <Pill tone="ok" icon={Check}>
                          Arrived
                        </Pill>
                      )}
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 18,
                  fontSize: 12,
                  color: 'var(--ink-dim)',
                  lineHeight: 1.55,
                }}
              >
                Click <strong>Send</strong>. Most packets arrive. Some drop at an intermediate
                router with no notification to the sender or receiver. That's the truth of IP.
              </div>
            </div>
          </div>
        </div>

        <div className="udp-divider">⌑ best-effort means just that</div>

        <div className="udp-prose" style={{ marginTop: 24, maxWidth: 920 }}>
          <p>
            Two protocols ride on top of IP for almost all internet traffic:
            <strong> TCP</strong> and <strong style={{ color: 'var(--signal)' }}>UDP</strong>. They
            take opposite approaches to the same lossy substrate.
          </p>
        </div>
      </div>
    </section>
  );
};
