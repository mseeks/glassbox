import { useEffect, useMemo, useState } from 'react';

export function MathLab() {
  const [bitsPerEl, setBitsPerEl] = useState(10);
  const [k, setK] = useState(7);
  const [autoK, setAutoK] = useState(true);

  // Treat n as a normalization (it cancels out in the m/n ratio)
  // Display values shown for n = 1000 example
  const m_n = bitsPerEl;
  const kStar = Math.max(1, Math.round(m_n * Math.LN2));
  const effectiveK = autoK ? kStar : k;
  const fprAtCurrentK = Math.pow(1 - Math.exp(-effectiveK / m_n), effectiveK);
  const fprAtOptimal = Math.pow(0.5, kStar);

  useEffect(() => {
    if (autoK) setK(kStar);
  }, [autoK, kStar]);

  // Generate curve: FPR vs k for given m/n
  const curvePoints = useMemo(() => {
    const points = [];
    const minK = 1,
      maxK = 30;
    for (let kk = minK; kk <= maxK; kk += 0.5) {
      const fpr = Math.pow(1 - Math.exp(-kk / m_n), kk);
      points.push({ k: kk, fpr });
    }
    return points;
  }, [m_n]);

  // SVG layout
  const W = 460,
    H = 220,
    PAD_L = 50,
    PAD_R = 16,
    PAD_T = 20,
    PAD_B = 32;
  const PW = W - PAD_L - PAD_R,
    PH = H - PAD_T - PAD_B;
  const xScale = (kk) => PAD_L + ((kk - 1) / 29) * PW;
  const yScale = (fpr) => {
    const logF = Math.log10(Math.max(1e-10, fpr));
    const clamped = Math.max(-10, Math.min(0, logF));
    return PAD_T + (-clamped / 10) * PH;
  };
  const pathD = curvePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.k).toFixed(2)} ${yScale(p.fpr).toFixed(2)}`)
    .join(' ');

  return (
    <div className="bf-panel" style={{ padding: '2rem 1.75rem' }}>
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
            Lab 02
          </div>
          <div
            className="bf-display"
            style={{ fontSize: '1.85rem', color: 'var(--bf-ink-head)', marginTop: '0.3rem' }}
          >
            The Math Lab
          </div>
        </div>
        <span className="bf-mono bf-mark-muted" style={{ fontSize: '0.78rem' }}>
          FPR ≈ (1 − e<sup>−k/(m/n)</sup>)<sup>k</sup>
        </span>
      </div>
      <div className="bf-body-italic bf-mark-muted mt-2 mb-6" style={{ fontSize: '0.92rem' }}>
        Two knobs, three numbers, and a curve. Drag the bits-per-element to see the trade, and watch
        the optimum k* shift as you go. Two levers, one surface.
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div>
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span
                className="bf-ui bf-mark-muted"
                style={{ fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                bits per element (m/n)
              </span>
              <span className="bf-mono bf-mark-amber" style={{ fontSize: '0.92rem' }}>
                {bitsPerEl.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              step="0.5"
              value={bitsPerEl}
              onChange={(e) => setBitsPerEl(parseFloat(e.target.value))}
              className="bf-slider"
              aria-label="Bits per element (m/n)"
              aria-valuetext={`${bitsPerEl.toFixed(1)} bits per element`}
            />
            <div
              className="flex justify-between bf-mono bf-mark-muted mt-1"
              style={{ fontSize: '0.65rem', opacity: 0.5 }}
            >
              <span>2</span>
              <span>10</span>
              <span>24</span>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex justify-between mb-2 items-center">
              <span
                className="bf-ui bf-mark-muted"
                style={{ fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                hash functions (k)
              </span>
              <div className="flex items-center gap-3">
                <label
                  className="bf-ui flex items-center gap-1.5"
                  style={{ fontSize: '0.72rem', color: 'var(--bf-ink-muted)', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={autoK}
                    onChange={(e) => setAutoK(e.target.checked)}
                    style={{ accentColor: 'var(--bf-violet)', cursor: 'pointer' }}
                  />
                  use k*
                </label>
                <span
                  className="bf-mono"
                  style={{
                    fontSize: '0.92rem',
                    color: autoK ? 'var(--bf-teal-ink)' : 'var(--bf-violet-ink)',
                  }}
                >
                  {effectiveK}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={k}
              onChange={(e) => {
                setK(parseInt(e.target.value));
                setAutoK(false);
              }}
              className="bf-slider"
              disabled={autoK}
              style={{ opacity: autoK ? 0.45 : 1 }}
              aria-label="Number of hash functions (k)"
              aria-valuetext={`${k} hash functions`}
            />
            <div
              className="flex justify-between bf-mono bf-mark-muted mt-1"
              style={{ fontSize: '0.65rem', opacity: 0.5 }}
            >
              <span>1</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>

          {/* Outputs */}
          <div className="bf-panel" style={{ padding: '1rem', background: 'var(--bf-well-soft)' }}>
            <div className="flex justify-between items-baseline mb-3">
              <span
                className="bf-ui bf-mark-muted"
                style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
              >
                false positive rate
              </span>
              <span
                className="bf-display"
                style={{ fontSize: '1.7rem', color: 'var(--bf-violet-ink)', lineHeight: 1 }}
              >
                {(fprAtCurrentK * 100).toFixed(
                  fprAtCurrentK < 0.001 ? 4 : fprAtCurrentK < 0.01 ? 3 : 2,
                )}
                %
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between bf-mono" style={{ fontSize: '0.78rem' }}>
                <span className="bf-mark-muted">optimal k*</span>
                <span className="bf-mark-teal">{kStar}</span>
              </div>
              <div className="flex justify-between bf-mono" style={{ fontSize: '0.78rem' }}>
                <span className="bf-mark-muted">FPR at k*</span>
                <span className="bf-mark-teal">
                  {(fprAtOptimal * 100).toFixed(fprAtOptimal < 0.001 ? 4 : 2)}%
                </span>
              </div>
              <div className="flex justify-between bf-mono" style={{ fontSize: '0.78rem' }}>
                <span className="bf-mark-muted">for n = 1M elements</span>
                <span className="bf-mark-amber">
                  {((m_n * 1e6) / 8 / 1024 / 1024).toFixed(2)} MiB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Curve */}
        <div>
          <div
            className="bf-ui bf-mark-muted mb-2"
            style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            FPR as a function of k
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{
              width: '100%',
              height: 'auto',
              background: 'var(--bf-well-deep)',
              borderRadius: '3px',
              border: '1px solid var(--bf-line-soft)',
            }}
          >
            {/* Grid */}
            {[0, -2, -4, -6, -8, -10].map((p) => {
              const y = PAD_T + (-p / 10) * PH;
              return (
                <g key={p}>
                  <line
                    x1={PAD_L}
                    y1={y}
                    x2={W - PAD_R}
                    y2={y}
                    style={{ stroke: 'var(--bf-line-soft)' }}
                    strokeWidth="0.5"
                  />
                  <text
                    x={PAD_L - 6}
                    y={y + 3}
                    fontSize="9"
                    style={{ fill: 'var(--bf-ink-muted)' }}
                    textAnchor="end"
                    fontFamily="JetBrains Mono"
                  >
                    10
                    <tspan dy="-3" fontSize="7">
                      {p}
                    </tspan>
                  </text>
                </g>
              );
            })}
            {[1, 5, 10, 15, 20, 25, 30].map((kk) => (
              <g key={kk}>
                <line
                  x1={xScale(kk)}
                  y1={PAD_T}
                  x2={xScale(kk)}
                  y2={H - PAD_B}
                  style={{ stroke: 'var(--bf-line-soft)' }}
                  strokeWidth="0.5"
                />
                <text
                  x={xScale(kk)}
                  y={H - PAD_B + 14}
                  fontSize="9"
                  style={{ fill: 'var(--bf-ink-muted)' }}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {kk}
                </text>
              </g>
            ))}
            {/* Curve */}
            <path
              d={pathD}
              style={{ stroke: 'var(--bf-violet)' }}
              strokeWidth="1.75"
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Optimal point */}
            <line
              x1={xScale(kStar)}
              y1={PAD_T}
              x2={xScale(kStar)}
              y2={H - PAD_B}
              style={{ stroke: 'var(--bf-teal-ink)' }}
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.55"
            />
            <circle
              cx={xScale(kStar)}
              cy={yScale(fprAtOptimal)}
              r="4.5"
              style={{ fill: 'var(--bf-teal-ink)', stroke: 'var(--bf-marker-edge)' }}
              strokeWidth="1.5"
            />
            <text
              x={xScale(kStar) + 7}
              y={yScale(fprAtOptimal) - 8}
              fontSize="10"
              style={{ fill: 'var(--bf-teal-ink)' }}
              fontFamily="Inter Tight"
              fontWeight="600"
            >
              k* = {kStar}
            </text>
            {/* Current point */}
            {!autoK && (
              <>
                <circle
                  cx={xScale(effectiveK)}
                  cy={yScale(fprAtCurrentK)}
                  r="4.5"
                  style={{ fill: 'var(--bf-violet)', stroke: 'var(--bf-marker-edge)' }}
                  strokeWidth="1.5"
                />
                <text
                  x={xScale(effectiveK)}
                  y={yScale(fprAtCurrentK) + 18}
                  fontSize="10"
                  style={{ fill: 'var(--bf-violet-ink)' }}
                  fontFamily="Inter Tight"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  k = {effectiveK}
                </text>
              </>
            )}
            {/* Axis labels */}
            <text
              x={W / 2}
              y={H - 4}
              fontSize="10"
              style={{ fill: 'var(--bf-ink-muted)' }}
              textAnchor="middle"
              fontFamily="Inter Tight"
              letterSpacing="0.08em"
            >
              NUMBER OF HASH FUNCTIONS
            </text>
            <text
              x={10}
              y={H / 2}
              fontSize="10"
              style={{ fill: 'var(--bf-ink-muted)' }}
              textAnchor="middle"
              fontFamily="Inter Tight"
              letterSpacing="0.08em"
              transform={`rotate(-90, 12, ${H / 2})`}
            >
              FALSE POSITIVE RATE
            </text>
          </svg>

          {/* Reference table */}
          <div className="mt-4">
            <div
              className="bf-ui bf-mark-muted mb-2"
              style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              For reference
            </div>
            <div className="bf-mono" style={{ fontSize: '0.74rem', lineHeight: 1.7 }}>
              {[
                { fpr: 0.1, mn: 4.79, k: 3 },
                { fpr: 0.01, mn: 9.59, k: 7 },
                { fpr: 0.001, mn: 14.38, k: 10 },
                { fpr: 0.0001, mn: 19.17, k: 13 },
                { fpr: 0.00001, mn: 23.96, k: 17 },
              ].map((r) => (
                <div
                  key={r.fpr}
                  className="flex justify-between"
                  style={{
                    color:
                      Math.abs(r.mn - bitsPerEl) < 0.5
                        ? 'var(--bf-violet-ink)'
                        : 'var(--bf-ink-muted)',
                  }}
                >
                  <span>{(r.fpr * 100).toFixed(r.fpr < 0.001 ? 4 : 2)}% FPR</span>
                  <span>
                    → {r.mn.toFixed(2)} bits/elem · k = {r.k}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
