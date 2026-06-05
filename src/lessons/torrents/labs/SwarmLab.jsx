import { useCallback, useEffect, useState } from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';
import { initSwarm, PIECES } from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInterval } from '../components/useInterval.js';
import { Dot } from '../components/widgets.jsx';

// §03 — the living constellation. Each ring is a peer; the filled arc is how
// much it holds. Gold = a seeder, teal = a leecher. The starting holdings are
// seeded by the engine; one transfer step picks a leecher that's missing a piece
// some peer has and hands it over. That pick uses Math.random (the live swarm),
// so it stays here in the view rather than in the pure engine.
export default function SwarmLab() {
  const reduced = usePrefersReducedMotion();
  const [nodes, setNodes] = useState(() => initSwarm(11));
  const [active, setActive] = useState(null); // [from, to]
  const [playing, setPlaying] = useState(false);
  const W = 520,
    H = 360;
  const step = useCallback(() => {
    setNodes((prev) => {
      const next = prev.map((n) => ({ ...n, bits: [...n.bits] }));
      const leechers = next.map((n, i) => ({ n, i })).filter((o) => !o.n.bits.every(Boolean));
      if (!leechers.length) {
        setActive(null);
        return prev;
      }
      const r = Math.random;
      for (let attempt = 0; attempt < 12; attempt++) {
        const { n: L, i: li } = leechers[Math.floor(r() * leechers.length)];
        const missing = L.bits.map((b, k) => (b ? -1 : k)).filter((k) => k >= 0);
        const need = missing[Math.floor(r() * missing.length)];
        const donors = next.map((n, i) => ({ n, i })).filter((o) => o.i !== li && o.n.bits[need]);
        if (donors.length) {
          const { i: di } = donors[Math.floor(r() * donors.length)];
          next[li].bits[need] = true;
          next[li].seed = next[li].bits.every(Boolean);
          setActive([di, li]);
          return next;
        }
      }
      setActive(null);
      return prev;
    });
  }, []);
  useInterval(() => step(), 900, playing);
  useEffect(() => {
    if (playing && nodes.every((n) => n.bits.every(Boolean))) setPlaying(false);
  }, [nodes, playing]);
  const seeders = nodes.filter((n) => n.bits.every(Boolean)).length;
  const leechers = nodes.length - seeders;
  const avg = Math.round(
    (nodes.reduce((s, n) => s + n.bits.filter(Boolean).length, 0) / (nodes.length * PIECES)) * 100,
  );
  const C = 2 * Math.PI * 15;
  return (
    <div>
      <div className="tor-svgwrap">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="a swarm of peers exchanging pieces">
          {active &&
            (() => {
              const a = nodes[active[0]],
                b = nodes[active[1]];
              return (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--signal)"
                  strokeWidth="1.6"
                  strokeDasharray="4 4"
                  opacity="0.85"
                >
                  {!reduced && (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="8"
                      to="0"
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  )}
                </line>
              );
            })()}
          {nodes.map((n, i) => {
            const have = n.bits.filter(Boolean).length;
            const frac = have / PIECES;
            const seed = n.bits.every(Boolean);
            const col = seed ? 'var(--gold)' : 'var(--signal)';
            return (
              <g key={i}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="15"
                  fill="none"
                  stroke="var(--line-2)"
                  strokeWidth="3"
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="15"
                  fill="none"
                  stroke={col}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${C * frac} ${C}`}
                  transform={`rotate(-90 ${n.x} ${n.y})`}
                  style={{ transition: 'stroke-dasharray .5s ease' }}
                />
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="7"
                  fill={col}
                  opacity={seed ? 0.95 : 0.5}
                  style={{ filter: `drop-shadow(0 0 ${seed ? 7 : 4}px ${col})` }}
                />
                {n.you && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="21"
                    fill="none"
                    stroke="var(--star)"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    opacity="0.8"
                  />
                )}
                <text
                  x={n.x}
                  y={n.y + 30}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill={n.you ? 'var(--star)' : 'var(--faint)'}
                >
                  {n.you ? 'YOU' : seed ? 'seed' : `${have}/${PIECES}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="tor-between" style={{ marginTop: 8 }}>
        <div className="tor-row" style={{ gap: 9 }}>
          <button className="tor-btn tor-primary" onClick={() => setPlaying((p) => !p)}>
            {playing ? (
              <>
                <Pause size={14} aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play size={14} aria-hidden="true" />
                Play
              </>
            )}
          </button>
          <button className="tor-btn" onClick={step} disabled={playing}>
            <StepForward size={14} aria-hidden="true" />
            Step
          </button>
          <button
            className="tor-btn"
            onClick={() => {
              setPlaying(false);
              setActive(null);
              setNodes(initSwarm(11 + Math.floor(Math.random() * 900)));
            }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reseed
          </button>
        </div>
        <div className="tor-row" style={{ gap: 8 }}>
          <span className="tor-chip">
            <Dot c="var(--gold)" />
            {seeders} seeders
          </span>
          <span className="tor-chip">
            <Dot c="var(--signal)" />
            {leechers} leechers
          </span>
          <span className="tor-chip">{avg}% complete</span>
        </div>
      </div>
      <div className="tor-figcap" style={{ marginTop: 14 }}>
        Each ring is a peer; the filled arc is how much of the file it holds.{' '}
        <span style={{ color: 'var(--gold-2)' }}>Gold = a seeder</span> (has everything, only
        gives). <span style={{ color: 'var(--signal-2)' }}>Teal = a leecher</span> (still gathering,
        but already sharing what it has). Press play and watch pieces flow along the live threads —
        leechers fill up, and the moment one completes it turns gold and becomes a seeder itself.
      </div>
    </div>
  );
}
