import { useMemo, useRef, useState } from 'react';
import { makeRng } from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';
import { ClusterNode } from './ClusterNode.jsx';
import { useRaf } from './useRaf.js';

export function HeroCluster() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const N = 32;
  const W = 1200,
    H = 480;
  const rng = useMemo(() => makeRng(42), []);
  const nodes = useMemo(() => {
    return Array.from({ length: N }, (_, i) => {
      // organic placement: jittered grid
      const cols = 8,
        rows = 4;
      const col = i % cols,
        row = Math.floor(i / cols);
      const baseX = 100 + (col / (cols - 1)) * (W - 200);
      const baseY = 80 + (row / (rows - 1)) * (H - 160);
      const jx = (rng() - 0.5) * 70;
      const jy = (rng() - 0.5) * 50;
      return { id: i, x: baseX + jx, y: baseY + jy };
    });
  }, [rng, W, H]);

  // a small pool of "messages" traveling between nodes
  const [messages, setMessages] = useState([]);
  const tickRef = useRef(0);

  useRaf((dt) => {
    tickRef.current += dt;
    // spawn a new probe occasionally
    if (tickRef.current > 280) {
      tickRef.current = 0;
      setMessages((prev) => {
        const next = [...prev];
        // spawn one probe
        const a = Math.floor(Math.random() * N);
        let b = Math.floor(Math.random() * N);
        if (b === a) b = (b + 1) % N;
        next.push({
          id: Math.random(),
          fromIdx: a,
          toIdx: b,
          progress: 0,
          duration: 900 + Math.random() * 400,
          kind: Math.random() < 0.7 ? 'probe' : 'gossip',
          phase: 'out',
        });
        return next.length > 14 ? next.slice(-14) : next;
      });
    }
    // advance all messages
    setMessages((prev) =>
      prev
        .map((m) => ({ ...m, progress: m.progress + dt / m.duration }))
        .filter((m) => {
          if (m.progress < 1) return true;
          // on completion of "out" phase, send ack back
          if (m.phase === 'out' && m.kind === 'probe') {
            // schedule ack via mutation on next tick
            setTimeout(() => {
              setMessages((cur) => [
                ...cur,
                {
                  id: Math.random(),
                  fromIdx: m.toIdx,
                  toIdx: m.fromIdx,
                  progress: 0,
                  duration: m.duration,
                  kind: 'ack',
                  phase: 'back',
                },
              ]);
            }, 0);
          }
          return false;
        }),
    );
  }, !reduced && inView);

  return (
    <svg
      ref={vpRef}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.92,
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 35%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 35%, transparent 100%)',
      }}
    >
      {/* faint static link mesh */}
      <g>
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b, j) => {
            const dx = a.x - b.x,
              dy = a.y - b.y;
            const d = Math.hypot(dx, dy);
            if (d > 230 || Math.random() < 0.92) return null;
            return (
              <line
                key={`${i}-${j}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--border)"
                strokeWidth="0.5"
                strokeOpacity="0.5"
              />
            );
          }),
        )}
      </g>
      {/* moving messages */}
      {messages.map((m) => {
        const a = nodes[m.fromIdx],
          b = nodes[m.toIdx];
        if (!a || !b) return null;
        const t = Math.min(1, m.progress);
        const cx = a.x + (b.x - a.x) * t;
        const cy = a.y + (b.y - a.y) * t;
        const stroke =
          m.kind === 'probe'
            ? 'var(--probe)'
            : m.kind === 'gossip'
              ? 'var(--gossip)'
              : 'var(--alive)';
        return (
          <g key={m.id}>
            <line
              x1={a.x}
              y1={a.y}
              x2={cx}
              y2={cy}
              stroke={stroke}
              strokeWidth={0.9}
              strokeOpacity={0.5}
            />
            <circle
              cx={cx}
              cy={cy}
              r={2.2}
              fill={stroke}
              style={{ filter: `drop-shadow(0 0 4px ${stroke})` }}
            />
          </g>
        );
      })}
      {/* nodes */}
      {nodes.map((n) => (
        <ClusterNode key={n.id} x={n.x} y={n.y} state="alive" size={5} />
      ))}
    </svg>
  );
}
