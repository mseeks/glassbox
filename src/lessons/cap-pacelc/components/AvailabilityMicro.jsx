import { useState, useEffect } from 'react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

export function AvailabilityMicro() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 180), 50);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // Under reduced motion, hold a representative resolved frame: the available
  // request has its response, and the unavailable request is visibly hung.
  const phase = reduced ? 130 : tick;
  const askedAvail = phase > 20;
  const respAvail = phase > 60;
  const askedHung = phase > 30;

  return (
    <div ref={vpRef} style={{ marginTop: 16 }}>
      <svg viewBox="0 0 460 150" style={{ width: '100%', height: 'auto' }}>
        {/* AVAILABLE row */}
        <text
          x="20"
          y="38"
          fontFamily="Spectral, serif"
          fontStyle="italic"
          fontSize="11"
          fill="var(--ink-dim)"
          textAnchor="end"
        >
          available
        </text>
        {askedAvail && (
          <>
            <circle
              cx="60"
              cy="35"
              r="14"
              fill="var(--cyan-soft)"
              stroke="var(--cyan)"
              strokeWidth="1"
            />
            <text
              x="60"
              y="38"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontSize="11"
              fill="var(--cyan)"
            >
              ?
            </text>
          </>
        )}
        {askedAvail && (
          <line
            x1="80"
            y1="35"
            x2={Math.min(380, 80 + (phase - 20) * 7)}
            y2="35"
            stroke="var(--cyan)"
            strokeWidth="1"
            strokeOpacity="0.5"
            markerEnd="url(#arrow-cyan)"
          />
        )}
        {respAvail && (
          <>
            <circle
              cx="400"
              cy="35"
              r="14"
              fill="var(--emerald-soft)"
              stroke="var(--emerald)"
              strokeWidth="1"
            />
            <text
              x="400"
              y="38"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontSize="11"
              fill="var(--emerald)"
            >
              !
            </text>
            <text
              x="420"
              y="38"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fill="var(--emerald)"
            />
          </>
        )}
        <text
          x="60"
          y="60"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill="var(--ink-faint)"
          letterSpacing="0.06em"
        >
          request
        </text>
        {respAvail && (
          <text
            x="400"
            y="60"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="9"
            fill="var(--emerald)"
            letterSpacing="0.06em"
          >
            response
          </text>
        )}

        {/* UNAVAILABLE row */}
        <text
          x="20"
          y="113"
          fontFamily="Spectral, serif"
          fontStyle="italic"
          fontSize="11"
          fill="var(--ink-dim)"
          textAnchor="end"
        >
          unavailable
        </text>
        {askedHung && (
          <>
            <circle
              cx="60"
              cy="110"
              r="14"
              fill="var(--coral-soft)"
              stroke="var(--coral)"
              strokeWidth="1"
            />
            <text
              x="60"
              y="113"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontSize="11"
              fill="var(--coral)"
            >
              ?
            </text>
          </>
        )}
        {askedHung && (
          <line
            x1="80"
            y1="110"
            x2={Math.min(220, 80 + (phase - 30) * 4)}
            y2="110"
            stroke="var(--coral)"
            strokeWidth="1"
            strokeOpacity="0.4"
            strokeDasharray="3,3"
          />
        )}
        {phase > 100 && (
          <text
            x={220 + Math.sin(phase * 0.3) * 2}
            y="113"
            fontFamily="JetBrains Mono, monospace"
            fontSize="11"
            fill="var(--coral)"
            opacity={0.5 + Math.sin(phase * 0.2) * 0.4}
          >
            · · ·
          </text>
        )}
        <text
          x="60"
          y="135"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill="var(--ink-faint)"
          letterSpacing="0.06em"
        >
          request
        </text>
        <text
          x="320"
          y="135"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill="var(--coral)"
          letterSpacing="0.06em"
        >
          (no answer comes)
        </text>

        <defs>
          <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L5,3 L0,6" fill="none" stroke="var(--cyan)" strokeWidth="1" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}
