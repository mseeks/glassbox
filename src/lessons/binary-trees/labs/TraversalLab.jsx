import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, ChevronRight, ListOrdered } from 'lucide-react';
import { buildFresh, bstView, orderEvents, HERO_KEYS } from '../engine/index.js';
import { useStepper } from '../components/useStepper.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §05 — walk the tree, collect the keys. In-order (left, node, right) emits them
// in ascending order — the search tree is a sorted list in disguise. The visit
// sequence for each traversal kind comes from the engine's orderEvents.
export default function TraversalLab() {
  const root = useMemo(() => buildFresh(HERO_KEYS), []);
  const view = useMemo(() => bstView(root), [root]);
  const [kind, setKind] = useState('in');
  const events = useMemo(() => orderEvents(root, kind), [root, kind]);
  const { i, playing, play, step, reset, atEnd } = useStepper(events.length, 640);
  useEffect(() => {
    reset();
  }, [kind, reset]);
  const visited = events.slice(0, i + 1);
  const pathSet = new Set(visited);
  const curId = events[i];
  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <ListOrdered aria-hidden="true" />
          walk the tree, collect the keys
        </span>
      </div>
      <div className="bst-lab-body">
        <div className="bst-controls" style={{ marginBottom: 10 }}>
          <div className="bst-seg">
            <button className={kind === 'in' ? 'on' : ''} onClick={() => setKind('in')}>
              in-order
            </button>
            <button className={kind === 'pre' ? 'on' : ''} onClick={() => setKind('pre')}>
              pre-order
            </button>
            <button className={kind === 'post' ? 'on' : ''} onClick={() => setKind('post')}>
              post-order
            </button>
          </div>
          <button className="bst-btn red" onClick={play} disabled={playing}>
            <Play aria-hidden="true" />
            {atEnd ? 'replay' : 'walk'}
          </button>
          <button className="bst-btn ghost" onClick={step} disabled={atEnd}>
            <ChevronRight aria-hidden="true" />
            step
          </button>
          <button className="bst-btn ghost" onClick={reset}>
            <RotateCcw aria-hidden="true" />
            reset
          </button>
        </div>
        <TreeSVG
          {...view}
          pathSet={pathSet}
          curId={curId}
          pulse
          maxHeightPx={250}
          label={`${kind}-order traversal`}
        />
        <div className="bst-foot" style={{ margin: '12px 0 5px' }}>
          emitted sequence:
        </div>
        <div className="bst-arr">
          {visited.map((k, idx) => (
            <div
              key={idx}
              className={`bst-acell ${idx === visited.length - 1 ? 'cur' : 'lit'}`}
              style={{ width: 42, height: 42, fontSize: 14 }}
            >
              {k}
            </div>
          ))}
          {Array.from({ length: events.length - visited.length }).map((_, idx) => (
            <div
              key={'e' + idx}
              className="bst-acell"
              style={{ width: 42, height: 42, opacity: 0.3 }}
            />
          ))}
        </div>
        <div className="bst-cap">
          {kind === 'in' && (
            <>
              Recurse left, visit, recurse right. The left subtree (everything smaller) drains
              first, so keys come out in <span className="hot">ascending order</span>
              {atEnd ? <> — sorted, for free.</> : '.'} A search tree is a sorted list in disguise.
            </>
          )}
          {kind === 'pre' && (
            <>
              Node before its children. This order <b>serializes the tree&apos;s shape</b> — useful
              for saving or copying a tree.
            </>
          )}
          {kind === 'post' && (
            <>
              Children before the node. This is how you <b>free</b> a tree, or evaluate an
              expression where operands must resolve before their operator.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
