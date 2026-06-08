import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function ScalableVisual() {
  const [items, setItems] = useState(8);
  const INITIAL_CAP = 8;
  const GROWTH = 2;
  const FPR_RATIO = 0.5;
  const BASE_FPR = 0.01;

  // Determine which filter each item goes into and per-filter stats
  const filters = useMemo(() => {
    const fs = [];
    let remaining = items;
    let idx = 0;
    while (remaining > 0) {
      const cap = INITIAL_CAP * Math.pow(GROWTH, idx);
      const fprTarget = BASE_FPR * Math.pow(FPR_RATIO, idx);
      const stored = Math.min(remaining, cap);
      const load = stored / cap;
      fs.push({ idx, cap, fprTarget, stored, load });
      remaining -= stored;
      idx += 1;
      if (idx > 10) break;
    }
    return fs;
  }, [items]);

  // Total FPR as geometric series: sum p0 * r^i ≤ p0 / (1-r) bounded
  const totalFPR = filters.reduce((acc, f) => acc + f.fprTarget * (f.stored / f.cap), 0);

  return (
    <div className="bf-panel" style={{ padding: '1.75rem' }}>
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
        <div>
          <div
            className="bf-ui"
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: 'var(--bf-violet-eyebrow)',
              textTransform: 'uppercase',
            }}
          >
            Lab 06 · Scalable BF
          </div>
          <div
            className="bf-display"
            style={{ fontSize: '1.5rem', color: 'var(--bf-ink-head)', marginTop: '0.3rem' }}
          >
            A chain that grows
          </div>
        </div>
        <div className="bf-mono bf-mark-muted" style={{ fontSize: '0.75rem' }}>
          base FPR = {(BASE_FPR * 100).toFixed(1)}% · ratio r = {FPR_RATIO}
        </div>
      </div>

      <div className="my-4">
        <div className="flex justify-between mb-2">
          <span
            className="bf-ui bf-mark-muted"
            style={{ fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            items inserted
          </span>
          <span className="bf-mono bf-mark-amber" style={{ fontSize: '0.92rem' }}>
            {items}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="200"
          step="1"
          value={items}
          onChange={(e) => setItems(parseInt(e.target.value))}
          className="bf-slider"
          aria-label="Items inserted into the scalable filter chain"
          aria-valuetext={`${items} items inserted`}
        />
      </div>

      <div
        className="flex gap-3 items-stretch overflow-x-auto pb-2"
        style={{ paddingTop: '0.5rem' }}
      >
        {filters.map((f, i) => (
          <React.Fragment key={f.idx}>
            <div
              style={{
                flex: '0 0 auto',
                minWidth: '110px',
                maxWidth: '180px',
                padding: '0.85rem 0.85rem 0.7rem',
                background: f.load > 0.95 ? 'rgba(251, 113, 133, 0.08)' : 'var(--bf-card)',
                border: `1px solid ${f.load > 0.95 ? 'rgba(251, 113, 133, 0.3)' : 'var(--bf-line)'}`,
                borderRadius: '3px',
              }}
            >
              <div
                className="bf-mono bf-mark-muted mb-1"
                style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                Filter {f.idx}
              </div>
              <div
                className="bf-display"
                style={{ fontSize: '1.15rem', color: 'var(--bf-violet-ink)', lineHeight: 1 }}
              >
                {(f.fprTarget * 100).toFixed(f.fprTarget < 0.01 ? 3 : 2)}%
                <span
                  className="bf-ui bf-mark-muted"
                  style={{ fontSize: '0.7rem', marginLeft: '0.3em' }}
                >
                  FPR
                </span>
              </div>
              {/* Fill bar */}
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'var(--bf-line)',
                  borderRadius: '2px',
                  marginTop: '0.75rem',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${f.load * 100}%`,
                    height: '100%',
                    background: f.load > 0.95 ? 'var(--bf-rose)' : 'var(--bf-violet)',
                    transition: 'width 280ms ease',
                  }}
                />
              </div>
              <div
                className="flex justify-between bf-mono bf-mark-muted mt-1"
                style={{ fontSize: '0.65rem', opacity: 0.85 }}
              >
                <span>
                  {f.stored} / {f.cap}
                </span>
                <span>{(f.load * 100).toFixed(0)}%</span>
              </div>
            </div>
            {i < filters.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--bf-line-3)' }}>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <div
          className="bf-panel"
          style={{ padding: '0.7rem 0.9rem', background: 'var(--bf-well-soft)' }}
        >
          <div
            className="bf-ui bf-mark-muted"
            style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            chain length
          </div>
          <div
            className="bf-display mt-1"
            style={{ fontSize: '1.25rem', color: 'var(--bf-violet-ink)' }}
          >
            {filters.length}
          </div>
        </div>
        <div
          className="bf-panel"
          style={{ padding: '0.7rem 0.9rem', background: 'var(--bf-well-soft)' }}
        >
          <div
            className="bf-ui bf-mark-muted"
            style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            combined FPR (bound)
          </div>
          <div
            className="bf-display mt-1"
            style={{ fontSize: '1.25rem', color: 'var(--bf-violet-ink)' }}
          >
            {(totalFPR * 100).toFixed(3)}%
          </div>
          <div className="bf-mono bf-mark-muted mt-0.5" style={{ fontSize: '0.65rem' }}>
            ≤ p₀ / (1−r) = {((BASE_FPR / (1 - FPR_RATIO)) * 100).toFixed(2)}%
          </div>
        </div>
        <div
          className="bf-panel"
          style={{ padding: '0.7rem 0.9rem', background: 'var(--bf-well-soft)' }}
        >
          <div
            className="bf-ui bf-mark-muted"
            style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            query cost
          </div>
          <div
            className="bf-display mt-1"
            style={{ fontSize: '1.25rem', color: 'var(--bf-violet-ink)' }}
          >
            {filters.length} filters
          </div>
          <div className="bf-mono bf-mark-muted mt-0.5" style={{ fontSize: '0.65rem' }}>
            checked on every query
          </div>
        </div>
      </div>

      <div className="bf-ui bf-mark-muted mt-4" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
        Each new filter in the chain is sized for more items but tighter FPR (the ratio{' '}
        <span className="bf-mono">r</span> shrinks it geometrically). The combined FPR converges to
        a finite bound, no matter how many items you eventually insert. There is a cost. Every query
        touches every filter in the chain.
      </div>
    </div>
  );
}
