import { useMemo, useState } from 'react';
import { layoutTree } from '../engine/index.js';
import Scope from '../components/Scope.jsx';
import TreeDiagram from '../components/TreeDiagram.jsx';
import { C } from '../components/helpers.js';
import { FIELD, TREE } from './shared-field.js';

/* ── §III · building — filing the ocean by range ── */
export default function BuildLab() {
  const { map, maxD, N } = useMemo(() => layoutTree(TREE), []);
  const [lvl, setLvl] = useState(0);
  const nodesUpToLvl = useMemo(
    () => Object.values(map).filter((m) => m.depth <= lvl && !m.node.leaf),
    [map, lvl],
  );
  const frontierIds = useMemo(
    () =>
      new Set(
        Object.values(map)
          .filter((m) => m.depth === lvl)
          .map((m) => m.node.id),
      ),
    [map, lvl],
  );
  const splitCount = Object.values(map).filter((m) => m.depth <= lvl && !m.node.leaf).length;

  return (
    <div className="vp-plate">
      <div className="vp-plabel">
        <span className="dot" /> scope · recursive partition by distance
      </div>
      <Scope>
        {FIELD.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.4" fill={C.contact} opacity="0.6" />
        ))}
        {nodesUpToLvl.map((m) => {
          const isFront = m.depth === lvl;
          return (
            <g key={m.node.id}>
              <circle
                cx={m.node.vp.x}
                cy={m.node.vp.y}
                r={m.node.mu}
                fill="none"
                stroke={isFront ? C.ping : 'rgba(63,224,198,0.22)'}
                strokeWidth={isFront ? 0.45 : 0.3}
                strokeDasharray={isFront ? 'none' : '1 1.4'}
              />
            </g>
          );
        })}
        {nodesUpToLvl.map((m) => {
          const isFront = m.depth === lvl;
          return (
            <circle
              key={'v' + m.node.id}
              cx={m.node.vp.x}
              cy={m.node.vp.y}
              r={isFront ? 1.9 : 1.4}
              fill={C.amber}
              opacity={isFront ? 1 : 0.5}
              filter={isFront ? 'url(#vpGlow)' : undefined}
            />
          );
        })}
      </Scope>

      <div className="vp-stat">
        <div className="vp-statcell">
          <div className="k">Levels revealed</div>
          <div className="v ping">
            {lvl}
            <span className="u">/ {maxD}</span>
          </div>
        </div>
        <div className="vp-statcell">
          <div className="k">Splits drawn</div>
          <div className="v">{splitCount}</div>
        </div>
        <div className="vp-statcell">
          <div className="k">Contacts</div>
          <div className="v">{N <= FIELD.length ? FIELD.length : N}</div>
        </div>
      </div>

      <div className="vp-ctrls">
        <button
          className="vp-btn solid"
          onClick={() => setLvl((l) => Math.min(maxD, l + 1))}
          disabled={lvl >= maxD}
        >
          ▾ Step deeper
        </button>
        <button className="vp-btn" onClick={() => setLvl(0)} disabled={lvl === 0}>
          Collapse
        </button>
      </div>

      <div className="vp-treewrap">
        <div className="vp-plabel" style={{ marginBottom: 8 }}>
          <span className="dot" /> the tree, growing in lockstep
        </div>
        <TreeDiagram root={TREE} pathSet={frontierIds} maxDepthShown={lvl} height={168} />
      </div>

      <div className="vp-caption">
        Each <span style={{ color: C.amber }}>amber landmark</span> is a <em>vantage point</em>; its
        <span style={{ color: C.ping }}> aqua ring</span> sits at the <em>median</em> range to
        everything it organises — so exactly half the contacts fall inside, half outside. Recurse on
        each half with a fresh vantage point. Median splits keep the tree balanced: {FIELD.length}{' '}
        contacts, ~{maxD} levels deep.
      </div>
    </div>
  );
}
