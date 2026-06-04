import { useMemo, useState } from 'react';
import { curseStats } from '../engine/index.js';
import { C } from '../components/helpers.js';

/* ── §VI · the curse of dimensionality — where pruning dies (honesty) ── */
export default function CurseLab() {
  const [D, setD] = useState(2);
  const s = useMemo(() => curseStats(D), [D]);
  const BINS = s.hist.length;
  const barW = 100 / BINS;
  const meanX = (1 / s.AX) * 100;
  const prunedPct = Math.max(0, s.pruned * 100);
  const compsPct = Math.max(4, (s.avg / s.N) * 100);

  return (
    <div className="vp-plate">
      <div className="vp-plabel">
        <span className="dot" /> distribution of pairwise distances
      </div>

      <svg
        viewBox="0 0 100 46"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: 150,
          display: 'block',
          background: 'var(--vp-scope-face)',
          border: '1px solid var(--edge-soft)',
          borderRadius: 2,
        }}
        role="img"
        aria-label="Histogram of pairwise distances relative to their average"
      >
        {s.hist.map((h, b) => {
          const ht = (h / s.hmax) * 38;
          return (
            <rect
              key={b}
              x={b * barW + 0.3}
              y={42 - ht}
              width={barW - 0.6}
              height={ht}
              opacity="0.85"
              style={{ fill: C.ping }}
            />
          );
        })}
        <line
          x1={meanX}
          y1="3"
          x2={meanX}
          y2="42"
          strokeWidth="0.4"
          strokeDasharray="1 1"
          vectorEffect="non-scaling-stroke"
          style={{ stroke: C.bone3 }}
        />
        <line
          x1="0"
          y1="42"
          x2="100"
          y2="42"
          stroke="var(--edge)"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 6,
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--bone-3)',
          letterSpacing: '.04em',
        }}
      >
        <span>0</span>
        <span style={{ color: 'var(--bone-2)' }}>← distance relative to the average →</span>
        <span>2×</span>
      </div>

      <div className="vp-slider-row" style={{ marginTop: 18 }}>
        <label>Dimensions</label>
        <input
          className="vp-range"
          type="range"
          min="1"
          max="50"
          step="1"
          value={D}
          onChange={(e) => setD(Number(e.target.value))}
          aria-label="Dimensions"
        />
        <span
          className="vp-mono"
          style={{ color: 'var(--ping)', fontSize: 15, width: 34, textAlign: 'right' }}
        >
          {D}
        </span>
      </div>

      <div className="vp-stat">
        <div className="vp-statcell">
          <div className="k">Spread (std ÷ mean)</div>
          <div className="v ping">{s.cv.toFixed(2)}</div>
        </div>
        <div className="vp-statcell">
          <div className="k">Contacts pruned / query</div>
          <div
            className="v"
            style={{
              color:
                prunedPct > 40 ? 'var(--ping)' : prunedPct > 10 ? 'var(--amber)' : 'var(--coral)',
            }}
          >
            {prunedPct.toFixed(0)}
            <span className="u">%</span>
          </div>
        </div>
      </div>

      <div className="vp-cmp">
        <div className="vp-cmprow">
          <span className="lbl">VP tree</span>
          <div className="track">
            <div
              className="fill"
              style={{
                width: compsPct + '%',
                background: compsPct > 90 ? 'var(--coral-fill)' : 'var(--ping)',
              }}
            />
          </div>
          <span className="num">{s.avg.toFixed(0)}</span>
        </div>
        <div className="vp-cmprow">
          <span className="lbl">Brute force</span>
          <div className="track">
            <div className="fill" style={{ width: '100%', background: 'var(--coral-fill)' }} />
          </div>
          <span className="num">{s.N}</span>
        </div>
      </div>

      <div className="vp-caption">
        In one dimension, distances vary wildly (spread ≈ 0.71) and the tree prunes almost
        everything. Drag toward higher dimensions and watch the histogram collapse into a spike: in
        high-dimensional space, <em>every</em> pair of points is nearly the same distance apart.
        When the spread vanishes, every query straddles every shell. The triangle inequality can no
        longer rule anything out, and the search degrades to measuring all {s.N} contacts. That is
        the <strong>curse of dimensionality</strong>. It is why exact trees give way to approximate
        methods on the high-dimensional embeddings used in modern search.
      </div>
    </div>
  );
}
