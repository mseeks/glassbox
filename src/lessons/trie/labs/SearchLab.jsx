import { useEffect, useMemo, useState } from 'react';
import { buildTrie, layoutTrie } from '../engine/index.js';
import TrieMap from '../components/TrieMap.jsx';
import { WORDS, tracePath } from '../components/helpers.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// Type a query; the rider steps along the path one letter at a time.
// Three outcomes are possible (word, prefix-only, miss) — the difference
// between the first two is exactly why a node carries a "word ends here" mark.
export default function SearchLab() {
  const root = useMemo(() => buildTrie(WORDS), []);
  const data = useMemo(() => layoutTrie(root), [root]);
  const [q, setQ] = useState('car');
  const [step, setStep] = useState(0);
  const reduced = usePrefersReducedMotion();
  const trace = useMemo(() => tracePath(root, q), [root, q]);
  // animate the rider stepping along the path
  useEffect(() => {
    if (!q) {
      setStep(0);
      return;
    }
    const total = trace.ids.length;
    if (reduced) {
      setStep(total);
      return;
    } // reduced motion: jump to the completed end state
    setStep(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setStep(i);
      if (i >= total) clearInterval(iv);
    }, 240);
    return () => clearInterval(iv);
  }, [q, trace.ids.length, reduced]);
  const shownIds = trace.ids.slice(0, Math.max(1, step));
  const pathSet = new Set(shownIds);
  const riderId = shownIds[shownIds.length - 1];
  const riderNode = data.nodes.find((n) => n.id === riderId);
  const rider = riderNode ? { x: riderNode.px, y: riderNode.py } : { x: null, y: null };
  const done = step >= trace.ids.length;
  let vClass = 'prefix',
    vText = null;
  if (done) {
    if (trace.end) {
      vClass = 'found';
      vText = (
        <>
          <b>"{q}" is a word.</b> The route exists and ends at a station.
        </>
      );
    } else if (trace.full) {
      vClass = 'prefix';
      vText = (
        <>
          <b>"{q}" is only a prefix.</b> The route exists, but no station sits here. No word ends at
          this point.
        </>
      );
    } else {
      vClass = 'miss';
      vText = (
        <>
          <b>"{q}" is not stored.</b> The track runs out at "{trace.breakChar}." There is nowhere to
          go.
        </>
      );
    }
  } else {
    vText = <span style={{ color: 'var(--ink-dim)' }}>tracing…</span>;
  }
  return (
    <div className="card">
      <div className="lab-head">
        <span className="lab-tag">lab 02 · trace</span>
        <span className="lab-title">Search is just following the track</span>
      </div>
      <div className="lab-sub">
        Type a query. We follow one letter at a time. Three endings are possible, and the difference
        between two of them is the whole reason a node carries a "word ends here" mark.
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
          className="tinput mono"
          aria-label="Letters to search"
          style={{ maxWidth: 180 }}
          value={q}
          onChange={(e) => setQ(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
          placeholder="type letters…"
          maxLength={7}
        />
        <div className="chips">
          {['car', 'ca', 'cart', 'cab', 'dodge', 'do'].map((w) => (
            <button key={w} className={`chip ${q === w ? 'on' : ''}`} onClick={() => setQ(w)}>
              {w}
            </button>
          ))}
        </div>
      </div>
      <TrieMap data={data} pathSet={pathSet} dimOthers showWords="active" riderProgress={rider} />
      <div className={`verdict ${vClass}`}>
        <span className="dot" />
        <span>{vText}</span>
      </div>
    </div>
  );
}
