import { useMemo } from 'react';
import { layoutTree } from '../engine/index.js';
import { C } from './helpers.js';

// Renders the VP-tree as an in-order binary diagram: nodes positioned by the
// engine's layoutTree, with path / pruned / current highlighting driven by the
// labs.
export default function TreeDiagram({
  root,
  pathSet,
  prunedSet,
  currentId,
  maxDepthShown = 99,
  height = 188,
}) {
  const { map, links, N, maxD } = useMemo(() => layoutTree(root), [root]);
  const vbH = 60;
  const X = (idx) => 6 + (N <= 1 ? 0.5 : idx / (N - 1)) * 88;
  const Y = (d) => 8 + (maxD === 0 ? 0 : d / maxD) * (vbH - 16);
  const visible = (id) => map[id].depth <= maxDepthShown;
  return (
    <svg
      className="vp-tree"
      viewBox={`0 0 100 ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ height }}
    >
      {links.map(([a, b], i) => {
        if (!visible(a) || !visible(b)) return null;
        const pa = map[a],
          pb = map[b];
        const pruned = prunedSet && (prunedSet.has(a) || prunedSet.has(b));
        const onPath = pathSet && pathSet.has(a) && pathSet.has(b);
        return (
          <line
            key={i}
            x1={X(pa.idx)}
            y1={Y(pa.depth)}
            x2={X(pb.idx)}
            y2={Y(pb.depth)}
            stroke={pruned ? C.coralDim : onPath ? C.ping : 'rgba(110,138,134,0.45)'}
            strokeWidth={onPath ? 0.7 : 0.4}
            vectorEffect="non-scaling-stroke"
            strokeDasharray={pruned ? '1.2 1.2' : 'none'}
            opacity={pruned ? 0.7 : 1}
          />
        );
      })}
      {Object.keys(map).map((id) => {
        if (!visible(id)) return null;
        const p = map[id];
        const pruned = prunedSet && prunedSet.has(id);
        const onPath = pathSet && pathSet.has(id);
        const cur = currentId === Number(id);
        const fill = pruned ? C.coral : onPath ? C.ping : C.bone3;
        return (
          <g key={id}>
            {cur && (
              <circle
                cx={X(p.idx)}
                cy={Y(p.depth)}
                r="2.9"
                fill="none"
                stroke={C.amber}
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
              />
            )}
            <circle
              cx={X(p.idx)}
              cy={Y(p.depth)}
              r={onPath || cur ? 1.7 : 1.3}
              fill={fill}
              opacity={pruned ? 0.8 : 1}
              filter={cur ? 'url(#vpGlow)' : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}
