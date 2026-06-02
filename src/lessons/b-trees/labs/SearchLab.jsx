import { useEffect, useRef, useState } from 'react';
import { Search, RotateCcw, HardDrive } from 'lucide-react';
import { BTree, resetNodeIds } from '../engine/index.js';
import TreeSVG from '../components/TreeSVG.jsx';

// §III — animated descent on a real tree. Search for a key and watch the path
// light up, one page-read per level. The playback timers are user-initiated
// (pressing a key button) so they keep animating; they clean up on unmount.
const SEARCH_KEYS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

export default function SearchLab() {
  const treeRef = useRef(null);
  if (!treeRef.current) {
    resetNodeIds(5000);
    const t = new BTree(5);
    SEARCH_KEYS.forEach((k) => t.insert(k));
    treeRef.current = t;
  }
  const tree = treeRef.current;
  const [path, setPath] = useState([]); // array of {id, cmpKey, hit}
  const [shown, setShown] = useState(0); // how many path steps revealed
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const timers = useRef([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const run = (key) => {
    clearTimers();
    setBusy(true);
    setResult(null);
    setTarget(key);
    const r = tree.search(key);
    setPath(r.path);
    setShown(0);
    r.path.forEach((_, i) => timers.current.push(setTimeout(() => setShown(i + 1), 520 * (i + 1))));
    timers.current.push(
      setTimeout(
        () => {
          setResult(r.found);
          setBusy(false);
        },
        520 * (r.path.length + 1),
      ),
    );
  };
  const reset = () => {
    clearTimers();
    setBusy(false);
    setPath([]);
    setShown(0);
    setTarget(null);
    setResult(null);
  };

  const pathIds = new Set(path.slice(0, shown).map((p) => p.id));
  const cur = shown > 0 ? path[shown - 1] : null;

  return (
    <div className="bt-lab">
      <span className="bt-lab-tab">
        <Search />
        Lab · search
      </span>
      <div className="bt-lab-body">
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 9 }}>
          Search for a key. Watch the path light up, one page-read per level.
        </div>
        <div className="bt-controls" style={{ marginBottom: 4 }}>
          {SEARCH_KEYS.map((k) => (
            <button
              key={k}
              className="bt-keypill"
              disabled={busy}
              onClick={() => run(k)}
              style={
                target === k
                  ? {
                      borderColor: 'var(--blue)',
                      color: 'var(--blue)',
                      background: 'var(--blue-wash)',
                    }
                  : undefined
              }
            >
              {k}
            </button>
          ))}
          <button
            className="bt-keypill"
            disabled={busy}
            onClick={() => run(55)}
            style={{
              width: 'auto',
              padding: '0 10px',
              ...(target === 55 ? { borderColor: 'var(--stamp)', color: 'var(--stamp)' } : {}),
            }}
          >
            55?
          </button>
          <button className="bt-btn bt-btn-ghost" onClick={reset}>
            <RotateCcw />
            Reset
          </button>
        </div>

        <div style={{ minHeight: 200, marginTop: 8 }}>
          <TreeSVG
            root={tree.root}
            maxHeight={210}
            state={{
              pathIds,
              dim: shown > 0,
              cmpId: cur && !cur.hit ? cur.id : null,
              cmpKey: cur ? cur.cmpKey : null,
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <div className="bt-chip bt-chip-blue">
            <HardDrive size={12} />
            pages read: {shown}
          </div>
          {result != null && (
            <div className={`bt-chip ${result ? 'bt-chip-blue' : 'bt-chip-stamp'}`}>
              {result ? `found ${target}` : `${target} is not here`}
            </div>
          )}
        </div>
        <div className="bt-lab-cap">
          {!target
            ? 'Eleven keys, two levels. Every lookup is the same: read the root page, pick the gap, follow it down.'
            : busy
              ? `Comparing within each page to choose the next drawer…`
              : result
                ? `Found in ${shown} page reads. A billion keys would still finish in three or four. That flatness is the whole point.`
                : `Reached a leaf without a match in ${shown} reads, so ${target} simply isn't in the catalog.`}
        </div>
      </div>
    </div>
  );
}
