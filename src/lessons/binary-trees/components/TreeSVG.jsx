// The shared tree drawing. Takes the layout props produced by the engine's
// bstView / heapView (node list, positions keyed by id, edges, extents) plus a
// set of decorations — path / dimmed / current / found nodes, an optional height
// ruler — and renders the graph-paper SVG. Pure presentation; all the geometry
// of *which* node sits *where* comes from the engine.

// Pixel geometry for the drawing: node radius, column / row spacing, padding.
// View-only constants, used solely inside this component (not exported).
const R = 19,
  COL = 62,
  ROW = 72,
  PADX = 40,
  PADY = 34;

export default function TreeSVG({
  nodes,
  pos,
  edges,
  maxX,
  maxD,
  pathSet,
  dimSet,
  curId,
  foundId,
  pulse = false,
  showHeight = false,
  heightLabel,
  maxHeightPx = 340,
  onNode,
  label = 'tree diagram',
}) {
  pathSet = pathSet || new Set();
  dimSet = dimSet || new Set();
  const rightPad = showHeight ? 72 : PADX;
  const W = PADX + Math.max(maxX, 0) * COL + rightPad;
  const H = PADY * 2 + Math.max(maxD, 0) * ROW;
  const cx = (id) => PADX + pos[id].x * COL;
  const cy = (id) => PADY + pos[id].d * ROW;
  const dimX = PADX + Math.max(maxX, 0) * COL + 34;
  return (
    <svg
      className="bst-svg"
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ maxHeight: maxHeightPx, maxWidth: W, margin: '0 auto' }}
      role={onNode ? 'group' : 'img'}
      aria-label={label}
    >
      {showHeight && (
        <g aria-hidden="true">
          <line className="bst-dim" x1={dimX} y1={PADY} x2={dimX} y2={PADY + maxD * ROW} />
          {Array.from({ length: maxD + 1 }).map((_, d) => (
            <line
              key={d}
              className="bst-dim"
              x1={dimX - 4}
              y1={PADY + d * ROW}
              x2={dimX + 4}
              y2={PADY + d * ROW}
            />
          ))}
          <text
            className="bst-dim-txt"
            transform={`translate(${dimX + 16} ${PADY + (maxD * ROW) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {heightLabel !== undefined ? heightLabel : `height = ${maxD}`}
          </text>
        </g>
      )}
      {edges.map((e, i) => {
        const isPath = pathSet.has(e.from) && pathSet.has(e.to);
        const isDim = !isPath && (dimSet.has(e.from) || dimSet.has(e.to));
        return (
          <line
            key={i}
            className={`bst-edge ${isPath ? 'path' : ''} ${isDim ? 'dim' : ''}`}
            x1={cx(e.from)}
            y1={cy(e.from)}
            x2={cx(e.to)}
            y2={cy(e.to)}
          />
        );
      })}
      {nodes.map((n) => {
        const id = n.id;
        const dim = dimSet.has(id),
          path = pathSet.has(id),
          cur = curId === id,
          found = foundId === id;
        return (
          <g
            key={id}
            className="bst-nodeg"
            transform={`translate(${cx(id)} ${cy(id)})`}
            onClick={onNode ? () => onNode(id) : undefined}
            onKeyDown={
              onNode
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onNode(id);
                    }
                  }
                : undefined
            }
            role={onNode ? 'button' : undefined}
            tabIndex={onNode ? 0 : undefined}
            aria-label={onNode ? `Select node ${n.label}` : undefined}
            style={{ cursor: onNode ? 'pointer' : 'default' }}
          >
            <circle
              className={`bst-node ${dim ? 'dim' : ''} ${path ? 'path' : ''} ${cur ? 'cur' : ''} ${
                found ? 'found' : ''
              } ${pulse && cur ? 'bst-pulse' : ''}`}
              r={R}
              cx={0}
              cy={0}
            />
            <text
              className={`bst-node-label ${cur || found ? 'on' : ''} ${dim ? 'dim' : ''}`}
              x={0}
              y={1}
              fontSize={String(n.label).length > 2 ? 13 : 15}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
