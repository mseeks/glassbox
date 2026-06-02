import { useCallback, useRef, useState } from 'react';
import Panel from '../components/Panel.jsx';
import Readout from '../components/Readout.jsx';
import { bits32, leadingZeros, murmur3_32 } from '../engine/index.js';

/* LAB 3 · HASH & DEDUP */

export default function HashLab() {
  const [log, setLog] = useState([]); // {word, h, rank, dup}
  const [seen, setSeen] = useState({}); // word -> true
  const [maxRank, setMaxRank] = useState(0);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const add = useCallback(
    (wRaw) => {
      const w = wRaw.trim();
      if (!w) return;
      const h = murmur3_32(w);
      const rank = h === 0 ? 33 : Math.clz32(h) + 1; // leading zeros over all 32 bits, +1
      const dup = !!seen[w];
      setSeen((s) => ({ ...s, [w]: true }));
      if (!dup && rank > maxRank) setMaxRank(rank);
      setLog((L) => [{ word: w, h, rank, dup }, ...L].slice(0, 7));
    },
    [seen, maxRank],
  );

  const current = log[0];
  return (
    <Panel label="HASH BENCH" sub="identity → coin-flips → dedup">
      <div className="ctrls">
        <input
          ref={inputRef}
          type="text"
          placeholder="type a word, press Enter…"
          aria-label="Word to hash"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              add(input);
              setInput('');
            }
          }}
        />
      </div>
      <div className="chips" style={{ marginTop: 10 }}>
        {['alice', 'bob', 'alice', 'carol', 'dave', 'bob'].map((w, i) => (
          <button key={i} className="chip" style={{ cursor: 'pointer' }} onClick={() => add(w)}>
            + {w}
          </button>
        ))}
        <button
          className="chip"
          style={{ cursor: 'pointer', color: 'var(--magenta)', borderColor: 'var(--magenta-dim)' }}
          onClick={() => {
            setLog([]);
            setSeen({});
            setMaxRank(0);
          }}
        >
          reset
        </button>
      </div>

      {current && (
        <div style={{ marginTop: 18 }}>
          <div className="cap" style={{ textAlign: 'left', marginTop: 0, marginBottom: 6 }}>
            <span style={{ color: 'var(--brass-hi)' }}>{current.word}</span> → 32-bit hash · leading
            zeros in <span style={{ color: 'var(--cyan)' }}>cyan</span>
            {current.dup ? (
              <span style={{ color: 'var(--magenta)', marginLeft: 8 }}>
                ● already seen — max unchanged
              </span>
            ) : null}
          </div>
          <div className="bitstr">
            {bits32(current.h)
              .split('')
              .map((c, j) => {
                const lz = leadingZeros(bits32(current.h));
                return (
                  <span key={j} className={j < lz ? 'z' : j === lz ? 'one' : 'rest'}>
                    {c}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      <div className="readgrid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 16 }}>
        <Readout label="Distinct words" value={Object.keys(seen).length} tone="iv" />
        <Readout label="Adds (with dupes)" value={log.length ? '≥' + log.length : 0} tone="br" />
        <Readout label="Max rank (lz+1)" value={maxRank} tone="cy" />
      </div>
      <div className="cap">
        Add <span style={{ color: 'var(--brass-hi)' }}>alice</span> twice: identical bits, identical
        run, no movement. A repeat can never raise the maximum — so the structure counts{' '}
        <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>distinct</em> things for free.
      </div>
    </Panel>
  );
}
