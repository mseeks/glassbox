import { useMemo, useState } from 'react';
import { tombFraction, tombScanCost, tombReadLatency } from '../engine/index.js';
import Figure from '../components/Figure.jsx';

// §VII — the tombstone storm. Crank the delete-to-write ratio and watch the
// stratum fill with ∅ markers, the scan cost climb linearly, and the read
// latency climb super-linearly. The bill compaction quietly runs up.
export default function TombLab() {
  const [rate, setRate] = useState(0.25);
  const frac = tombFraction(rate);
  const N = 84,
    tombs = Math.round(N * frac);
  const cells = useMemo(() => {
    const a = Array.from({ length: N }, (_, i) => (i < tombs ? 't' : 'l'));
    // deterministic shuffle (Fisher-Yates with a simple LCG so screenshots are stable)
    for (let i = a.length - 1; i > 0; i--) {
      const j = ((i * 9301 + 49297) % 233280) % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, [tombs]);
  const scan = tombScanCost(frac);
  const lat = tombReadLatency(frac);

  return (
    <Figure cap="lab · the tombstone storm" style={{ padding: '24px 22px 20px' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="tiny">delete-to-write ratio</span>
          <span className="m" style={{ fontSize: 14, color: 'var(--writ)' }}>
            {(rate * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          aria-label="Delete-to-write ratio"
          aria-valuetext={`${(rate * 100).toFixed(0)}% deletes`}
          min="0"
          max="80"
          value={rate * 100}
          onChange={(e) => setRate(e.target.value / 100)}
          style={{ width: '100%' }}
        />
        <div
          style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}
          className="serif"
        >
          <span style={{ fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)' }}>healthy</span>
          <span style={{ fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)' }}>
            queue-like
          </span>
          <span style={{ fontStyle: 'italic', fontSize: 11, color: 'var(--ink-3)' }}>storm</span>
        </div>
      </div>
      <div className="tiny" style={{ marginBottom: 8 }}>
        a stratum at the head of a delete-heavy workload
      </div>
      <div
        style={{
          background: 'var(--lsm-well)',
          border: '1px solid var(--rule-soft)',
          padding: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(21,1fr)',
          gap: 2,
        }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1',
              position: 'relative',
              borderRadius: 1,
              background: c === 't' ? 'var(--char)' : 'var(--s2)',
              border: c === 't' ? '1px solid var(--rule-soft)' : '1px solid var(--lsm-cell-line)',
              boxShadow:
                c === 'l' ? '0 0 5px rgba(215,161,75,0.4)' : 'inset 0 0 4px var(--lsm-cell-shadow)',
            }}
          >
            {c === 't' && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(168,144,103,0.7)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 7,
                }}
              >
                ∅
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }} className="m">
        <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
          <span
            style={{
              display: 'inline-block',
              width: 9,
              height: 9,
              background: 'var(--s2)',
              marginRight: 5,
              verticalAlign: 'middle',
              borderRadius: 1,
            }}
          />
          live
        </span>
        <span style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
          <span
            style={{
              display: 'inline-block',
              width: 9,
              height: 9,
              background: 'var(--char)',
              border: '1px solid var(--rule-soft)',
              marginRight: 5,
              verticalAlign: 'middle',
              borderRadius: 1,
            }}
          />
          tombstone
        </span>
      </div>

      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))',
          gap: 14,
          padding: '13px 15px',
          background: 'var(--paper-3)',
          border: '1px solid var(--rule-soft)',
        }}
      >
        <div>
          <div className="tiny">tombstones</div>
          <div className="d m" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink-3)' }}>
            {tombs}/{N}
          </div>
        </div>
        <div>
          <div className="tiny">keys scanned/read</div>
          <div className="d m" style={{ fontSize: 22, fontWeight: 800, color: 'var(--writ)' }}>
            {scan}
          </div>
        </div>
        <div>
          <div className="tiny">read latency</div>
          <div
            className="d m"
            style={{ fontSize: 22, fontWeight: 800, color: lat > 8 ? 'var(--writ)' : 'var(--ink)' }}
          >
            {lat.toFixed(1)}×
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          fontStyle: 'italic',
          fontFamily: 'Vollkorn',
          fontSize: 14,
          color: 'var(--ink-2)',
        }}
      >
        A tombstone cannot retire until it has met and outlived every older copy of its key, far
        down in the strata. Until then, reads must wade through it. Crank the dial and watch a
        delete-heavy workload bury its own performance.
      </div>
    </Figure>
  );
}
