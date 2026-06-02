// The reusable SVG map renderer for both standard and radix tries. Every
// lab passes its own layout data + stateOf-style props to control which
// edges/nodes are "hot" and what to label. Branch colors live here because
// they exist only in service of this component.
const BRANCH_COLORS = {
  c: 'var(--clay)',
  d: 'var(--slate)',
  t: 'var(--plum)',
  s: 'var(--pine)',
  b: 'var(--ochre)',
};
function branchColor(b) {
  return BRANCH_COLORS[b] || 'var(--pine)';
}

export default function TrieMap({
  data,
  pathSet,
  subtreeSet,
  dimOthers = false,
  showWords = 'none',
  riderProgress = null,
  animateIn = false,
  presentSet = null,
}) {
  const { nodes, edges, w, h } = data;
  const present = (id) => !presentSet || presentSet.has(id);
  const inPath = (id) => pathSet && pathSet.has(id);
  const inSub = (id) => subtreeSet && subtreeSet.has(id);
  const hot = (id) => inPath(id) || inSub(id);
  const wordVisible = (n) => {
    if (!n.end) return false;
    if (showWords === 'all') return true;
    if (showWords === 'none') return false;
    if (showWords instanceof Set) return showWords.has(n.id);
    if (showWords === 'active') return hot(n.id);
    return false;
  };
  return (
    <div className="svgbox">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Trie diagram">
        <defs>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* edges */}
        {edges.map((e, i) => {
          const col = branchColor(e.branch);
          if (!present(e.to)) {
            return (
              <line
                key={'e' + i}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="var(--ink-dim)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="2 7"
                opacity="0.18"
              />
            );
          }
          const isHot = hot(e.to);
          const dim = dimOthers && !isHot;
          const mx = (e.x1 + e.x2) / 2,
            my = (e.y1 + e.y2) / 2;
          const delay = animateIn ? (e.y2 / h) * 0.5 : 0;
          return (
            <g
              key={'e' + i}
              style={
                animateIn
                  ? { animation: `edgeDraw .6s ease both`, animationDelay: `${delay}s` }
                  : undefined
              }
            >
              {isHot && (
                <line
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke={col}
                  strokeWidth="9"
                  strokeLinecap="round"
                  opacity="0.28"
                  filter="url(#glow)"
                />
              )}
              <line
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={isHot ? col : 'var(--ink)'}
                strokeWidth={isHot ? 5.5 : 4}
                strokeLinecap="round"
                opacity={dim ? 0.16 : isHot ? 1 : 0.5}
                style={{ transition: 'opacity .35s, stroke .35s, stroke-width .35s' }}
              />
              {/* letter chip (widens for multi-char radix segments) */}
              {(() => {
                const cw = Math.max(24, e.char.length * 9.5 + 9);
                return (
                  <g opacity={dim ? 0.2 : 1} style={{ transition: 'opacity .35s' }}>
                    <rect
                      x={mx - cw / 2}
                      y={my - 12}
                      width={cw}
                      height="24"
                      rx="9"
                      fill={isHot ? col : 'var(--paper-2)'}
                      stroke={isHot ? col : 'var(--hair)'}
                      strokeWidth="1.4"
                      style={{ transition: 'fill .3s, stroke .3s' }}
                    />
                    <text
                      x={mx}
                      y={my}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily="'JetBrains Mono',monospace"
                      fontSize="14.5"
                      fontWeight="600"
                      fill={isHot ? 'var(--paper)' : 'var(--ink-2)'}
                      style={{ transition: 'fill .3s' }}
                    >
                      {e.char}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
        {/* rider marker travelling along the active path */}
        {riderProgress && riderProgress.x != null && (
          <circle
            cx={riderProgress.x}
            cy={riderProgress.y}
            r="7.5"
            fill="var(--gold)"
            stroke="var(--paper)"
            strokeWidth="2.5"
            filter="url(#glow)"
          />
        )}
        {/* nodes */}
        {nodes.map((n, i) => {
          if (!present(n.id) && !n.isRoot) {
            return (
              <circle
                key={'n' + i}
                cx={n.px}
                cy={n.py}
                r="4"
                fill="none"
                stroke="var(--ink-dim)"
                strokeWidth="1.2"
                strokeDasharray="2 3"
                opacity="0.22"
              />
            );
          }
          const isHot = hot(n.id);
          const dim = dimOthers && !isHot && !n.isRoot;
          const delay = animateIn ? (n.py / h) * 0.5 + 0.1 : 0;
          if (n.isRoot) {
            return (
              <g
                key="root"
                opacity={dim ? 0.3 : 1}
                style={animateIn ? { animation: `nodePop .5s ease both` } : undefined}
              >
                <rect
                  x={n.px - 10}
                  y={n.py - 10}
                  width="20"
                  height="20"
                  rx="4"
                  transform={`rotate(45 ${n.px} ${n.py})`}
                  fill="var(--ink)"
                />
                <text
                  x={n.px}
                  y={n.py - 20}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono',monospace"
                  fontSize="10.5"
                  letterSpacing="1.5"
                  fill="var(--ink-dim)"
                >
                  START
                </text>
              </g>
            );
          }
          return (
            <g
              key={'n' + i}
              opacity={dim ? 0.22 : 1}
              style={{
                transition: 'opacity .35s',
                ...(animateIn
                  ? { animation: `nodePop .45s ease both`, animationDelay: `${delay}s` }
                  : {}),
              }}
            >
              {n.end ? (
                <>
                  {isHot && (
                    <circle
                      cx={n.px}
                      cy={n.py}
                      r="13"
                      fill="var(--signal)"
                      opacity="0.3"
                      filter="url(#glow)"
                    />
                  )}
                  <circle
                    cx={n.px}
                    cy={n.py}
                    r={isHot ? 9.5 : 8}
                    fill="var(--signal)"
                    stroke="var(--paper)"
                    strokeWidth="2.4"
                    style={{ transition: 'r .3s' }}
                  />
                  <circle cx={n.px} cy={n.py} r="2.6" fill="var(--paper)" />
                </>
              ) : (
                <circle
                  cx={n.px}
                  cy={n.py}
                  r={isHot ? 7.5 : 6}
                  fill="var(--panel)"
                  stroke={isHot ? 'var(--gold)' : 'var(--ink-dim)'}
                  strokeWidth={isHot ? 2.6 : 1.8}
                  style={{ transition: 'r .3s, stroke .3s' }}
                />
              )}
              {wordVisible(n) && (
                <text
                  x={n.px}
                  y={n.leaf ? n.py + 22 : n.py - 13}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono',monospace"
                  fontSize="13"
                  fontWeight="600"
                  fill={isHot ? 'var(--signal)' : 'var(--ink-2)'}
                  style={{ transition: 'fill .3s' }}
                >
                  {n.prefix}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
