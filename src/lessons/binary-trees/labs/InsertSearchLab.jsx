import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import {
  buildFresh,
  bstView,
  searchPath,
  findNode,
  subtreeKeys,
  inorder,
  height,
  INS_POOL,
} from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §04 — build a tree, then search it. Insertion is a search that ends in
// creation: pick a value, watch it walk to the empty slot it belongs in and
// plant itself as a leaf. The `job` walk is user-initiated, so it animates; the
// per-step delay collapses to 0 under reduced motion.
export default function InsertSearchLab() {
  const reduced = usePrefersReducedMotion();
  const [keys, setKeys] = useState([50, 30, 70]);
  const root = useMemo(() => buildFresh(keys), [keys]);
  const view = useMemo(() => bstView(root), [root]);
  const [mode, setMode] = useState('build');
  const [job, setJob] = useState(null);
  const timer = useRef(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!job) return;
    const last = job.path.length - 1;
    if (job.idx < last) {
      timer.current = setTimeout(
        () => setJob((j) => ({ ...j, idx: j.idx + 1 })),
        reduced ? 0 : 540,
      );
      return () => clearTimeout(timer.current);
    }
    if (job.mode === 'build' && !job.committed) {
      timer.current = setTimeout(
        () => {
          setKeys((k) => (k.includes(job.key) ? k : [...k, job.key]));
          setJob((j) => ({ ...j, committed: true }));
        },
        reduced ? 0 : 380,
      );
      return () => clearTimeout(timer.current);
    }
    if (job.mode === 'build' && job.committed) {
      timer.current = setTimeout(() => setJob(null), 650);
      return () => clearTimeout(timer.current);
    }
  }, [job, reduced]);
  const start = (m, key) => {
    if (job) return;
    const { found, path } = searchPath(root, key);
    setJob({ mode: m, key, path, idx: 0, found, committed: false });
  };

  let pathSet = new Set(),
    dimSet = new Set(),
    curId = null,
    foundId = null;
  if (job) {
    if (job.committed) {
      pathSet = new Set([...job.path, job.key]);
      curId = job.key;
    } else {
      pathSet = new Set(job.path.slice(0, job.idx + 1));
      curId = job.path[job.idx];
      for (let k = 0; k < job.idx; k++) {
        const node = findNode(root, job.path[k]);
        const nx = job.path[k + 1];
        if (nx === undefined) break;
        subtreeKeys(nx < node.key ? node.right : node.left, dimSet);
      }
      if (job.mode === 'find' && job.idx === job.path.length - 1 && job.found) foundId = curId;
    }
  }
  const insertable = INS_POOL.filter((v) => !keys.includes(v));
  const present = inorder(root).slice(0, 3);
  const absent = [33, 88].filter((v) => !keys.includes(v));
  const atEnd = job && job.idx === job.path.length - 1;

  return (
    <div className="bst-lab">
      <div className="bst-lab-head">
        <span className="bst-lab-tag">
          <Plus aria-hidden="true" />
          build it, then search it
        </span>
      </div>
      <div className="bst-lab-body">
        <div className="bst-controls" style={{ marginBottom: 8 }}>
          <div className="bst-seg">
            <button
              className={mode === 'build' ? 'on' : ''}
              onClick={() => {
                setMode('build');
                setJob(null);
              }}
            >
              insert
            </button>
            <button
              className={mode === 'find' ? 'on' : ''}
              onClick={() => {
                setMode('find');
                setJob(null);
              }}
            >
              search
            </button>
          </div>
        </div>
        <div className="bst-controls" style={{ marginBottom: 10 }}>
          {mode === 'build' ? (
            <>
              <span className="bst-foot">insert:</span>
              <div className="bst-chiprow">
                {insertable.map((v) => (
                  <button
                    key={v}
                    className="bst-chip"
                    disabled={!!job || keys.length >= 9}
                    onClick={() => start('build', v)}
                  >
                    {v}
                  </button>
                ))}
                {insertable.length === 0 && (
                  <span className="bst-foot" style={{ alignSelf: 'center' }}>
                    — full —
                  </span>
                )}
              </div>
              <button
                className="bst-btn ghost"
                onClick={() => {
                  setKeys([50, 30, 70]);
                  setJob(null);
                }}
              >
                <RotateCcw aria-hidden="true" />
                reset
              </button>
            </>
          ) : (
            <>
              <span className="bst-foot">find:</span>
              <div className="bst-chiprow">
                {[...present, ...absent].map((v) => (
                  <button
                    key={v}
                    className={`bst-chip ${job && job.key === v ? 'on' : ''}`}
                    disabled={!!job && !atEnd}
                    onClick={() => start('find', v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11.5,
            letterSpacing: '.04em',
            color: 'var(--blue-deep)',
            marginBottom: 8,
          }}
        >
          invariant&nbsp;·&nbsp;every left descendant &lt; node &lt; every right descendant
        </div>
        <TreeSVG
          {...view}
          pathSet={pathSet}
          dimSet={dimSet}
          curId={job && !job.committed && !foundId ? curId : job && job.committed ? curId : null}
          foundId={foundId}
          pulse={!!job && !atEnd}
          maxHeightPx={290}
          label="build and search a binary search tree"
        />
        <div className="bst-readout" style={{ marginTop: 10 }}>
          <span>
            nodes <b>{keys.length}</b>
          </span>
          <span>
            height <b>{height(root)}</b>
          </span>
        </div>
        <div className="bst-cap">
          {!job ? (
            mode === 'build' ? (
              <>
                Insertion is just a search that ends in <b>creation</b>. Pick a value and watch it
                walk down to the empty slot it belongs in.
              </>
            ) : (
              <>
                Pick a value to find. Each comparison sends you left or right and{' '}
                <span className="hot">discards the other whole branch</span>.
              </>
            )
          ) : job.committed ? (
            <>
              <b>{job.key}</b> planted as a new leaf — new keys always arrive at the bottom.
            </>
          ) : !atEnd ? (
            <>
              At <b>{curId}</b>: {job.key} is{' '}
              {job.key < curId ? 'smaller → left' : 'larger → right'}, so the{' '}
              {job.key < curId ? 'right' : 'left'} subtree is skipped.
            </>
          ) : job.mode === 'find' ? (
            job.found ? (
              <>
                Found <b>{job.key}</b> in <span className="hot">{job.path.length}</span> step
                {job.path.length > 1 ? 's' : ''}.
              </>
            ) : (
              <>
                <b>{job.key}</b> isn&apos;t here — we fell off at the slot where it would go.
              </>
            )
          ) : (
            <>
              Found the empty slot for <b>{job.key}</b>.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
