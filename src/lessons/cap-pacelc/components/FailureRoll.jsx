import { useState, useEffect } from 'react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

export function FailureRoll() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    // Under reduced motion, hold the initial static list of failures.
    const id = setInterval(() => setTick((t) => t + 1), 2800);
    return () => clearInterval(id);
  }, [reduced, inView]);

  const events = [
    { t: 'TCP retransmit storm', loc: 'us-east-1' },
    { t: 'GC pause > 30s', loc: 'replica-04' },
    { t: 'Switch firmware bug', loc: 'rack-7-tor' },
    { t: 'BGP route flap', loc: 'transit AS-714' },
    { t: 'NIC driver wedge', loc: 'host-1492' },
    { t: 'Asymmetric link failure', loc: 'eu-west-2 ↔ us' },
    { t: 'Kernel softlockup', loc: 'replica-11' },
    { t: 'MTU black hole', loc: 'tunnel-3' },
    { t: 'NTP drift induced timeout', loc: 'cell-A' },
    { t: 'Buffer overflow at midplane', loc: 'core-switch-2' },
    { t: 'Cable damaged by squirrel', loc: 'pop-NYC-3' },
    { t: 'TLS handshake clock skew', loc: 'leader-7' },
  ];

  // Show 6 events. Only the topmost is the "new" one each cycle;
  // the others slide down. This keeps text readable for the full cycle.
  const visible = Array.from({ length: 6 }, (_, i) => {
    const idx = (((tick - i) % events.length) + events.length) % events.length;
    return events[idx];
  });

  return (
    <div
      ref={vpRef}
      style={{
        background: 'var(--bg-deep)',
        border: '1px solid var(--border)',
        borderLeft: '2px solid var(--coral)',
        padding: '22px 26px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12.5,
        lineHeight: 2.0,
        color: 'var(--ink-2)',
        minHeight: 220,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: 'var(--ink-faint)',
          letterSpacing: '0.2em',
          marginBottom: 12,
          textTransform: 'uppercase',
        }}
      >
        From production, recently, somewhere:
      </div>
      {visible.map((e, i) => (
        <div
          key={`row-${i}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            opacity: 1 - i * 0.13,
            transition: 'opacity 800ms ease',
          }}
        >
          <span
            key={`${tick}-${i}-t`}
            style={{
              color: 'var(--coral)',
              animation: i === 0 ? 'fade-up 700ms ease both' : 'none',
            }}
          >
            · {e.t}
          </span>
          <span
            key={`${tick}-${i}-l`}
            style={{
              color: 'var(--ink-faint)',
              animation: i === 0 ? 'fade-up 700ms ease both' : 'none',
            }}
          >
            {e.loc}
          </span>
        </div>
      ))}
    </div>
  );
}
