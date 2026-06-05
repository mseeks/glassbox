import { useMemo, useState } from 'react';
import { GitFork } from 'lucide-react';
import { buildFresh, bstView, findNode, subtreeKeys, HERO_KEYS } from '../engine/index.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §03 — the vocabulary, made tappable. Toggle root / leaves / a subtree, or tap
// any node to reroot its subtree. The self-similarity (every node is the top of
// a smaller tree) is the point.
export default function AnatomyLab() {
  const root = useMemo(() => buildFresh(HERO_KEYS), []);
  const view = useMemo(() => bstView(root), [root]);
  const [mode, setMode] = useState('subtree'); // subtree | root | leaves
  const [picked, setPicked] = useState(25);
  const leaves = [12, 37, 62, 87];
  let pathSet = new Set(),
    dimSet = new Set(),
    curId = null,
    cap = '';
  if (mode === 'root') {
    curId = 50;
    cap = (
      <>
        The <b>root</b> (<b>50</b>) is the single node with no parent. Every search starts here.
      </>
    );
  } else if (mode === 'leaves') {
    pathSet = new Set(leaves);
    cap = (
      <>
        The <b>leaves</b> ({leaves.join(', ')}) have no children — the bottom edge of the tree.
      </>
    );
  } else {
    const node = findNode(root, picked);
    pathSet = subtreeKeys(node, new Set());
    const all = new Set(view.nodes.map((n) => n.id));
    dimSet = new Set([...all].filter((k) => !pathSet.has(k)));
    cap = (
      <>
        <b>{picked}</b> roots its own subtree of <b>{pathSet.size}</b> node
        {pathSet.size > 1 ? 's' : ''}. Every node is the top of a smaller tree — that
        self-similarity is why the algorithms are all short recursion.
      </>
    );
  }
  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <GitFork aria-hidden="true" />
          anatomy — tap any node
        </span>
      </div>
      <div className="bst-lab-body">
        <div className="bst-controls" style={{ marginBottom: 10 }}>
          <div className="bst-seg">
            <button className={mode === 'root' ? 'on' : ''} onClick={() => setMode('root')}>
              root
            </button>
            <button className={mode === 'leaves' ? 'on' : ''} onClick={() => setMode('leaves')}>
              leaves
            </button>
            <button className={mode === 'subtree' ? 'on' : ''} onClick={() => setMode('subtree')}>
              a subtree
            </button>
          </div>
        </div>
        <TreeSVG
          {...view}
          pathSet={pathSet}
          dimSet={dimSet}
          curId={curId}
          onNode={(id) => {
            setMode('subtree');
            setPicked(id);
          }}
          maxHeightPx={270}
          label="anatomy of a binary search tree"
        />
        <div className="bst-cap">
          {cap}
          {mode === 'subtree' && (
            <span className="bst-foot"> &nbsp;· tap another node to reroot.</span>
          )}
        </div>
      </div>
    </div>
  );
}
