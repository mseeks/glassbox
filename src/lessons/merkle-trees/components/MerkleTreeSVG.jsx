import { useEffect, useMemo, useRef } from 'react';

// The reusable tree engraving (SVG). Every interactive lab renders one of
// these, with its own stateOf() / labelOf() / onLeafClick() / rootSeal.
// Co-located here are the geometry helper (layoutTree), the per-state
// styles (STATE_STYLE), and the horizontal-scroll wrapper (ScrollableTree)
// because all three exist solely in service of the SVG.

// compute SVG x/y positions for each node in each level
function layoutTree(levels, width, levelGap) {
  const nLeaves = levels[0].length;
  const margin = width / (nLeaves * 2);
  const positions = levels.map((lvl) => lvl.map(() => ({ x: 0, y: 0 })));
  // leaves evenly spaced
  for (let i = 0; i < nLeaves; i++) {
    positions[0][i] = { x: margin + (i * (width - 2 * margin)) / Math.max(1, nLeaves - 1), y: 0 };
  }
  // parents at midpoint of children
  for (let L = 1; L < levels.length; L++) {
    for (let i = 0; i < levels[L].length; i++) {
      const node = levels[L][i];
      const lx = positions[L - 1][node.l].x;
      const rx = positions[L - 1][node.r].x;
      positions[L][i] = { x: (lx + rx) / 2, y: L * levelGap };
    }
  }
  return positions;
}

const STATE_STYLE = {
  idle: { fill: 'var(--plate)', stroke: 'var(--line-bright)', text: 'var(--paper-dim)' },
  path: { fill: 'var(--patina-glow)', stroke: 'var(--patina)', text: 'var(--patina)' },
  sibling: { fill: 'var(--gold-glow)', stroke: 'var(--gold)', text: 'var(--gold-bright)' },
  target: { fill: 'var(--gold-glow)', stroke: 'var(--gold-bright)', text: 'var(--gold-bright)' },
  tamper: { fill: 'var(--cinnabar-glow)', stroke: 'var(--cinnabar)', text: 'var(--cinnabar)' },
  dim: { fill: 'var(--ink-2)', stroke: 'var(--line)', text: 'var(--paper-faint)' },
  match: { fill: 'var(--patina-glow)', stroke: 'var(--patina-deep)', text: 'var(--patina)' },
  mismatch: { fill: 'var(--cinnabar-glow)', stroke: 'var(--cinnabar)', text: 'var(--cinnabar)' },
  recompute: { fill: 'var(--patina-glow)', stroke: 'var(--patina)', text: 'var(--patina)' },
};

function ScrollableTree({ minWidth, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [minWidth]);
  return (
    <div className="mk-tree-scroll" ref={ref}>
      <div style={{ minWidth }}>{children}</div>
      <div className="mk-swipe-hint mk-mono">swipe to pan the tree →</div>
    </div>
  );
}

