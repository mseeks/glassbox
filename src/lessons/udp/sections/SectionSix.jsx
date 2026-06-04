import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Label, SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §6 — HEAD-OF-LINE BLOCKING
   The central problem TCP can't solve. Side-by-side: drop a single
   packet, watch TCP stall everything behind it while UDP delivers on.
   ─────────────────────────────────────────────────────────────────────── */

const LegendRow = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span
      style={{
        width: 10,
        height: 10,
        background: color === 'var(--lost)' ? 'transparent' : color,
        border: `1px solid ${color}`,
        borderRadius: 2,
      }}
    />
    <span style={{ letterSpacing: '0.05em' }}>{label}</span>
  </div>
);

const ProtocolLane = ({
  name,
  tagline,
  color,
  borderColor,
  delivered,
  total,
  lostPacket,
  showStall,
  elapsed,
}) => {
  // What is in the receiver's app buffer vs kernel buffer
  // For TCP: packets after lost have arrived at kernel (after their normal time)
  //          but are NOT in delivered until the lost one is retransmitted
  // For UDP: there is no kernel buffer — what's not in delivered just hasn't arrived (or is lost)

  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        padding: 20,
        background: 'var(--bg-deep)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 4,
        }}
      >
        <h3 className="udp-display" style={{ fontSize: 30, color, margin: 0 }}>
          {name}
        </h3>
        <span className="udp-mono" style={{ fontSize: 11, color: 'var(--ink-faint-fn)' }}>
          {delivered.length} / {total - (showStall ? 0 : 1)}
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-dim)', margin: '0 0 16px 0' }}>{tagline}</p>

      {/* Slots */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 1fr)',
          gap: 4,
          marginBottom: 14,
        }}
      >
        {Array.from({ length: total }).map((_, idx) => {
          const n = idx + 1;
          const wasDelivered = delivered.find((d) => d.n === n);

          let bg = 'var(--surface-2)';
          let bd = 'var(--line)';
          let fg = 'var(--ink-faint-fn)';
          let label = String(n);
          let stalled = false;

          if (showStall && n === lostPacket) {
            const lostAt = lostPacket * 220;
            if (elapsed >= lostAt && !wasDelivered) {
              // shown as lost-pending in TCP
              bg = 'var(--lost-soft)';
              bd = 'var(--lost)';
              fg = 'var(--lost)';
              label = '!';
              stalled = true;
            } else if (wasDelivered) {
              bg = 'var(--ok-soft)';
              bd = 'var(--ok)';
              fg = 'var(--ok)';
            }
          } else if (n === lostPacket) {
            // UDP: lost packet
            const lostAt = lostPacket * 220;
            if (elapsed >= lostAt) {
              bg = 'transparent';
              bd = 'var(--lost)';
              fg = 'var(--lost)';
              label = '×';
            }
          } else if (wasDelivered) {
            bg = 'var(--ok-soft)';
            bd = 'var(--ok)';
            fg = 'var(--ok)';
          } else if (showStall && n > lostPacket) {
            // Has the packet "arrived" at kernel?
            const arrivedTime = n * 220;
            if (elapsed >= arrivedTime) {
              // arrived but held — render as held
              bg = 'var(--warn-soft)';
              bd = 'var(--warn)';
              fg = 'var(--warn)';
              stalled = true;
            }
          }

          return (
            <div
              key={n}
              style={{
                aspectRatio: '1',
                background: bg,
                border: `1px solid ${bd}`,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'JetBrains Mono',
                fontSize: 13,
                fontWeight: 600,
                color: fg,
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              {label}
              {stalled && showStall && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    border: `1px dashed ${bd}`,
                    borderRadius: 3,
                    animation: 'udp-blink 1.4s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend / state */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 11,
          fontFamily: 'JetBrains Mono',
          color: 'var(--ink-faint-fn)',
        }}
      >
        {showStall ? (
          <>
            <LegendRow color="var(--ok)" label="delivered to app" />
            <LegendRow color="var(--lost)" label="lost: awaiting retransmit" />
            <LegendRow color="var(--warn)" label="arrived but HELD in buffer" />
          </>
        ) : (
          <>
            <LegendRow color="var(--ok)" label="delivered to app immediately" />
            <LegendRow color="var(--lost)" label="lost: gone forever" />
          </>
        )}
      </div>
    </div>
  );
};

export const SectionSix = () => {
  const [phase, setPhase] = useState('idle');
  const [tcpDelivered, setTcpDelivered] = useState([]); // [{n, arriveAt}]
  const [udpDelivered, setUdpDelivered] = useState([]);
  const [tick, setTick] = useState(0);
  const lostPacket = 5;
  const total = 10;
  const tcpTimers = useRef([]);
  const udpTimers = useRef([]);
  const tickTimer = useRef(null);

  const cleanup = useCallback(() => {
    tcpTimers.current.forEach(clearTimeout);
    udpTimers.current.forEach(clearTimeout);
    if (tickTimer.current) clearInterval(tickTimer.current);
    tcpTimers.current = [];
    udpTimers.current = [];
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setTcpDelivered([]);
    setUdpDelivered([]);
    setTick(0);
  }, [cleanup]);

  const run = useCallback(() => {
    reset();
    setPhase('running');
    setTick(0);
    tickTimer.current = setInterval(() => setTick((t) => t + 1), 100);

    // UDP behavior: packets 1-10, packet 5 is lost. Others arrive at normal pace.
    // Each packet arrives at i * 220ms, except 5 which never arrives.
    for (let i = 1; i <= total; i++) {
      if (i === lostPacket) continue; // lost
      const t = setTimeout(() => {
        setUdpDelivered((prev) => [...prev, { n: i, arriveAt: i * 220 }]);
      }, i * 220);
      udpTimers.current.push(t);
    }

    // TCP behavior: packets 1-4 arrive normally at i * 220ms.
    // Packet 5 lost. Packets 6, 7, 8, 9, 10 ARRIVE at receiver kernel
    // but are held in the buffer (NOT delivered to application).
    // After timeout (1700ms past packet 5's expected arrival), packet 5
    // is retransmitted; arrives at retrans_time. Then ALL of 5, 6, 7, 8, 9, 10
    // are delivered together at that point.
    for (let i = 1; i < lostPacket; i++) {
      const t = setTimeout(() => {
        setTcpDelivered((prev) => [...prev, { n: i, arriveAt: i * 220 }]);
      }, i * 220);
      tcpTimers.current.push(t);
    }
    // After a retransmit-timeout (we'll say 2000ms beyond packet 5's expected time),
    // 5-10 are delivered as a batch.
    const retransTime = lostPacket * 220 + 2400;
    for (let i = lostPacket; i <= total; i++) {
      const t = setTimeout(
        () => {
          setTcpDelivered((prev) => [
            ...prev,
            { n: i, arriveAt: retransTime + (i - lostPacket) * 50 },
          ]);
        },
        retransTime + (i - lostPacket) * 50,
      );
      tcpTimers.current.push(t);
    }
    const end = setTimeout(
      () => {
        setPhase('done');
        if (tickTimer.current) clearInterval(tickTimer.current);
      },
      retransTime + (total - lostPacket + 1) * 50 + 400,
    );
    tcpTimers.current.push(end);
  }, [reset]);

  useEffect(() => () => cleanup(), [cleanup]);

  // Compute progress percentages for the visualization bars
  const totalDuration = lostPacket * 220 + 2400 + (total - lostPacket + 1) * 50;
  const elapsed = tick * 100;
  const progressPct = Math.min(100, (elapsed / totalDuration) * 100);

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 06  ·  Head-of-line blocking"
          title="The cost of in-order delivery."
          lede={
            <>
              TCP promises to deliver bytes in order. When a packet is lost,
              <strong> everything behind it waits.</strong> Packets that already arrived at the
              receiver sit unread in the kernel buffer until the missing one is retransmitted. For a
              file transfer, fine. For real time, catastrophic.
            </>
          }
        />

        <div className="udp-panel" style={{ padding: 28 }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 14,
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
              {phase === 'running' ? 'Streaming…' : 'Stream 10 packets, drop #5'}
            </button>
            <button className="udp-btn udp-btn-ghost" onClick={reset}>
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
          {phase !== 'idle' && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  height: 4,
                  background: 'var(--line)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--signal), var(--ok))',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
              <div
                className="udp-mono"
                style={{
                  fontSize: 10,
                  color: 'var(--ink-faint-fn)',
                  marginTop: 4,
                  textAlign: 'right',
                }}
              >
                t = {(elapsed / 1000).toFixed(1)}s
              </div>
            </div>
          )}
          {phase === 'idle' && <div style={{ marginBottom: 14 }} />}

          {/* Side-by-side */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
            }}
            className="udp-hol-grid"
          >
            <ProtocolLane
              name="TCP"
              tagline="Strict in-order delivery. Stalls on loss"
              color="var(--tcp)"
              borderColor="var(--tcp-edge)"
              delivered={tcpDelivered}
              total={total}
              lostPacket={lostPacket}
              showStall={true}
              elapsed={elapsed}
            />
            <ProtocolLane
              name="UDP"
              tagline="No order guarantee. Keeps flowing"
              color="var(--signal)"
              borderColor="var(--signal-edge)"
              delivered={udpDelivered}
              total={total}
              lostPacket={lostPacket}
              showStall={false}
              elapsed={elapsed}
            />
          </div>

          {phase === 'done' && (
            <div
              className="udp-rise"
              style={{
                marginTop: 24,
                padding: '18px 22px',
                background: 'var(--bg-deep)',
                borderRadius: 4,
                fontSize: 14,
                color: 'var(--ink-dim)',
                lineHeight: 1.7,
              }}
            >
              <div
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  color: 'var(--signal)',
                  letterSpacing: '0.12em',
                  marginBottom: 8,
                }}
              >
                OBSERVATION
              </div>
              On the <strong style={{ color: 'var(--tcp)' }}>TCP</strong> side, packets 6–10 had
              already arrived at the receiver's kernel before packet 5 was even retransmitted, yet
              they were held in the buffer the whole time because TCP refused to deliver them out of
              order. The application sat blind for two seconds. On the{' '}
              <strong style={{ color: 'var(--signal)' }}>UDP</strong> side, packets 6–10 went
              straight to the application as they arrived. Packet 5 is simply gone.{' '}
              <em>Whether that's a problem depends entirely on what you're doing.</em>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 32,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
          }}
          className="udp-hol-grid"
        >
          <div className="udp-panel-bordered">
            <Label>If you're streaming a file</Label>
            <h3 className="udp-h3" style={{ marginTop: 8, color: 'var(--tcp)' }}>
              TCP wins.
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-dim)', margin: '8px 0 0 0' }}>
              You need every byte and you need them in order. A two-second stall is fine; a
              corrupted file is not.
            </p>
          </div>
          <div className="udp-panel-bordered">
            <Label>If you're streaming a video call</Label>
            <h3 className="udp-h3" style={{ marginTop: 8, color: 'var(--signal)' }}>
              UDP wins.
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-dim)', margin: '8px 0 0 0' }}>
              The moment packet 5 represented is already gone. By the time a retransmit drags it
              back across the network, it is stale, useless, old news. Better to show packet 6 now
              and let 5 be lost forever.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
