import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  advanceEpidemicRound,
  estimateEpidemicConvergenceRounds,
  makeRng,
} from '../engine/index.js';

export function EpidemicSim() {
  const [N, setN] = useState(100);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [infected, setInfected] = useState(() => new Set([0]));
  const [history, setHistory] = useState([{ round: 0, count: 1 }]);
  const [fanout, setFanout] = useState(3); // each infected node infects k others per round

  const W = 720,
    H = 320;

  // node positions: jittered grid
  const positions = useMemo(() => {
    const rng = makeRng(N * 17 + fanout);
    const cols = Math.ceil(Math.sqrt(N * (W / H)));
    const rows = Math.ceil(N / cols);
    return Array.from({ length: N }, (_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const baseX = 30 + (c + 0.5) * ((W - 60) / cols);
      const baseY = 30 + (r + 0.5) * ((H - 60) / rows);
      return { id: i, x: baseX + (rng() - 0.5) * 8, y: baseY + (rng() - 0.5) * 8 };
    });
  }, [N, fanout]);

  const reset = useCallback(() => {
    setInfected(new Set([0]));
    setRound(0);
    setHistory([{ round: 0, count: 1 }]);
    setRunning(false);
  }, []);

  useEffect(() => {
    reset();
  }, [N, fanout, reset]);

  // one round of epidemic
  const step = useCallback(() => {
    setInfected((prev) => {
      const next = advanceEpidemicRound({ infected: prev, nodeCount: N, fanout });
      const nextRound = round + 1;
      setRound(nextRound);
      setHistory((h) => [...h, { round: nextRound, count: next.size }]);
      return next;
    });
  }, [round, N, fanout]);

  // auto-advance
  useEffect(() => {
    if (!running) return;
    if (infected.size >= N) {
      setRunning(false);
      return;
    }
    const t = setTimeout(step, 600);
    return () => clearTimeout(t);
  }, [running, infected.size, N, step]);

  const pct = (infected.size / N) * 100;
  // Gossip with each infected node transmitting to `fanout` peers per round
  // converges in roughly log_(1+fanout) N rounds, not log_2 N. (log_2 only when fanout=1.)
  const convergenceRounds = estimateEpidemicConvergenceRounds(N, fanout);

  return (
    <div className="swim-card" style={{ padding: 0, overflow: 'hidden' }}>
      <span className="swim-corner-ornament tl" />
      <span className="swim-corner-ornament tr" />
      <span className="swim-corner-ornament bl" />
      <span className="swim-corner-ornament br" />

      <div
        style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div className="swim-label" style={{ color: 'var(--ink-dim)' }}>
          Epidemic spread <span style={{ color: 'var(--brass)' }}>·</span> one fact, N = {N} nodes
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="swim-btn" onClick={reset}>
            ↺ reset
          </button>
          <button className="swim-btn" onClick={step} disabled={running || infected.size >= N}>
            step ›
          </button>
          <button
            className="swim-btn"
            data-active={running}
            onClick={() => {
              if (!running && infected.size >= N) reset();
              setRunning((r) => !r);
            }}
          >
            {running ? '⏸ pause' : '▶ play'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 0 }}>
        <div style={{ background: 'var(--bg-deeper)', position: 'relative' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            {positions.map((p, i) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={infected.has(i) ? 3.4 : 2}
                fill={infected.has(i) ? 'var(--gossip)' : 'var(--ink-ghost)'}
                style={{
                  transition: 'all 0.4s ease',
                  filter: infected.has(i) ? 'drop-shadow(0 0 5px var(--gossip-glow))' : 'none',
                }}
              />
            ))}
          </svg>
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              color: 'var(--ink-label)',
              letterSpacing: '0.12em',
            }}
          >
            ROUND {round.toString().padStart(2, '0')}{' '}
            <span style={{ color: 'var(--brass)' }}>·</span> {infected.size} / {N}{' '}
            <span style={{ color: 'var(--brass)' }}>·</span> {pct.toFixed(0)}%
          </div>
        </div>
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }}>
              {/* axes */}
              <line x1="32" y1="14" x2="32" y2="190" stroke="var(--border)" strokeWidth="0.8" />
              <line x1="32" y1="190" x2="316" y2="190" stroke="var(--border)" strokeWidth="0.8" />
              {/* gridlines */}
              {[0.25, 0.5, 0.75, 1].map((g) => (
                <line
                  key={g}
                  x1="32"
                  x2="316"
                  y1={190 - g * 170}
                  y2={190 - g * 170}
                  stroke="var(--border)"
                  strokeWidth="0.4"
                  strokeDasharray="2 4"
                />
              ))}
              {/* axis labels */}
              <text
                x="26"
                y="22"
                textAnchor="end"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--ink-label)"
              >
                100%
              </text>
              <text
                x="26"
                y="195"
                textAnchor="end"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--ink-label)"
              >
                0
              </text>
              <text
                x="316"
                y="205"
                textAnchor="end"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fill="var(--ink-label)"
              >
                round
              </text>
              {/* convergence marker: log_(1+fanout) N rounds */}
              {convergenceRounds < 20 && (
                <g>
                  <line
                    x1={32 + (convergenceRounds / 20) * 280}
                    x2={32 + (convergenceRounds / 20) * 280}
                    y1="14"
                    y2="190"
                    stroke="var(--brass)"
                    strokeWidth="0.6"
                    strokeDasharray="2 3"
                    opacity="0.55"
                  />
                  <text
                    x={32 + (convergenceRounds / 20) * 280 + 4}
                    y="22"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fill="var(--brass)"
                  >
                    ≈ log₁₊ₖ N
                  </text>
                </g>
              )}
              {/* path */}
              <polyline
                points={history
                  .map((h) => {
                    const x = 32 + (h.round / 20) * 280;
                    const y = 190 - (h.count / N) * 170;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="var(--gossip)"
                strokeWidth="1.6"
              />
              {/* points */}
              {history.map((h, i) => (
                <circle
                  key={i}
                  cx={32 + (h.round / 20) * 280}
                  cy={190 - (h.count / N) * 170}
                  r={i === history.length - 1 ? 3 : 1.8}
                  fill="var(--gossip)"
                  style={{
                    filter:
                      i === history.length - 1 ? 'drop-shadow(0 0 5px var(--gossip))' : 'none',
                  }}
                />
              ))}
            </svg>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 8 }}>
            <div className="swim-label" style={{ color: 'var(--ink-label)', marginBottom: 6 }}>
              EXPECTED CONVERGENCE
            </div>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 22,
                color: 'var(--brass)',
                fontStyle: 'italic',
              }}
            >
              ≈ {convergenceRounds} rounds
            </div>
            <div
              className="swim-mono"
              style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 4 }}
            >
              ≈ log₁₊{fanout} {N} = {convergenceRounds}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '14px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          className="swim-mono"
          style={{
            fontSize: 11,
            color: 'var(--ink-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 240,
          }}
        >
          <span style={{ minWidth: 60 }}>N</span>
          <input
            type="range"
            min="20"
            max="500"
            step="10"
            value={N}
            onChange={(e) => setN(+e.target.value)}
            aria-label="Cluster size N"
            aria-valuetext={`${N} nodes`}
            style={{ flex: 1, accentColor: 'var(--brass)' }}
          />
          <span style={{ color: 'var(--brass)', minWidth: 40 }}>{N}</span>
        </div>
        <div
          className="swim-mono"
          style={{
            fontSize: 11,
            color: 'var(--ink-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 240,
          }}
        >
          <span style={{ minWidth: 60 }}>fanout</span>
          <input
            type="range"
            min="1"
            max="6"
            value={fanout}
            onChange={(e) => setFanout(+e.target.value)}
            aria-label="Gossip fanout"
            aria-valuetext={`fanout ${fanout}`}
            style={{ flex: 1, accentColor: 'var(--brass)' }}
          />
          <span style={{ color: 'var(--brass)', minWidth: 40 }}>{fanout}</span>
        </div>
      </div>
    </div>
  );
}
