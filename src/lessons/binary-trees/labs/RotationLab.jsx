import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  buildFresh,
  bstView,
  inorder,
  clone,
  rotateRight,
  rotateLeft,
  ROT_INIT,
} from '../engine/index.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §07 — rotate at the root and watch the in-order sequence survive untouched.
// That a rotation changes height but not order is exactly what lets a tree
// rebalance safely. The clone + rotate come from the engine.
export default function RotationLab() {
  const [tree, setTree] = useState(() => buildFresh(ROT_INIT));
  const [last, setLast] = useState(null);
  const view = useMemo(() => bstView(tree), [tree]);
  const io = useMemo(() => inorder(tree), [tree]);
  const canR = !!tree.left,
    canL = !!tree.right;
  const rot = (dir) => {
    const t = clone(tree);
    const nr = dir === 'R' ? rotateRight(t) : rotateLeft(t);
    setLast({ dir, rose: nr.key });
    setTree(nr);
  };
  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <RotateCcw aria-hidden="true" />
          rotate — watch the order survive
        </span>
      </div>
      <div className="bst-lab-body">
        <p className="bst-note">
          A rotation pivots three nodes: a child rises, the parent sinks, one subtree re-hangs. Run
          it and check the sorted sequence underneath.
        </p>
        <div className="bst-controls" style={{ marginBottom: 10 }}>
          <button className="bst-btn blue" onClick={() => rot('R')} disabled={!canR}>
            <RotateCcw aria-hidden="true" />
            rotate right at root
          </button>
          <button className="bst-btn blue" onClick={() => rot('L')} disabled={!canL}>
            <RotateCcw style={{ transform: 'scaleX(-1)' }} aria-hidden="true" />
            rotate left at root
          </button>
          <button
            className="bst-btn ghost"
            onClick={() => {
              setTree(buildFresh(ROT_INIT));
              setLast(null);
            }}
          >
            <RotateCcw aria-hidden="true" />
            reset
          </button>
        </div>
        <TreeSVG
          {...view}
          pathSet={new Set([tree.key])}
          maxHeightPx={250}
          label="rotation at the root"
        />
        <div className="bst-foot" style={{ margin: '12px 0 5px', color: 'var(--sage)' }}>
          in-order sequence — unchanged by every rotation ✓
        </div>
        <div className="bst-arr">
          {io.map((k, idx) => (
            <div
              key={idx}
              className="bst-acell lit"
              style={{
                width: 42,
                height: 42,
                fontSize: 14,
                background: 'var(--sage)',
                borderColor: 'var(--sage)',
              }}
            >
              {k}
            </div>
          ))}
        </div>
        <div className="bst-cap">
          {!last ? (
            <>
              The current <b>root</b> is highlighted. A rotation <em>reshapes</em> the tree without
              changing what it stores.
            </>
          ) : (
            <>
              <b>{last.rose}</b> rose to the root. The drawing reshaped — but the sequence below is
              identical.{' '}
              <span className="hot">Rotations preserve order while reshaping the tree</span> — the
              lever for changing its height, which is exactly what lets a tree rebalance safely.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
