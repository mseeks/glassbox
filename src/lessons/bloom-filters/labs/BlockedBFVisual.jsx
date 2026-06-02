import { useState } from 'react';
import { Eye } from 'lucide-react';
import { bloomPositions, fnv1a } from '../engine/index.js';

export function BlockedBFVisual() {
  const LINES = 8; // 8 cache lines
  const BITS_PER_LINE = 8;
  const M = LINES * BITS_PER_LINE;
  const K = 4;
  const [bits] = useState(() => {
    const arr = new Array(M).fill(false);
    // Pre-populate with some density
    ['cache', 'line', 'miss', 'locality', 'random', 'spread', 'focus', 'block'].forEach((w) => {
      const p1 = bloomPositions(w, K, M);
      for (const p of p1) arr[p] = true;
    });
    return arr;
  });
  const [bitsBlocked] = useState(() => {
    const arr = new Array(M).fill(false);
    ['cache', 'line', 'miss', 'locality', 'random', 'spread', 'focus', 'block'].forEach((w) => {
      const blockIdx = fnv1a(w) % LINES;
      const positions = bloomPositions(w + '!', K, BITS_PER_LINE).map(
        (p) => blockIdx * BITS_PER_LINE + p,
      );
      for (const p of positions) arr[p] = true;
    });
    return arr;
  });
  const [query, setQuery] = useState('lookup');
  const [standardHits, setStandardHits] = useState([]);
  const [blockedHits, setBlockedHits] = useState([]);
  const [blockedBlock, setBlockedBlock] = useState(-1);

  async function doQuery(word) {
    setStandardHits([]);
    setBlockedHits([]);
    setBlockedBlock(-1);
    await new Promise((r) => setTimeout(r, 100));

    const stdPositions = bloomPositions(word, K, M);
    const blkIdx = fnv1a(word) % LINES;
    const blkPositions = bloomPositions(word + '!', K, BITS_PER_LINE).map(
      (p) => blkIdx * BITS_PER_LINE + p,
    );

    setBlockedBlock(blkIdx);
    for (let i = 0; i < K; i++) {
      await new Promise((r) => setTimeout(r, 280));
      setStandardHits((prev) => [...prev, stdPositions[i]]);
      setBlockedHits((prev) => [...prev, blkPositions[i]]);
    }
  }

  function lineOf(idx) {
    return Math.floor(idx / BITS_PER_LINE);
  }
  const stdLinesTouched = new Set(standardHits.map(lineOf)).size;
  const blkLinesTouched = new Set(blockedHits.map(lineOf)).size;

  const renderFilter = (filterBits, hits, blockHl) => (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${LINES}, 1fr)`,
        gap: '6px',
        padding: '0.75rem',
        background: 'rgba(10, 10, 15, 0.45)',
        borderRadius: '3px',
      }}
    >
      {Array.from({ length: LINES }).map((_, lineIdx) => {
        const lineHit = hits.some((p) => lineOf(p) === lineIdx);
        const isBlock = lineIdx === blockHl;
        return (
          <div
            key={lineIdx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 6px',
              background: isBlock ? 'rgba(94, 234, 212, 0.08)' : 'transparent',
              borderRadius: '2px',
              border: `1px solid ${lineHit ? 'rgba(251, 113, 133, 0.4)' : isBlock ? 'rgba(94, 234, 212, 0.3)' : 'transparent'}`,
              transition: 'all 240ms ease',
            }}
          >
            <div
              className="bf-mono"
              style={{
                fontSize: '0.62rem',
                color: lineHit ? '#fda4af' : '#a89e8a',
                minWidth: '1.5rem',
                opacity: 0.7,
              }}
            >
              L{lineIdx}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${BITS_PER_LINE}, 1fr)`,
                gap: '3px',
                flex: 1,
              }}
            >
              {Array.from({ length: BITS_PER_LINE }).map((_, j) => {
                const idx = lineIdx * BITS_PER_LINE + j;
                const isHit = hits.includes(idx);
                return (
                  <div
                    key={j}
                    style={{
                      aspectRatio: '1 / 1',
                      background: filterBits[idx] ? '#c4b5fd' : '#1a1a24',
                      border: `1px solid ${isHit ? '#5eead4' : filterBits[idx] ? 'rgba(196, 181, 253, 0.4)' : 'rgba(232, 222, 200, 0.08)'}`,
                      borderRadius: '2px',
                      boxShadow: isHit ? '0 0 8px 2px rgba(94, 234, 212, 0.5)' : 'none',
                      transition: 'all 240ms ease',
                    }}
                  />
                );
              })}
            </div>
            <div
              className="bf-mono"
              style={{
                fontSize: '0.62rem',
                color: lineHit ? '#fda4af' : 'transparent',
                minWidth: '4.5rem',
              }}
            >
              {lineHit && '← cache miss'}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bf-panel" style={{ padding: '1.75rem' }}>
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
        <div>
          <div
            className="bf-ui"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: 'rgba(196, 181, 253, 0.7)',
              textTransform: 'uppercase',
            }}
          >
            Lab 05 · Blocked BF
          </div>
          <div
            className="bf-display"
            style={{ fontSize: '1.5rem', color: '#f5e9d3', marginTop: '0.3rem' }}
          >
            One cache miss, not k
          </div>
        </div>
        <div className="bf-mono bf-mark-muted" style={{ fontSize: '0.75rem' }}>
          L0–L7 simulate cache lines
        </div>
      </div>

      <div className="flex gap-2 my-4 flex-wrap">
        <input
          className="bf-input flex-1"
          aria-label="Word to query the filter"
          placeholder="query word…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') doQuery(query);
          }}
          style={{ minWidth: '10rem' }}
        />
        <button className="bf-btn accent" onClick={() => doQuery(query)} disabled={!query.trim()}>
          <Eye style={{ width: 14, height: 14 }} /> Query both
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span
              className="bf-ui"
              style={{
                fontSize: '0.75rem',
                color: '#fda4af',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Standard BF
            </span>
            <span className="bf-mono bf-mark-muted" style={{ fontSize: '0.72rem' }}>
              {standardHits.length > 0
                ? `${stdLinesTouched} line${stdLinesTouched !== 1 ? 's' : ''} touched`
                : '–'}
            </span>
          </div>
          {renderFilter(bits, standardHits, -1)}
          <div
            className="bf-ui bf-mark-muted mt-2"
            style={{ fontSize: '0.74rem', lineHeight: 1.55 }}
          >
            Each of <span className="bf-mono">k = {K}</span> hashes lands somewhere across{' '}
            <span className="bf-mono">{M}</span> bits. Expected cache lines touched: ~{K}.
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span
              className="bf-ui"
              style={{
                fontSize: '0.75rem',
                color: '#5eead4',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Blocked BF
            </span>
            <span className="bf-mono bf-mark-muted" style={{ fontSize: '0.72rem' }}>
              {blockedHits.length > 0 ? `${blkLinesTouched} line touched` : '–'}
            </span>
          </div>
          {renderFilter(bitsBlocked, blockedHits, blockedBlock)}
          <div
            className="bf-ui bf-mark-muted mt-2"
            style={{ fontSize: '0.74rem', lineHeight: 1.55 }}
          >
            First hash picks a block. All <span className="bf-mono">k = {K}</span> remaining hashes
            land <em className="bf-mark-teal">inside that block</em>. Exactly 1 cache line touched.
          </div>
        </div>
      </div>

      <div
        className="bf-pullquote"
        style={{ fontSize: '1rem', margin: '1.5rem 0 0', padding: '1rem 0 0 1.25rem' }}
      >
        This cost dominates. For any filter bigger than L1 cache, it is the reason most production
        filters since ~2010 are blocked.
      </div>
    </div>
  );
}
