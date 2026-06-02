import { useState, useEffect } from 'react';
import { Node } from './Node.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

export function PartitionMicro() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => (t + 1) % 200), 50);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // Under reduced motion, hold the partitioned frame so the figure still
  // teaches the payoff: the link is severed and messages are lost.
  const t = reduced ? 120 : tick;
  const showMsg = t < 80;
  const msgX = 130 + ((t * 3) % 200);
  const partitioned = t >= 80 && t < 160;

  return (
    <div ref={vpRef} style={{ marginTop: 16 }}>
      <svg viewBox="0 0 460 110" style={{ width: '100%', height: 'auto' }}>
        <Node x={120} y={55} label="X" state={partitioned ? 'unavail' : 'alive'} />
        <Node x={340} y={55} label="Y" state={partitioned ? 'unavail' : 'alive'} />

        {!partitioned && (
          <>
            <line
              x1="142"
              y1="55"
              x2="318"
              y2="55"
              stroke="var(--emerald)"
              strokeOpacity="0.5"
              strokeWidth="0.8"
            />
            {showMsg && (
              <circle cx={Math.min(318, msgX)} cy="55" r="3.5" fill="var(--emerald)">
                {!reduced && (
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            )}
            <text
              x="230"
              y="42"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--emerald)"
            >
              messages flow
            </text>
          </>
        )}

        {partitioned && (
          <>
            <line
              x1="142"
              y1="55"
              x2="220"
              y2="55"
              stroke="var(--coral)"
              strokeOpacity="0.4"
              strokeWidth="0.8"
              strokeDasharray="3,4"
            />
            <line
              x1="240"
              y1="55"
              x2="318"
              y2="55"
              stroke="var(--coral)"
              strokeOpacity="0.4"
              strokeWidth="0.8"
              strokeDasharray="3,4"
            />
            <g transform="translate(230, 55)">
              <line x1="-8" y1="-10" x2="8" y2="10" stroke="var(--coral)" strokeWidth="1.3" />
              <line x1="8" y1="-10" x2="-8" y2="10" stroke="var(--coral)" strokeWidth="1.3" />
            </g>
            <text
              x="230"
              y="32"
              textAnchor="middle"
              fontFamily="Spectral, serif"
              fontStyle="italic"
              fontSize="11"
              fill="var(--coral)"
            >
              messages lost
            </text>
            <text
              x="230"
              y="92"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fill="var(--coral)"
              letterSpacing="0.1em"
            >
              PARTITION
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
