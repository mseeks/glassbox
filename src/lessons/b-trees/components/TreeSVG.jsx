import { buildLayout } from '../engine/index.js';

// The shared SVG tree renderer for both the B-tree and B+ tree labs. Each lab
// passes its own root + state (pathIds / focusIds / dim / cmpId / medianKey) to
// control which nodes and edges light up. Geometry comes from buildLayout in
// the engine; this component only draws.
export default function TreeSVG({
  root,
  state = {},
  maxHeight = 320,
  compact = false,
  label = 'B-tree diagram: nodes hold sorted keys and point down to child pages',
}) {
  const o = compact
    ? { cellW: 26, cellH: 28, padX: 6, leafGap: 18, levelH: 78 }
    : { cellW: 31, cellH: 33, padX: 7, leafGap: 24, levelH: 94 };
  const L = buildLayout(root, o);
  const pathIds = state.pathIds || new Set();
  const focusIds = state.focusIds || new Set();
  const dim = state.dim;
  const cmpId = state.cmpId;

  const nodeFill = (n) =>
    focusIds.has(n.id)
      ? 'var(--stamp-wash)'
      : pathIds.has(n.id)
        ? 'var(--blue-wash)'
        : 'var(--card)';
  const nodeStroke = (n) =>
    focusIds.has(n.id) ? 'var(--stamp)' : pathIds.has(n.id) ? 'var(--blue)' : 'var(--rule-2)';
  const nodeSW = (n) => (focusIds.has(n.id) || pathIds.has(n.id) ? 2 : 1.25);
  const nodeOpacity = (n) => (dim && !focusIds.has(n.id) && !pathIds.has(n.id) ? 0.4 : 1);

  return (
    <svg
      viewBox={`${L.minX} -10 ${L.width} ${L.height + 20}`}
      width="100%"
      style={{ maxHeight, display: 'block', overflow: 'visible' }}
      role="img"
      aria-label={label}
    >
      {L.edges.map((e, i) => {
        const my = (e.y1 + e.y2) / 2;
        const on = pathIds.has(e.to) || focusIds.has(e.to);
        return (
          <path
            key={i}
            d={`M ${e.x1} ${e.y1} C ${e.x1} ${my}, ${e.x2} ${my}, ${e.x2} ${e.y2}`}
            fill="none"
            stroke={on ? 'var(--blue)' : 'var(--rule-2)'}
            strokeWidth={on ? 2 : 1.25}
            style={{ transition: 'stroke .3s ease', opacity: dim && !on ? 0.35 : 1 }}
          />
        );
      })}
      {L.nodes.map((n) => (
        <g
          key={n.id}
          transform={`translate(${n.x},${n.y})`}
          style={{ transition: 'opacity .3s ease', opacity: nodeOpacity(n) }}
        >
          <rect
            x="0"
            y="0"
            width={n.w}
            height={o.cellH}
            rx="5"
            fill={nodeFill(n)}
            stroke={nodeStroke(n)}
            strokeWidth={nodeSW(n)}
            style={{ transition: 'fill .3s ease, stroke .3s ease' }}
          />
          {n.keys.map((k, j) => {
            const cellX = o.padX + j * o.cellW;
            const isMedian = state.medianKey != null && focusIds.has(n.id) && k === state.medianKey;
            const isCmp = cmpId === n.id && state.cmpKey === k;
            return (
              <g key={j}>
                {j > 0 && (
                  <line
                    x1={cellX}
                    y1="5"
                    x2={cellX}
                    y2={o.cellH - 5}
                    stroke="var(--rule)"
                    strokeWidth="1"
                  />
                )}
                {(isMedian || isCmp) && (
                  <rect
                    x={cellX + 1.5}
                    y="3"
                    width={o.cellW - 3}
                    height={o.cellH - 6}
                    rx="3"
                    fill={isMedian ? 'var(--stamp)' : 'var(--blue)'}
                    style={{ transition: 'all .25s' }}
                  />
                )}
                <text
                  x={cellX + o.cellW / 2}
                  y={o.cellH / 2 + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  fontSize={compact ? 12.5 : 14}
                  style={{
                    fill: isMedian || isCmp ? 'var(--bt-on-accent)' : 'var(--ink)',
                    transition: 'fill .25s',
                  }}
                >
                  {k}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
