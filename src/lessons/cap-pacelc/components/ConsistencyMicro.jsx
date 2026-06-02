import { useState, useEffect } from 'react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

export function ConsistencyMicro() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 240), 50);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // Timeline: write(x=1) at t=40, read at t=120, expected response "1"
  // Under reduced motion, jump straight to the completed end state where the
  // read returns the written value.
  const t = reduced ? 150 : tick;
  const writeStarted = t > 30;
  const writeCommitted = t > 60;
  const readStarted = t > 110;
  const readReturned = t > 140;

  return (
    <div ref={vpRef} style={{ marginTop: 16 }}>
      <svg viewBox="0 0 460 130" style={{ width: '100%', height: 'auto' }}>
        {/* time axis */}
        <line x1="40" y1="105" x2="430" y2="105" stroke="var(--border-bright)" strokeWidth="0.5" />
        <text
          x="40"
          y="123"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill="var(--ink-faint)"
          letterSpacing="0.1em"
        >
          t →
        </text>

        {/* client A: write */}
        <text
          x="20"
          y="38"
          fontFamily="Spectral, serif"
          fontStyle="italic"
          fontSize="11"
          fill="var(--ink-dim)"
          textAnchor="end"
        >
          client A
        </text>
        <line
          x1="40"
          y1="35"
          x2="430"
          y2="35"
          stroke="var(--border)"
          strokeOpacity="0.5"
          strokeWidth="0.5"
        />
        {writeStarted && (
          <>
            <rect
              x="65"
              y="27"
              width={writeCommitted ? 70 : Math.max(0, t - 30) * 2.3}
              height="16"
              fill="var(--emerald-soft)"
              stroke="var(--emerald)"
              strokeWidth="0.8"
              rx="1"
            />
            <text
              x="100"
              y="38"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fill="var(--emerald)"
            >
              write x = 1
            </text>
          </>
        )}
        {writeCommitted && <circle cx="135" cy="35" r="3" fill="var(--emerald)" />}

        {/* client B: read */}
        <text
          x="20"
          y="78"
          fontFamily="Spectral, serif"
          fontStyle="italic"
          fontSize="11"
          fill="var(--ink-dim)"
          textAnchor="end"
        >
          client B
        </text>
        <line
          x1="40"
          y1="75"
          x2="430"
          y2="75"
          stroke="var(--border)"
          strokeOpacity="0.5"
          strokeWidth="0.5"
        />
        {readStarted && (
          <>
            <rect
              x="225"
              y="67"
              width={readReturned ? 60 : Math.max(0, t - 110) * 2}
              height="16"
              fill="var(--cyan-soft)"
              stroke="var(--cyan)"
              strokeWidth="0.8"
              rx="1"
            />
            <text
              x="255"
              y="78"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fill="var(--cyan)"
            >
              read x
            </text>
          </>
        )}
        {readReturned && (
          <>
            <circle cx="285" cy="75" r="3" fill="var(--cyan)" />
            <text
              x="300"
              y="78"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fill="var(--ink)"
            >
              → 1
            </text>
            <text
              x="310"
              y="62"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="10"
              fill="var(--emerald)"
            >
              must see the write
            </text>
          </>
        )}

        {/* commit point line */}
        {writeCommitted && (
          <line
            x1="135"
            y1="20"
            x2="135"
            y2="105"
            stroke="var(--emerald)"
            strokeOpacity="0.3"
            strokeWidth="0.5"
            strokeDasharray="2,3"
          />
        )}
      </svg>
    </div>
  );
}
