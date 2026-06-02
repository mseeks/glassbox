import { useState, useEffect, useRef, useCallback } from 'react';
import { Cpu, ArrowRight } from 'lucide-react';
import { Label, Datagram } from './atoms.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

/* ───────────────────────────────────────────────────────────────────────
   PROPERTY VISUALS — used by §4 ("The Four Properties")
   ─────────────────────────────────────────────────────────────────────── */

export const ConnectionlessVisual = () => {
  // Two hosts, packets flying both directions with no setup phase
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  // Reduced motion: freeze the ticker at a representative frame so packets sit
  // mid-channel (in flight, both directions) instead of advancing every 600ms.
  const [tick, setTick] = useState(() => (reduced ? 1 : 0));
  useEffect(() => {
    // Pause the ambient ticker off-screen; current frame stays put.
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(id);
  }, [reduced, inView]);

  return (
    <div ref={vpRef} style={{ width: '100%' }}>
      <Label style={{ marginBottom: 16 }}>Fig. 5: No setup, just send</Label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          minHeight: 130,
        }}
      >
        {/* Host A */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: 'var(--surface-3)',
              border: '1px solid var(--signal)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--signal-soft)',
            }}
          >
            <Cpu size={20} color="var(--signal)" />
          </div>
          <div
            className="udp-mono"
            style={{ fontSize: 10, color: 'var(--ink-dim)', marginTop: 6, letterSpacing: '0.08em' }}
          >
            HOST A
          </div>
        </div>

        {/* Channel between hosts */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            height: 52,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'stretch',
          }}
        >
          {/* Two lanes — one each direction */}
          {[0, 1].map((lane) => (
            <div
              key={lane}
              style={{
                position: 'relative',
                height: 18,
                borderBottom: '1px dashed rgba(232, 223, 199, 0.1)',
              }}
            >
              {[0, 1].map((i) => {
                const offset = lane === 0 ? i * 0.5 : i * 0.5 + 0.25;
                const phase = (tick * 0.45 + offset) % 1;
                const x = lane === 0 ? phase * 100 : (1 - phase) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: 1,
                      width: 12,
                      height: 12,
                      background: 'var(--signal)',
                      borderRadius: 2,
                      boxShadow: '0 0 8px var(--signal)',
                      transform: 'translateX(-50%)',
                      transition: 'left 0.6s linear',
                      opacity: phase < 0.08 ? phase * 12 : phase > 0.92 ? (1.0 - phase) * 12 : 1,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Host B */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: 'var(--surface-3)',
              border: '1px solid var(--signal)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--signal-soft)',
            }}
          >
            <Cpu size={20} color="var(--signal)" />
          </div>
          <div
            className="udp-mono"
            style={{ fontSize: 10, color: 'var(--ink-dim)', marginTop: 6, letterSpacing: '0.08em' }}
          >
            HOST B
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 20,
          padding: '12px 14px',
          background: 'var(--surface-2)',
          borderRadius: 3,
          fontSize: 13,
          color: 'var(--ink-dim)',
          lineHeight: 1.55,
        }}
      >
        No <code>SYN</code>. No <code>SYN-ACK</code>. No <code>ACK</code>. No <code>FIN</code>. Just
        packets, in whichever direction the kernel decides to send them.
      </div>
    </div>
  );
};

// Static frame for reduced motion: a few datagrams frozen along the channel,
// one of them dropped, so the "some don't make it" point still reads.
const UNRELIABLE_STATIC = [
  { id: -1, x: 0.85, willDrop: false, startTime: 0 },
  { id: -2, x: 0.62, willDrop: true, startTime: 0 },
  { id: -3, x: 0.4, willDrop: false, startTime: 0 },
  { id: -4, x: 0.18, willDrop: false, startTime: 0 },
];

