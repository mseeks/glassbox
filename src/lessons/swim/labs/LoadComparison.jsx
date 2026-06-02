import { useMemo, useState } from 'react';
import { makeRng } from '../engine/index.js';
import { ClusterNode } from '../components/ClusterNode.jsx';

export function LoadComparison() {
  const [N, setN] = useState(24);
  const [mode, setMode] = useState('all-to-all'); // 'all-to-all' | 'centralized' | 'swim'
  const W = 720,
    H = 360;

  // arrange N nodes in a ring
  const nodes = useMemo(() => {
    const cx = W / 2,
      cy = H / 2;
    const r = Math.min(W, H) * 0.36;
    return Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      return { id: i, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    });
  }, [N]);

  // edges per mode
  const edges = useMemo(() => {
    if (mode === 'all-to-all') {
      const out = [];
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) out.push({ a: i, b: j });
      return out;
    }
    if (mode === 'centralized') {
      return Array.from({ length: N - 1 }, (_, i) => ({ a: 0, b: i + 1 }));
    }
    if (mode === 'swim') {
      // each node probes ONE random other per round
      const rng = makeRng(N * 7 + 3);
      const out = [];
      for (let i = 0; i < N; i++) {
        let j = Math.floor(rng() * (N - 1));
        if (j >= i) j++;
        out.push({ a: i, b: j });
      }
      return out;
    }
    return [];
  }, [N, mode]);

  const msgCount =
    mode === 'all-to-all' ? N * (N - 1) : mode === 'centralized' ? 2 * (N - 1) : N * 2; // each node: 1 ping + 1 ack

  const perNodeLoad =
    mode === 'all-to-all'
      ? 2 * (N - 1)
      : mode === 'centralized'
        ? '2(N-1) at center, 2 elsewhere'
        : 2;

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
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div className="swim-label" style={{ color: 'var(--ink-dim)' }}>
          Per-round message load <span style={{ color: 'var(--brass)' }}>·</span> N = {N}
        </div>
        <div className="swim-toggle-row">
          <button
            className="swim-btn"
            data-active={mode === 'all-to-all'}
            onClick={() => setMode('all-to-all')}
          >
            All-to-all
          </button>
          <button
            className="swim-btn"
            data-active={mode === 'centralized'}
            onClick={() => setMode('centralized')}
          >
            Centralized
          </button>
          <button
            className="swim-btn"
            data-active={mode === 'swim'}
            onClick={() => setMode('swim')}
          >
            SWIM
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 0 }}>
        <div style={{ position: 'relative', background: 'var(--bg-deeper)' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            {/* edges */}
            {edges.map((e, i) => {
              const a = nodes[e.a],
                b = nodes[e.b];
              if (!a || !b) return null;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--probe)"
                  strokeOpacity={mode === 'all-to-all' ? 0.18 : 0.42}
                  strokeWidth={mode === 'all-to-all' ? 0.5 : 0.9}
                />
              );
            })}
            {/* nodes */}
            {nodes.map((n, i) => (
              <ClusterNode
                key={n.id}
                x={n.x}
                y={n.y}
                state="alive"
                size={mode === 'centralized' && i === 0 ? 9 : 5}
              />
            ))}
            {mode === 'centralized' && nodes[0] && (
              <text
                x={nodes[0].x}
                y={nodes[0].y + 24}
                textAnchor="middle"
                fontSize="9"
                fill="var(--brass)"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="0.1em"
              >
                MONITOR
              </text>
            )}
          </svg>
        </div>
        <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="swim-label" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>
              Messages / round
            </div>
            <div
              className="swim-display"
              style={{
                fontSize: 56,
                lineHeight: 1,
                color:
                  mode === 'all-to-all'
                    ? 'var(--dead)'
                    : mode === 'swim'
                      ? 'var(--alive)'
                      : 'var(--suspect)',
                fontWeight: 300,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {msgCount.toLocaleString()}
            </div>
            <div
              className="swim-mono"
              style={{ fontSize: 12, color: 'var(--ink-dim)', marginTop: 4 }}
            >
              {mode === 'all-to-all' && (
                <>
                  N·(N−1) = <em style={{ color: 'var(--brass)' }}>O(N²)</em>
                </>
              )}
              {mode === 'centralized' && (
                <>
                  2·(N−1) = <em style={{ color: 'var(--brass)' }}>O(N)</em>
                </>
              )}
              {mode === 'swim' && (
                <>
                  2·N = <em style={{ color: 'var(--brass)' }}>O(N)</em> total,{' '}
                  <em style={{ color: 'var(--brass)' }}>O(1)</em> per node
                </>
              )}
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div>
            <div className="swim-label" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>
              Per-node load
            </div>
            <div className="swim-mono" style={{ fontSize: 13, color: 'var(--ink)' }}>
              {typeof perNodeLoad === 'number' ? `${perNodeLoad} msg/round` : perNodeLoad}
            </div>
          </div>
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div>
            <div className="swim-label" style={{ color: 'var(--ink-faint)', marginBottom: 8 }}>
              Single point of failure?
            </div>
            <div
              className="swim-mono"
              style={{
                fontSize: 13,
                color: mode === 'centralized' ? 'var(--dead)' : 'var(--alive)',
              }}
            >
              {mode === 'centralized' ? 'Yes — the monitor' : 'No'}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
        }}
      >
        <div
          className="swim-mono"
          style={{
            fontSize: 11,
            color: 'var(--ink-dim)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <span>N</span>
          <input
            type="range"
            min="6"
            max="60"
            value={N}
            onChange={(e) => setN(+e.target.value)}
            aria-label="Cluster size N"
            aria-valuetext={`${N} nodes`}
            style={{ flex: 1, minWidth: 200, accentColor: 'var(--brass)' }}
          />
          <span style={{ color: 'var(--brass)', minWidth: 60 }}>= {N}</span>
        </div>
      </div>
    </div>
  );
}
