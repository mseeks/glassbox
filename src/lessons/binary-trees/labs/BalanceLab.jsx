import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, ChevronRight, GitFork } from 'lucide-react';
import { buildFresh, bstView, height, SORTED_ORDER, SHUFFLED_ORDER } from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useStepper } from '../components/useStepper.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §06 — the same keys, two insertion orders. Sorted input degenerates into a
// straight stick; a mixed order stays bushy. Autoplays on mount per order;
// gated under reduced motion.
export default function BalanceLab() {
  const reduced = usePrefersReducedMotion();
  const [order, setOrder] = useState('sorted');
  const seq = order === 'sorted' ? SORTED_ORDER : SHUFFLED_ORDER;
  const { i, playing, play, step, reset, atEnd } = useStepper(seq.length, 600);
  useEffect(() => {
    reset();
    if (reduced) return;
    const t = setTimeout(() => play(), 160);
    return () => clearTimeout(t);
    // Restart + autoplay only when the scenario changes. play() re-identifies on
    // every step, so listing it would retrigger this reset mid-animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, reduced]);
  const built = seq.slice(0, i + 1);
  // `built` is fully determined by `seq` and `i`; memoize on those so the
  // dependency array stays statically checkable.
  const root = useMemo(() => buildFresh(seq.slice(0, i + 1)), [seq, i]);
  const view = useMemo(() => bstView(root), [root]);
  const h = height(root);
  const curId = built[built.length - 1];
  const worstFull =
    order === 'sorted' ? SORTED_ORDER.length : height(buildFresh(SHUFFLED_ORDER)) + 1;
  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <GitFork aria-hidden="true" />
          same keys · two insertion orders
        </span>
      </div>
      <div className="bst-lab-body">
        <p className="bst-note">
          The keys 10–70, inserted in two different orders. Watch the shape — and the height — that
          results.
        </p>
        <div className="bst-controls" style={{ marginBottom: 10 }}>
          <div className="bst-seg">
            <button className={order === 'sorted' ? 'on' : ''} onClick={() => setOrder('sorted')}>
              insert sorted
            </button>
            <button
              className={order === 'shuffled' ? 'on' : ''}
              onClick={() => setOrder('shuffled')}
            >
              insert shuffled
            </button>
          </div>
          <button className="bst-btn red" onClick={play} disabled={playing}>
            <Play aria-hidden="true" />
            {atEnd ? 'replay' : 'build'}
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
        <div className="bst-foot" style={{ marginBottom: 6 }}>
          order:{' '}
          {seq.map((k, idx) => (
            <span
              key={idx}
              style={{
                color: idx <= i ? 'var(--red)' : 'var(--ink-3)',
                fontWeight: idx === i ? 700 : 400,
              }}
            >
              {k}
              {idx < seq.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </div>
        <TreeSVG
          {...view}
          curId={curId}
          pulse={!atEnd}
          showHeight
          heightLabel={`height ${h}`}
          maxHeightPx={order === 'sorted' ? 400 : 250}
          label={`tree built in ${order} order`}
        />
        <div className="bst-readout" style={{ marginTop: 10 }}>
          <span>
            height{' '}
            <b style={{ color: order === 'sorted' && atEnd ? 'var(--red)' : 'var(--ink)' }}>{h}</b>
          </span>
          <span>
            worst-case search <span className="big">{atEnd ? worstFull : h + 1}</span> compares
          </span>
        </div>
        <div className="bst-cap">
          {order === 'sorted' ? (
            <>
              Each key is bigger than the last, so it always goes right: the tree degenerates into a{' '}
              <span className="hot">straight stick</span> — a linked list in disguise. Searching it
              is back to checking one item at a time.
            </>
          ) : (
            <>
              A mixed order keeps the tree <b>bushy</b>: height stays near log n, and every search
              is a handful of steps. Same data, a fundamentally better shape.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