export const UnreliableVisual = () => {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [packets, setPackets] = useState(() => (reduced ? UNRELIABLE_STATIC : []));
  const counterRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setPackets(UNRELIABLE_STATIC);
      return;
    }
    // Pause spawning while off-screen; in-flight packets stay where they are.
    if (!inView) return;
    let mounted = true;
    const spawn = () => {
      if (!mounted) return;
      counterRef.current += 1;
      const id = counterRef.current;
      const willDrop = Math.random() < 0.35;
      setPackets((prev) => {
        const newOne = { id, x: 0, willDrop, startTime: Date.now() };
        return [...prev.slice(-5), newOne];
      });
    };
    const tickId = setInterval(spawn, 700);
    spawn();
    return () => {
      mounted = false;
      clearInterval(tickId);
    };
  }, [reduced, inView]);

  // Update positions
  useEffect(() => {
    if (reduced || !inView) return;
    let raf;
    const update = () => {
      setPackets((prev) =>
        prev
          .map((p) => {
            const age = (Date.now() - p.startTime) / 2200;
            return { ...p, x: Math.min(1, age) };
          })
          .filter((p) => p.x < 1.1),
      );
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [reduced, inView]);

  return (
    <div ref={vpRef} style={{ width: '100%' }}>
      <Label style={{ marginBottom: 16 }}>Fig. 4b: Some don't make it</Label>
      <div
        style={{
          position: 'relative',
          height: 80,
          background: 'var(--surface-2)',
          borderRadius: 3,
          border: '1px solid var(--line)',
        }}
      >
        {packets.map((p) => {
          const dropAt = 0.6;
          const isDropped = p.willDrop && p.x > dropAt;
          const visibleX = p.willDrop ? Math.min(p.x, dropAt + 0.1) : p.x;
          const color = isDropped ? 'var(--lost)' : 'var(--signal)';
          return (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${visibleX * 100}%`,
                top: '50%',
                transform: `translate(-50%, -50%) ${isDropped ? 'scale(0.7) rotate(45deg)' : 'scale(1)'}`,
                width: 18,
                height: 18,
                background: isDropped ? 'transparent' : color,
                border: `1.5px solid ${color}`,
                borderRadius: 3,
                boxShadow: isDropped ? 'none' : `0 0 8px ${color}`,
                opacity: isDropped ? 0.5 : p.x < 0.05 ? p.x * 20 : 1,
                transition: 'transform 0.3s, opacity 0.3s',
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          fontFamily: 'JetBrains Mono',
          fontSize: 10,
          color: 'var(--ink-faint)',
        }}
      >
        <span>send()</span>
        <span>recv()</span>
      </div>
      <div
        style={{
          marginTop: 20,
          padding: '14px 16px',
          background: 'var(--lost-soft)',
          borderLeft: '2px solid var(--lost)',
          borderRadius: '0 3px 3px 0',
          fontSize: 13,
          color: 'var(--ink)',
        }}
      >
        <strong style={{ color: 'var(--lost)' }}>Lost packets vanish silently.</strong> The sender
        has already moved on. The receiver never knew there was anything to wait for.
      </div>
    </div>
  );
};

const UNORDERED_SEQUENCE = [1, 2, 3, 4, 5];

// Representative scrambled arrival shown statically under reduced motion —
// the completed end state of the demo (all five arrived, out of order).
const UNORDERED_STATIC_ARRIVAL = [4, 1, 5, 2, 3];

export const UnorderedVisual = () => {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [arrival, setArrival] = useState(() => (reduced ? UNORDERED_STATIC_ARRIVAL : []));
  // Track the per-packet arrival timers so they're cleared on unmount / restart.
  const arrivalTimers = useRef([]);

  const runDemo = useCallback(() => {
    arrivalTimers.current.forEach(clearTimeout);
    arrivalTimers.current = [];
    setArrival([]);
    // Shuffle the arrival order — packet 3 arrives last, 5 first, etc.
    const shuffled = [...UNORDERED_SEQUENCE].sort(() => Math.random() - 0.5);
    shuffled.forEach((n, i) => {
      const t = setTimeout(
        () => {
          setArrival((prev) => [...prev, n]);
        },
        400 * (i + 1),
      );
      arrivalTimers.current.push(t);
    });
  }, []);

  useEffect(() => {
    // Reduced motion: jump straight to the completed scrambled-arrival state.
    if (reduced) {
      setArrival(UNORDERED_STATIC_ARRIVAL);
      return;
    }
    // Pause the ambient replay loop while off-screen; the last arrival row
    // stays on screen until the demo resumes.
    if (!inView) return;
    runDemo();
    const id = setInterval(runDemo, 5000);
    return () => {
      clearInterval(id);
      arrivalTimers.current.forEach(clearTimeout);
      arrivalTimers.current = [];
    };
  }, [reduced, inView, runDemo]);

  return (
    <div ref={vpRef} style={{ width: '100%' }}>
      <Label style={{ marginBottom: 16 }}>Fig. 4c: Sent in order, arrives scrambled</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-faint)',
              marginBottom: 8,
              fontFamily: 'JetBrains Mono',
              letterSpacing: '0.1em',
            }}
          >
            SEND ORDER
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {UNORDERED_SEQUENCE.map((n) => (
              <Datagram key={n} state="flight" label={n} size="md" />
            ))}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--ink-faint)',
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            letterSpacing: '0.1em',
          }}
        >
          <ArrowRight size={12} />
          NETWORK
          <ArrowRight size={12} />
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-faint)',
              marginBottom: 8,
              fontFamily: 'JetBrains Mono',
              letterSpacing: '0.1em',
            }}
          >
            ARRIVAL ORDER
          </div>
          <div style={{ display: 'flex', gap: 8, minHeight: 36 }}>
            {arrival.map((n) => (
              <Datagram key={`a-${n}`} state="delivered" label={n} size="md" />
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 20,
          padding: '14px 16px',
          background: 'var(--surface-2)',
          borderRadius: 3,
          fontSize: 13,
          color: 'var(--ink-dim)',
        }}
      >
        Packets take independent paths. The receiver gets them in whatever order the network
        delivers them. UDP does not buffer or reorder.
      </div>
    </div>
  );
};

const DGBlock = ({ label, pct, ok, tcp }) => (
  <div
    style={{
      width: `${pct}%`,
      minWidth: 90,
      padding: '7px 12px',
      background: ok ? 'var(--ok-soft)' : tcp ? 'var(--tcp-soft)' : 'var(--signal-soft)',
      border: `1px solid ${ok ? 'var(--ok-edge)' : tcp ? 'var(--tcp-edge)' : 'var(--signal-edge)'}`,
      borderRadius: 3,
      fontFamily: 'JetBrains Mono',
      fontSize: 11,
      color: ok ? 'var(--ok)' : tcp ? 'var(--tcp)' : 'var(--signal)',
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </div>
);

const MsgColumn = ({ heading, color, sends, arrow, recvs, footer }) => (
  <div>
    <div
      style={{
        fontSize: 11,
        color,
        marginBottom: 10,
        fontFamily: 'JetBrains Mono',
        letterSpacing: '0.12em',
        fontWeight: 600,
      }}
    >
      {heading}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {sends.map((s, i) => (
        <DGBlock key={i} label={`send(${s.label})`} pct={s.w} tcp={s.tcp} />
      ))}
    </div>
    <div
      style={{
        textAlign: 'center',
        color: 'var(--ink-faint)',
        fontSize: 10.5,
        fontFamily: 'JetBrains Mono',
        padding: '8px 0',
        letterSpacing: '0.04em',
      }}
    >
      {arrow}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {recvs.map((r, i) => (
        <DGBlock key={i} label={r.label} pct={r.w} ok={r.ok} tcp={r.tcp} />
      ))}
    </div>
    {footer && (
      <div
        style={{
          fontSize: 11,
          color: 'var(--ink-faint)',
          fontStyle: 'italic',
          textAlign: 'center',
          marginTop: 6,
        }}
      >
        {footer}
      </div>
    )}
  </div>
);

export const MessageOrientedVisual = () => (
  <div style={{ width: '100%' }}>
    <Label style={{ marginBottom: 16 }}>Fig. 8: Boundaries preserved</Label>
    <div
      className="udp-msg-grid"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}
    >
      <MsgColumn
        heading="UDP: DATAGRAMS"
        color="var(--signal)"
        sends={[
          { label: '100B', w: 64 },
          { label: '50B', w: 40 },
          { label: '80B', w: 56 },
        ]}
        arrow="↓ &nbsp; ↓ &nbsp; ↓"
        recvs={[
          { label: 'recv → 100B', w: 64, ok: true },
          { label: 'recv → 50B', w: 40, ok: true },
          { label: 'recv → 80B', w: 56, ok: true },
        ]}
        footer={null}
      />
      <MsgColumn
        heading="TCP: STREAM"
        color="var(--tcp)"
        sends={[
          { label: '100B', w: 64, tcp: true },
          { label: '50B', w: 40, tcp: true },
          { label: '80B', w: 56, tcp: true },
        ]}
        arrow="↓ merged into stream ↓"
        recvs={[{ label: 'recv → 230B', w: 100, tcp: true }]}
        footer="(one byte blob: you re-frame)"
      />
    </div>
  </div>
);
