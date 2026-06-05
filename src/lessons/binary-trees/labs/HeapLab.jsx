import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Layers } from 'lucide-react';
import { heapPush, heapView, HEAP_INIT } from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §08 — one shape, two bodies. A min-heap keeps the smallest on top and, because
// it is a complete tree, needs no pointers — it lives in a flat array. Push a
// value and watch it sift up. The sift steps come from the engine's heapPush;
// the walk is user-initiated, so the per-step delay only collapses under
// reduced motion.
export default function HeapLab() {
  const reduced = usePrefersReducedMotion();
  const [arr, setArr] = useState(HEAP_INIT);
  const [sel, setSel] = useState(null);
  const [job, setJob] = useState(null); // sift-up animation
  const timer = useRef(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!job) return;
    if (job.t < job.steps.length - 1) {
      timer.current = setTimeout(() => setJob((j) => ({ ...j, t: j.t + 1 })), reduced ? 0 : 520);
      return () => clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setArr(job.steps[job.steps.length - 1].a);
      setJob(null);
    }, 600);
    return () => clearTimeout(timer.current);
  }, [job, reduced]);
  const liveArr = job ? job.steps[job.t].a : arr;
  const moving = job ? job.steps[job.t].i : null;
  // `liveArr` is a stable array reference (the `arr` state or a recorded sift
  // frame), so depending on it directly is both correct and statically checkable.
  const view = useMemo(() => heapView(liveArr), [liveArr]);
  const push = (v) => {
    if (job) return;
    setSel(null);
    const { steps } = heapPush(arr, v);
    setJob({ v, steps, t: 0 });
  };
  const pool = [1, 6, 8]
    .filter((v) => !arr.includes(v))
    .concat(arr.length < 9 ? [1, 6, 11].filter((v) => !arr.includes(v)) : []);
  const chips = [...new Set(pool)].slice(0, 4);
  const pathSet = sel != null ? new Set([sel]) : new Set();
  const left = sel != null ? 2 * sel + 1 : null;
  const right = sel != null ? 2 * sel + 2 : null;
  const childInfo =
    sel != null
      ? left >= liveArr.length
        ? 'no children — a leaf'
        : `children at ${left}${right < liveArr.length ? ', ' + right : ''}`
      : '';
  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <Layers aria-hidden="true" />
          one shape, two bodies
        </span>
      </div>
      <div className="bst-lab-body">
        <p className="bst-note">
          A heap keeps the smallest item on top (every parent ≤ its children). Because it&apos;s a
          complete tree, it needs no pointers — it lives in a plain array. Tap a node or a cell; the
          two views are the same structure.
        </p>
        <div className="bst-controls" style={{ marginBottom: 6 }}>
          <span className="bst-foot">push:</span>
          <div className="bst-chiprow">
            {chips.map((v) => (
              <button
                key={v}
                className="bst-chip"
                disabled={!!job || arr.length >= 9}
                onClick={() => push(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            className="bst-btn ghost"
            onClick={() => {
              setArr(HEAP_INIT);
              setSel(null);
              setJob(null);
            }}
          >
            <RotateCcw aria-hidden="true" />
            reset
          </button>
        </div>
        <TreeSVG
          {...view}
          pathSet={pathSet}
          curId={moving}
          pulse={!!job}
          onNode={job ? undefined : (id) => setSel(id)}
          maxHeightPx={230}
          label="a min-heap drawn as a tree"
        />
        <div
          className="bst-foot"
          style={{ margin: '14px 0 18px', display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <span>array&nbsp;·&nbsp;index i → children 2i+1, 2i+2 · parent ⌊(i−1)/2⌋</span>
        </div>
        <div className="bst-arr" style={{ marginTop: 2 }}>
          {liveArr.map((v, idx) => (
            <div
              key={idx}
              className={`bst-acell ${moving === idx ? 'cur' : sel === idx ? 'lit' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`cell ${idx} = ${v}`}
              aria-pressed={sel === idx}
              onClick={() => {
                if (!job) setSel(idx);
              }}
              onKeyDown={(e) => {
                if (!job && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setSel(idx);
                }
              }}
              style={{ cursor: job ? 'default' : 'pointer' }}
            >
              <span className="bst-aidx">{idx}</span>
              {v}
            </div>
          ))}
        </div>
        <div className="bst-cap">
          {job ? (
            <>
              Pushed <b>{job.v}</b> into the last slot; now it <span className="hot">sifts up</span>{' '}
              — swapping with its parent while it&apos;s smaller — until the heap property holds
              again.
            </>
          ) : sel != null ? (
            <>
              Cell <b>{sel}</b> holds <b>{liveArr[sel]}</b>.{' '}
              {sel > 0 ? (
                <>
                  Its parent is at index <b>{(sel - 1) >> 1}</b>;{' '}
                </>
              ) : (
                <>It&apos;s the root; </>
              )}
              {childInfo}. No pointers — just arithmetic.
            </>
          ) : (
            <>
              Different invariant from a search tree (parent ≤ children, not left &lt; right), so it
              doesn&apos;t sort — it gives instant access to the minimum. That&apos;s a{' '}
              <b>priority queue</b>. The flat array is contiguous and cache-friendly.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
