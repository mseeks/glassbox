import { useState, useEffect, useRef } from 'react';
import { Send, Check, X as XIcon, ChevronDown, Repeat } from 'lucide-react';
import { Pill } from './atoms.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

/* ───────────────────────────────────────────────────────────────────────
   HERO — animated datagram flight
   The whole point of UDP in one image: packets fired into the network,
   some arriving, some lost, some duplicated, some reordered.
   ─────────────────────────────────────────────────────────────────────── */

// Static frame for reduced motion: one representative datagram per lane,
// each frozen mid-flight, covering all four fates so the figure still teaches.
const STATIC_PACKETS = [
  { id: 's0', fate: 'delivered', lane: 0, duration: 3600, staticX: 70 },
  { id: 's1', fate: 'lost', lane: 1, duration: 3600, staticX: 45 },
  { id: 's2', fate: 'delivered', lane: 2, duration: 3600, staticX: 30 },
  { id: 's3', fate: 'duplicate', lane: 3, duration: 3600, staticX: 85, isDup: true },
  { id: 's4', fate: 'delivered', lane: 4, duration: 3600, staticX: 55 },
];

export const Hero = () => {
  // Use refs + CSS animations only. No per-frame state updates.
  const [packets, setPackets] = useState([]);
  const counterRef = useRef(0);
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();

  useEffect(() => {
    // Reduced motion: show a representative static frame, skip the flight loop.
    if (reduced) {
      setPackets(STATIC_PACKETS);
      return;
    }
    // Pause the ambient flight loop while scrolled off-screen; the last
    // rendered packets stay visible until the loop resumes.
    if (!inView) return;
    let mounted = true;
    const spawn = () => {
      if (!mounted) return;
      counterRef.current += 1;
      const id = counterRef.current;
      const r = Math.random();
      const fate = r < 0.65 ? 'delivered' : r < 0.8 ? 'lost' : r < 0.9 ? 'duplicate' : 'reorder';
      const lane = Math.floor(Math.random() * 5);
      const duration = 3400 + Math.random() * 800;
      const newP = { id, fate, lane, duration };
      setPackets((prev) => [...prev.slice(-24), newP]);
      // remove after animation completes
      setTimeout(() => {
        if (!mounted) return;
        setPackets((prev) => prev.filter((p) => p.id !== id));
      }, duration + 200);

      if (fate === 'duplicate') {
        setTimeout(
          () => {
            if (!mounted) return;
            counterRef.current += 1;
            const dupId = counterRef.current;
            const dupDur = 3400 + Math.random() * 800;
            setPackets((prev) => [
              ...prev.slice(-24),
              {
                id: dupId,
                fate: 'delivered',
                lane,
                duration: dupDur,
                isDup: true,
              },
            ]);
            setTimeout(() => {
              if (!mounted) return;
              setPackets((prev) => prev.filter((p) => p.id !== dupId));
            }, dupDur + 200);
          },
          400 + Math.random() * 600,
        );
      }
    };

    const id = setInterval(spawn, 320);
    spawn();
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [reduced, inView]);

  return (
    <section
      ref={vpRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '80px 0',
      }}
    >
      {/* Animated datagram lanes — pure CSS keyframe motion */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 38,
          padding: '120px 0',
          opacity: 0.7,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {[0, 1, 2, 3, 4].map((lane) => (
          <div
            key={lane}
            style={{
              position: 'relative',
              height: 24,
              borderTop: '1px dashed var(--rule-soft)',
              paddingTop: 4,
            }}
          >
            {packets
              .filter((p) => p.lane === lane)
              .map((p) => {
                const color =
                  p.fate === 'lost' ? 'var(--lost)' : p.isDup ? 'var(--warn)' : 'var(--signal)';
                const animName = p.fate === 'lost' ? 'udp-hero-fly-lost' : 'udp-hero-fly';
                return (
                  <div
                    key={p.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      // Reduced motion: freeze each packet at a representative
                      // horizontal position instead of running the flight keyframe.
                      left: reduced ? `${p.staticX}%` : undefined,
                      opacity: reduced && p.fate === 'lost' ? 0.45 : undefined,
                      width: 20,
                      height: 20,
                      borderRadius: 3,
                      // `color` drives currentColor, which the glow token reads —
                      // so the emissive bloom (dark) / cast shadow (paper) keeps
                      // each packet's own fate colour without a per-mode literal.
                      color,
                      background: color,
                      border: `1px solid ${color}`,
                      boxShadow: 'var(--udp-glow-strong)',
                      willChange: 'transform, opacity',
                      animation: reduced ? 'none' : `${animName} ${p.duration}ms linear forwards`,
                    }}
                  />
                );
              })}
          </div>
        ))}
      </div>

      <div className="udp-page" style={{ position: 'relative', zIndex: 2 }}>
        <div
          className="udp-rise"
          style={{
            display: 'flex',
            gap: 18,
            marginBottom: 36,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--signal)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                background: 'var(--signal)',
                borderRadius: 4,
                animation: 'udp-pulse 1.8s ease-in-out infinite',
              }}
            ></span>
            RFC 768 &nbsp;·&nbsp; 1980
          </div>
        </div>

        <h1 className="udp-h1 udp-rise-delay-1" style={{ maxWidth: 1050 }}>
          UDP.
          <br />
          <span style={{ color: 'var(--signal)', fontStyle: 'italic', fontWeight: 300 }}>
            The protocol
          </span>
          <br />
          that tells the truth.
        </h1>

        <p className="udp-lede udp-rise-delay-2" style={{ maxWidth: 720, marginTop: 32 }}>
          The internet underneath everything is a postal service that loses mail, and never once
          tells you which letters it dropped. Packets get dropped, duplicated, delayed, reordered.
          That's the truth of the wire.
          <strong> TCP hides it.</strong>{' '}
          <strong style={{ color: 'var(--signal)' }}>UDP doesn't.</strong>
        </p>

        <div
          className="udp-rise-delay-3"
          style={{
            marginTop: 56,
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <Pill tone="signal" icon={Send}>
            In flight
          </Pill>
          <Pill tone="ok" icon={Check}>
            Delivered
          </Pill>
          <Pill tone="lost" icon={XIcon}>
            Lost
          </Pill>
          <Pill icon={Repeat}>Duplicated</Pill>
        </div>

        <div
          className="udp-rise-delay-4"
          style={{
            marginTop: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--ink-faint-fn)',
            fontFamily: 'JetBrains Mono',
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          <ChevronDown size={14} />
          Begin transmission
        </div>
      </div>
    </section>
  );
};
