import { useMemo, useState } from 'react';
import { buildTrie, layoutTrie } from '../engine/index.js';
import TrieMap from '../components/TrieMap.jsx';
import { WORDS, tracePath, subtreeIds, completionsOf } from '../components/helpers.js';

// Travel to a prefix; everything downstream of you is a word that starts
// with it. Autocomplete becomes a short walk plus "read off everything
// downstream" — the single move a hash table cannot do.
export default function PrefixLab() {
  const root = useMemo(() => buildTrie(WORDS), []);
  const data = useMemo(() => layoutTrie(root), [root]);
  const [p, setP] = useState('car');
  const trace = useMemo(() => tracePath(root, p), [root, p]);
  const sub = useMemo(
    () => (p && trace.full ? subtreeIds(data.nodes, p) : new Set()),
    [p, trace, data],
  );
  const routeIn = new Set(trace.ids);
  const comps = useMemo(() => (p ? completionsOf(root, p) : []), [root, p]);
  const valid = p && trace.full;
  return (
    <div className="card">
      <div className="lab-head">
        <span className="lab-tag">lab 03 · autocomplete</span>
        <span className="lab-title">Every word under one roof</span>
      </div>
      <div className="lab-sub">
        Travel to a prefix. Then look down. <em>Everything downstream of you</em> is a word that
        starts with that prefix, sitting in the region below the node you stopped on, and this one
        move, "give me the region below here," is the thing a hash table can never do.
      </div>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <input
          aria-label="Prefix to search"
          className="tinput mono"
          style={{ maxWidth: 180 }}
          value={p}
          onChange={(e) => setP(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
          placeholder="type a prefix…"
          maxLength={7}
        />
        <div className="chips">
          {['ca', 'car', 'do', 'd', 'z'].map((w) => (
            <button key={w} className={`chip ${p === w ? 'on' : ''}`} onClick={() => setP(w)}>
              {w || '∅'}
            </button>
          ))}
        </div>
      </div>
      <TrieMap data={data} pathSet={routeIn} subtreeSet={sub} dimOthers showWords={sub} />
      <div className="complist">
        {valid && comps.length > 0 ? (
          comps.map((c, i) => (
            <span key={c} className="comp" style={{ animationDelay: `${i * 0.05}s` }}>
              <span className="pre">{p}</span>
              {c.slice(p.length)}
            </span>
          ))
        ) : (
          <span style={{ color: 'var(--ink-dim)', fontSize: 14 }}>
            {p ? `no words start with "${p}"` : 'type a prefix to see completions'}
          </span>
        )}
      </div>
    </div>
  );
}
