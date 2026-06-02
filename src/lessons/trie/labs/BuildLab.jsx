import { useMemo, useState } from 'react';
import { buildTrie, layoutTrie } from '../engine/index.js';
import TrieMap from '../components/TrieMap.jsx';
import { WORDS, tracePath } from '../components/helpers.js';

const BUILD_ORDER = ['car', 'cat', 'card', 'care', 'cart', 'do', 'dog', 'dot', 'dodge'];

// Add words one at a time and watch the shared prefixes merge. The "letters
// saved" counter widens the moment a new word shares a beginning with one
// already on the map.
export default function BuildLab() {
  const fullRoot = useMemo(() => buildTrie(WORDS), []);
  const data = useMemo(() => layoutTrie(fullRoot), [fullRoot]);
  const [k, setK] = useState(2);
  const added = useMemo(() => BUILD_ORDER.slice(0, k), [k]);
  const present = useMemo(() => {
    const s = new Set(['·root']);
    for (const w of added) {
      for (let i = 1; i <= w.length; i++) s.add(w.slice(0, i));
    }
    return s;
  }, [added]);
  const lastPath = useMemo(
    () => (k > 0 ? new Set(tracePath(fullRoot, added[added.length - 1]).ids) : new Set()),
    [k, added, fullRoot],
  );
  const typed = added.reduce((a, w) => a + w.length, 0);
  const stored = present.size - 1; // edges = nodes-1 (excluding root)
  return (
    <div className="card">
      <div className="lab-head">
        <span className="lab-tag">lab 01 · build</span>
        <span className="lab-title">Watch the prefixes merge</span>
      </div>
      <div className="lab-sub">
        Add words one at a time. Each shares track with whatever came before. New road is laid only
        where a word departs from the known routes.
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <button
          className="btn"
          onClick={() => setK((v) => Math.min(BUILD_ORDER.length, v + 1))}
          disabled={k >= BUILD_ORDER.length}
        >
          + Add "{k < BUILD_ORDER.length ? BUILD_ORDER[k] : '—'}"
        </button>
        <button className="btn sec" onClick={() => setK(0)}>
          Reset
        </button>
        <button className="btn sec" onClick={() => setK(BUILD_ORDER.length)}>
          Add all
        </button>
      </div>
      <div className="chips" style={{ marginBottom: 14 }}>
        {BUILD_ORDER.map((w, i) => (
          <span key={w} className={`chip ${i < k ? 'on' : 'ghost'}`}>
            {w}
          </span>
        ))}
      </div>
      <TrieMap
        data={data}
        pathSet={lastPath}
        presentSet={present}
        dimOthers={false}
        showWords={present}
      />
      <div className="statrow">
        <div className="stat">
          <div className="v">{typed}</div>
          <div className="l">letters typed across {added.length} words</div>
        </div>
        <div className="stat">
          <div className="v">{stored}</div>
          <div className="l">letters actually stored (shared)</div>
        </div>
        <div className="stat">
          <div className="v">{typed - stored >= 0 ? typed - stored : 0}</div>
          <div className="l">letters saved by sharing</div>
        </div>
      </div>
    </div>
  );
}