export default function MerkleTreeSVG({
  levels,
  width = 720,
  levelGap = 92,
  nodeW = 74,
  nodeH = 30,
  stateOf = () => 'idle',
  hashOf = null,
  labelOf = null,
  visibleLevels = null,
  rootSeal = null,
  onLeafClick = null,
  dimEdges = false,
  scrollMinWidth = null,
}) {
  const positions = useMemo(() => layoutTree(levels, width, levelGap), [levels, width, levelGap]);
  const height = (levels.length - 1) * levelGap + nodeH + 34;
  const topY = (L) => height - nodeH - 18 - positions[L][0].y; // invert so root on top

  const maxLevel = visibleLevels == null ? levels.length - 1 : visibleLevels;

  const svg = (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* edges */}
      {levels.map((lvl, L) => {
        if (L === 0 || L > maxLevel) return null;
        return lvl.map((node, i) => {
          const px = positions[L][i].x,
            py = topY(L) + nodeH / 2;
          const childIdxs = node.l === node.r ? [node.l] : [node.l, node.r];
          return childIdxs.map((ci) => {
            const cx = positions[L - 1][ci].x,
              cy = topY(L - 1) + nodeH / 2;
            const st = stateOf(L, i);
            const childSt = stateOf(L - 1, ci);
            const lit =
              (st === 'path' || st === 'recompute') &&
              (childSt === 'path' ||
                childSt === 'sibling' ||
                childSt === 'target' ||
                childSt === 'recompute');
            return (
              <path
                key={`e${L}-${i}-${ci}`}
                className="mk-edge"
                d={`M ${cx} ${cy} C ${cx} ${(cy + py) / 2}, ${px} ${(cy + py) / 2}, ${px} ${py}`}
                fill="none"
                stroke={lit ? 'var(--gold)' : 'var(--line-bright)'}
                strokeWidth={lit ? 1.6 : 1}
                opacity={dimEdges && st === 'dim' ? 0.18 : lit ? 0.9 : 0.45}
              />
            );
          });
        });
      })}

      {/* nodes */}
      {levels.map((lvl, L) => {
        if (L > maxLevel) return null;
        return lvl.map((node, i) => {
          const isRoot = L === levels.length - 1;
          const st = stateOf(L, i);
          const sty = STATE_STYLE[st] || STATE_STYLE.idle;
          const x = positions[L][i].x,
            y = topY(L);
          const h = hashOf ? hashOf(L, i) : node.hash;
          const shown = (h || node.hash).slice(0, 6);
          const clickable = L === 0 && onLeafClick;

          if (isRoot && rootSeal) {
            const ok = rootSeal === 'ok';
            const col = ok ? 'var(--gold)' : 'var(--cinnabar)';
            return (
              <g
                key={`n${L}-${i}`}
                transform={`translate(${x}, ${y + nodeH / 2})`}
                style={{ transformOrigin: 'center', animation: 'mk-seal-in 0.6s ease' }}
              >
                <circle
                  r="26"
                  fill={ok ? 'var(--gold-glow)' : 'var(--cinnabar-glow)'}
                  stroke={col}
                  strokeWidth="1.5"
                />
                <circle
                  r="20"
                  fill="none"
                  stroke={col}
                  strokeWidth="0.75"
                  opacity="0.6"
                  strokeDasharray="2 3"
                />
                <text
                  textAnchor="middle"
                  y="-2"
                  className="mk-mono"
                  fontSize="8.5"
                  fill={col}
                  letterSpacing="0.5"
                >
                  {shown}
                </text>
                <text
                  textAnchor="middle"
                  y="9"
                  className="mk-mono"
                  fontSize="6.5"
                  fill={col}
                  opacity="0.8"
                  letterSpacing="1.5"
                >
                  {ok ? 'SEALED' : 'BROKEN'}
                </text>
              </g>
            );
          }

          return (
            <g
              key={`n${L}-${i}`}
              onClick={clickable ? () => onLeafClick(i) : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onLeafClick(i);
                      }
                    }
                  : undefined
              }
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={clickable ? `Select leaf ${labelOf ? labelOf(i) : i + 1}` : undefined}
              className={clickable ? 'mk-leaf-hit' : undefined}
              style={{ cursor: clickable ? 'pointer' : 'default' }}
            >
              <rect
                className="mk-node-rect"
                x={x - nodeW / 2}
                y={y}
                width={nodeW}
                height={nodeH}
                rx="3"
                fill={sty.fill}
                stroke={sty.stroke}
                strokeWidth={st === 'target' ? 2 : 1.1}
                opacity={st === 'dim' ? 0.4 : 1}
              />
              <text
                x={x}
                y={y + nodeH / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="mk-mono"
                fontSize="10"
                fill={sty.text}
                letterSpacing="0.3"
                opacity={st === 'dim' ? 0.5 : 1}
              >
                {shown}
              </text>
              {L === 0 && labelOf && (
                <text
                  x={x}
                  y={y + nodeH + 13}
                  textAnchor="middle"
                  className="mk-mono"
                  fontSize="9.5"
                  fill={st === 'dim' ? 'var(--paper-faint)' : 'var(--paper-dim)'}
                  opacity={st === 'dim' ? 0.5 : 0.9}
                >
                  {labelOf(i)}
                </text>
              )}
            </g>
          );
        });
      })}
    </svg>
  );

  if (scrollMinWidth) {
    return <ScrollableTree minWidth={scrollMinWidth}>{svg}</ScrollableTree>;
  }
  return svg;
}
