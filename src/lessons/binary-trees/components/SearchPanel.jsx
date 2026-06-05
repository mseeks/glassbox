import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, ChevronRight } from 'lucide-react';
import { searchPath, bstView, inorder, findNode, subtreeKeys } from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useStepper } from './useStepper.js';
import TreeSVG from './TreeSVG.jsx';
import Legend from './Legend.jsx';

// A reusable animated search descent: pick a target chip, watch the comparison
// path walk down while each discarded branch dims. The descent autoplays when
// the target changes; under reduced motion it skips straight to the final frame.
export default function SearchPanel({ root, presets, absent, maxHeightPx = 300 }) {
  const reduced = usePrefersReducedMotion();
  const [target, setTarget] = useState(presets[0]);
  const res = useMemo(() => searchPath(root, target), [root, target]);
  const len = res.path.length;
  const { i, setI, playing, play, step, reset, atEnd } = useStepper(len, 620);
  useEffect(() => {
    reset();
    if (reduced) {
      setI(len - 1);
      return;
    }
    setI(0);
    const t = setTimeout(() => play(), 130);
    return () => clearTimeout(t);
    // Restart + autoplay only when the target changes. play() re-identifies on
    // every step, so listing it would retrigger this reset mid-animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reduced]);

  const view = useMemo(() => bstView(root), [root]);
  const pathSet = new Set(res.path.slice(0, i + 1));
  const dimSet = useMemo(() => {
    const dim = new Set();
    for (let k = 0; k < i; k++) {
      const node = findNode(root, res.path[k]);
      const next = res.path[k + 1];
      if (next === undefined) break;
      const discarded = next < node.key ? node.right : node.left;
      subtreeKeys(discarded, dim);
    }
    return dim;
  }, [root, res, i]);
  const curId = res.path[i];
  const done = atEnd;
  const foundId = done && res.found ? curId : null;

  const total = inorder(root).length;
  const allChips = [...presets, ...absent];

  return (
    <div>
      <div className="bst-controls" style={{ marginBottom: 6 }}>
        <span className="bst-foot" style={{ marginRight: 2 }}>
          find:
        </span>
        <div className="bst-chiprow">
          {allChips.map((v) => (
            <button
              key={v}
              className={`bst-chip ${target === v ? 'on' : ''}`}
              onClick={() => setTarget(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="bst-controls" style={{ marginBottom: 10 }}>
        <button className="bst-btn red" onClick={play} disabled={playing}>
          <Play aria-hidden="true" />
          {atEnd ? 'replay' : 'play descent'}
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
        dimSet={dimSet}
        curId={done ? null : curId}
        foundId={foundId}
        pulse={!done}
        maxHeightPx={maxHeightPx}
        label={`searching for ${target}`}
      />
      <Legend
        items={[
          { c: 'var(--red)', t: 'path taken (current key)' },
          { c: 'var(--blue)', t: 'structure' },
          { c: 'var(--dim)', t: 'discarded — never examined' },
          { c: 'var(--sage)', t: 'match' },
        ]}
      />
      <div className="bst-cap">
        {!done ? (
          <>
            Comparing against <b>{curId}</b>.{' '}
            {res.path[i + 1] !== undefined ? (
              <>
                Target is {target < curId ? 'smaller' : 'larger'} → go{' '}
                {target < curId ? 'left' : 'right'}, and the entire{' '}
                {target < curId ? 'right' : 'left'} subtree is{' '}
                <span className="hot">thrown away unexamined</span>.
              </>
            ) : (
              <>this is the last step.</>
            )}
          </>
        ) : res.found ? (
          <>
            Found <b>{target}</b> in{' '}
            <span className="hot">
              {res.path.length} comparison{res.path.length > 1 ? 's' : ''}
            </span>{' '}
            — out of {total} keys. Every step discarded a whole branch.
          </>
        ) : (
          <>
            Fell off the tree after{' '}
            <span className="hot">
              {res.path.length} comparison{res.path.length > 1 ? 's' : ''}
            </span>
            : <b>{target}</b> is not present. The empty slot we landed in is exactly where it would
            be inserted.
          </>
        )}
      </div>
    </div>
  );
}
