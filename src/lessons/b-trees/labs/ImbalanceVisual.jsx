import { useState } from 'react';
import { GitBranch } from 'lucide-react';

// §IV — why trees lean. Toggle between the same seven keys filed in order
// (a degenerate vine) and kept balanced (bushy, short).
export default function ImbalanceVisual() {
  const [mode, setMode] = useState('vine');
  // 7 keys, two binary layouts
  const vine = [
    { k: 1, x: 30, y: 12 },
    { k: 2, x: 70, y: 34 },
    { k: 3, x: 110, y: 56 },
    { k: 4, x: 150, y: 78 },
    { k: 5, x: 190, y: 100 },
    { k: 6, x: 230, y: 122 },
    { k: 7, x: 270, y: 144 },
  ];
  const vineE = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
  ];
  const bush = [
    { k: 4, x: 160, y: 14 },
    { k: 2, x: 90, y: 70 },
    { k: 6, x: 230, y: 70 },
    { k: 1, x: 50, y: 126 },
    { k: 3, x: 130, y: 126 },
    { k: 5, x: 190, y: 126 },
    { k: 7, x: 270, y: 126 },
  ];
  const bushE = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ];
  const nodes = mode === 'vine' ? vine : bush;
  const edges = mode === 'vine' ? vineE : bushE;
  const depth = mode === 'vine' ? 7 : 3;
  const r = 15;
  return (
    <div className="bt-lab">
      <span className="bt-lab-tab">
        <GitBranch />
        The lean
      </span>
      <div className="bt-lab-body">
        <div className="bt-controls" style={{ marginBottom: 12 }}>
          <button
            className={`bt-btn ${mode === 'vine' ? 'bt-btn-stamp' : ''}`}
            onClick={() => setMode('vine')}
          >
            Filed in order
          </button>
          <button
            className={`bt-btn ${mode === 'bush' ? 'bt-btn-blue' : ''}`}
            onClick={() => setMode('bush')}
          >
            Kept balanced
          </button>
        </div>
        <svg viewBox="0 0 320 168" width="100%" style={{ maxHeight: 220, display: 'block' }}>
          {edges.map(([a, b], i) => (
            <line
              key={i}
              x1={nodes[a].x}
              y1={nodes[a].y}
              x2={nodes[b].x}
              y2={nodes[b].y}
              stroke={mode === 'vine' ? 'var(--stamp)' : 'var(--blue)'}
              strokeWidth="1.6"
              style={{ transition: 'all .4s' }}
            />
          ))}
          {nodes.map((n, i) => (
            <g key={i} style={{ transition: 'all .4s' }}>
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill="var(--card)"
                stroke={mode === 'vine' ? 'var(--stamp)' : 'var(--blue)'}
                strokeWidth="1.8"
              />
              <text
                x={n.x}
                y={n.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                fontSize="13"
                fill="var(--ink)"
              >
                {n.k}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span
            className="bt-chip"
            style={
              mode === 'vine'
                ? { color: 'var(--stamp)', borderColor: 'rgba(178,55,40,.4)' }
                : { color: 'var(--blue)', borderColor: 'rgba(30,79,98,.4)' }
            }
          >
            longest path: {depth} {depth === 1 ? 'hop' : 'hops'}
          </span>
        </div>
        <div className="bt-lab-cap">
          {mode === 'vine'
            ? 'Insert keys already in order and a plain binary tree degenerates into a vine — seven hops for seven keys, no better than a list. This is imbalance.'
            : 'Bushy and short: the same seven keys, longest path of three. The trick every balanced tree must pull off is staying like this no matter what order keys arrive.'}
        </div>
      </div>
    </div>
  );
}
