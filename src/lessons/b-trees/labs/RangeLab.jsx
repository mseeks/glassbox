import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { MoveHorizontal, Play, RotateCcw, CornerDownRight } from 'lucide-react';
import { BPlus, resetNodeIds } from '../engine/index.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §VI — B+ tree range scan. Pick a range, locate the start leaf, then walk the
// linked-leaf chain. The walk timer is started by the Walk button, so it keeps
// animating; it cleans up on unmount.
const RANGE_KEYS = [10, 20, 30, 40, 50, 60, 70, 80];

export default function RangeLab() {
  const treeRef = useRef(null);
  if (!treeRef.current) {
    resetNodeIds(7000);
    const t = new BPlus(4);
    RANGE_KEYS.forEach((k) => t.insert(k));
    treeRef.current = t;
  }
  const tree = treeRef.current;
  const leaves = useMemo(() => tree.leaves(), [tree]);
  const idxOf = useMemo(() => {
    const m = new Map();
    leaves.forEach((l, i) => m.set(l.id, i));
    return m;
  }, [leaves]);

  const [lo, setLo] = useState(35);
  const [hi, setHi] = useState(75);
  const [running, setRunning] = useState(false);
  const [s, setS] = useState(0);
  const [res, setRes] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const total = res ? res.path.length + res.visited.length : 0;
  useEffect(() => {
    if (!running) return;
    if (s >= total) {
      setRunning(false);
      return;
    }
    timer.current = setTimeout(() => setS((x) => x + 1), 720);
    return () => clearTimeout(timer.current);
  }, [running, s, total]);

  const run = () => {
    clearTimeout(timer.current);
    const r = tree.rangeScan(lo, hi);
    setRes(r);
    setS(0);
    setRunning(true);
  };
  const reset = () => {
    clearTimeout(timer.current);
    setRunning(false);
    setRes(null);
    setS(0);
  };

  const pathShown = res ? Math.min(s, res.path.length) : 0;
  const chainShown = res ? Math.max(0, s - res.path.length) : 0;
  const pathIds = new Set(res ? res.path.slice(0, pathShown) : []);
  const scannedIds = new Set(res ? res.visited.slice(0, chainShown) : []);
  const hitSet = new Set();
  if (res)
    res.visited.slice(0, chainShown).forEach((id) => {
      const lf = leaves[idxOf.get(id)];
      lf.keys.forEach((k) => {
        if (k >= lo && k <= hi) hitSet.add(k);
      });
    });
  const lastScanIdx = chainShown > 0 ? idxOf.get(res.visited[chainShown - 1]) : -1;
  const done = res && s >= total;

  return (
    <div className="bt-lab">
      <span className="bt-lab-tab">
        <MoveHorizontal />
        Lab · range scan
      </span>
      <div className="bt-lab-body">
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 12 }}>
          A B+ tree keeps the real data only in the leaves and threads them into a chain. Pick a
          range. Then watch it locate the start leaf and simply walk the chain to the far end.
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '38px 1fr',
            gap: '6px 10px',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span className="bt-mono" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>
            from
          </span>
          <input
            className="bt-slider"
            type="range"
            min={5}
            max={85}
            step={5}
            value={lo}
            disabled={running}
            onChange={(e) => {
              const v = Math.min(+e.target.value, hi);
              setLo(v);
              reset();
            }}
            aria-label="Range low"
          />
          <span className="bt-mono" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>
            to
          </span>
          <input
            className="bt-slider"
            type="range"
            min={5}
            max={85}
            step={5}
            value={hi}
            disabled={running}
            onChange={(e) => {
              const v = Math.max(+e.target.value, lo);
              setHi(v);
              reset();
            }}
            aria-label="Range high"
          />
        </div>
        <div className="bt-controls" style={{ marginBottom: 12 }}>
          <button className="bt-btn bt-btn-blue" disabled={running} onClick={run}>
            <Play />
            Walk {lo} → {hi}
          </button>
          <button className="bt-btn bt-btn-ghost" onClick={reset}>
            <RotateCcw />
            Reset
          </button>
        </div>

        {/* compact tree: shows the locate step */}
        <div
          className="bt-mono"
          style={{
            fontSize: 10,
            letterSpacing: '.12em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            marginBottom: 2,
          }}
        >
          1 · locate the start leaf
        </div>
        <TreeSVG root={tree.root} compact maxHeight={150} state={{ pathIds, dim: pathShown > 0 }} />

        {/* the linked-leaf chain — the star of this lab */}
        <div
          className="bt-mono"
          style={{
            fontSize: 10,
            letterSpacing: '.12em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            margin: '8px 0 2px',
          }}
        >
          2 · walk the linked leaves
        </div>
        <div className="bt-strip">
          {leaves.map((lf, i) => (
            <Fragment key={lf.id}>
              <div className={`bt-leafcard ${scannedIds.has(lf.id) ? 'scan' : ''}`}>
                {lf.keys.map((k) => (
                  <div key={k} className={`bt-leafkey ${hitSet.has(k) ? 'hit' : ''}`}>
                    {k}
                  </div>
                ))}
              </div>
              {i < leaves.length - 1 && (
                <div className={`bt-leafarrow ${i < lastScanIdx ? 'scan' : ''}`}>
                  <CornerDownRight size={14} style={{ transform: 'rotate(-90deg)' }} />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div className="bt-lab-cap" style={{ minHeight: '3em' }}>
          {!res ? (
            'The leaves hold every key in sorted order, left to right, with each one pointing to the next. No climbing. Reading a range is just a walk along the chain.'
          ) : pathShown < res.path.length ? (
            'Descending the signposts to find the leaf where the range begins…'
          ) : !done ? (
            <>
              Walking the chain, collecting every key in{' '}
              <span className="bt-stampc">
                [{lo}, {hi}]
              </span>{' '}
              as we pass…
            </>
          ) : (
            <>
              Done. <strong>{res.hits.length} keys</strong> returned by touching just{' '}
              <strong>
                {res.visited.length} of {leaves.length} leaves
              </strong>
              . Locate once, then a straight walk. This is the move behind{' '}
              <span className="bt-em">&ldquo;everything between Garcia and Gomez.&rdquo;</span>
            </>
          )}
        </div>
        {done && (
          <div
            className="bt-mono"
            style={{ fontSize: 12.5, color: 'var(--blue)', textAlign: 'center', marginTop: 2 }}
          >
            → [ {res.hits.join(', ')} ]
          </div>
        )}
      </div>
    </div>
  );
}
