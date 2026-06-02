import { useState } from 'react';
import { Callout, Code } from '../components/atoms.jsx';

export const FPRMath = () => {
  const [m, setM] = useState(64);
  const [k, setK] = useState(3);
  const [weight, setWeight] = useState(20);

  // Rough approximate FPR for bloom-clock-style false positive:
  // probability that a concurrent clock B with weight w_B dominates A in every position
  // We use the bloom-filter analog: probability that each of k positions A increments is also hit by B
  // FPR ≈ (1 - (1 - 1/m)^(k * w_B))^k for the "B dominates A" event when A is light, B is heavy
  // This is the standard Bloom-filter FPR, which approximates the Bloom clock FP rate for the
  // "concurrent but A ≤ B" event when A's weight is small relative to B's.
  const fpr = (w) => {
    const p = 1 - Math.pow(1 - 1 / m, k * w);
    return Math.pow(p, k);
  };

  const currentFPR = fpr(weight);

  // Build the curve
  const maxWeight = 200;
  const curvePoints = [];
  for (let w = 0; w <= maxWeight; w += 2) {
    curvePoints.push({ w, fpr: fpr(w) });
  }

  // SVG path
  const W = 600,
    H = 220;
  const xScale = (w) => (w / maxWeight) * W;
  const yScale = (f) => H - f * H;
  const path = curvePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(p.w).toFixed(1)},${yScale(p.fpr).toFixed(1)}`)
    .join(' ');

  return (
    <div className="bc-panel-elevated" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="bc-eyebrow" style={{ color: '#f5b942' }}>
          LAB · FALSE POSITIVE CURVE
        </div>
        <div className="bc-italic" style={{ fontSize: 26, color: '#f0e8d2', marginTop: 4 }}>
          The math, made tactile
        </div>
      </div>

      {/* Curve plot */}
      <div
        style={{
          background: 'rgba(15, 19, 38, 0.6)',
          border: '1px solid rgba(45, 52, 88, 0.5)',
          borderRadius: 4,
          padding: '24px 28px',
          marginBottom: 20,
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H + 50}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Grid */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              y1={yScale(f)}
              x2={W}
              y2={yScale(f)}
              stroke="rgba(45, 52, 88, 0.5)"
              strokeDasharray="2 4"
              strokeWidth="1"
            />
          ))}
          {[0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={`v${t}`}
              x1={t * W}
              y1="0"
              x2={t * W}
              y2={H}
              stroke="rgba(45, 52, 88, 0.4)"
              strokeDasharray="2 4"
              strokeWidth="1"
            />
          ))}

          {/* Curve */}
          <path d={path} fill="none" stroke="#f5b942" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`${path} L ${W},${H} L 0,${H} Z`} fill="url(#bcCurveGrad)" opacity="0.25" />
          <defs>
            <linearGradient id="bcCurveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5b942" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f5b942" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Current point */}
          <circle
            cx={xScale(weight)}
            cy={yScale(currentFPR)}
            r="8"
            fill="#fb7185"
            stroke="#0a0e1e"
            strokeWidth="2"
          />
          <circle
            cx={xScale(weight)}
            cy={yScale(currentFPR)}
            r="14"
            fill="none"
            stroke="#fb7185"
            strokeWidth="1"
            opacity="0.4"
          />

          {/* Y axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <text
              key={`yl${f}`}
              x="-8"
              y={yScale(f) + 4}
              fontSize="10"
              fontFamily="JetBrains Mono"
              fill="#5e5747"
              textAnchor="end"
            >
              {f === 0 ? '0' : f === 1 ? '1.0' : f.toFixed(2)}
            </text>
          ))}

          {/* X axis labels */}
          {[0, 50, 100, 150, 200].map((t) => (
            <text
              key={`xl${t}`}
              x={xScale(t)}
              y={H + 16}
              fontSize="10"
              fontFamily="JetBrains Mono"
              fill="#5e5747"
              textAnchor="middle"
            >
              {t}
            </text>
          ))}

          {/* Axis titles */}
          <text
            x={W / 2}
            y={H + 38}
            fontSize="11"
            fontFamily="JetBrains Mono"
            fill="#a89e85"
            textAnchor="middle"
            letterSpacing="0.1em"
          >
            CLOCK WEIGHT (EVENTS)
          </text>
          <text
            x="-50"
            y={H / 2}
            fontSize="11"
            fontFamily="JetBrains Mono"
            fill="#a89e85"
            textAnchor="middle"
            transform={`rotate(-90 -50 ${H / 2})`}
            letterSpacing="0.1em"
          >
            FPR
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="bc-grid-3" style={{ gap: 22 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              className="bc-mono"
              style={{ fontSize: 11, color: '#a89e85', letterSpacing: '0.1em' }}
            >
              SLOTS · m
            </span>
            <span className="bc-italic" style={{ fontSize: 20, color: '#f5b942' }}>
              {m}
            </span>
          </div>
          <input
            type="range"
            min="16"
            max="256"
            step="8"
            value={m}
            onChange={(e) => setM(+e.target.value)}
            className="bc-slider"
            aria-label="Number of slots m"
            aria-valuetext={`${m} slots`}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              className="bc-mono"
              style={{ fontSize: 11, color: '#a89e85', letterSpacing: '0.1em' }}
            >
              HASHES · k
            </span>
            <span className="bc-italic" style={{ fontSize: 20, color: '#f5b942' }}>
              {k}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={k}
            onChange={(e) => setK(+e.target.value)}
            className="bc-slider"
            aria-label="Number of hash functions k"
            aria-valuetext={`${k} hash functions`}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              className="bc-mono"
              style={{ fontSize: 11, color: '#a89e85', letterSpacing: '0.1em' }}
            >
              WEIGHT
            </span>
            <span className="bc-italic" style={{ fontSize: 20, color: '#f5b942' }}>
              {weight}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={weight}
            onChange={(e) => setWeight(+e.target.value)}
            className="bc-slider"
            aria-label="Clock weight (events recorded)"
            aria-valuetext={`${weight} events`}
          />
        </div>
      </div>

      {/* Live readout */}
      <div
        style={{
          marginTop: 24,
          padding: '18px 22px',
          background:
            currentFPR > 0.5
              ? 'rgba(251, 113, 133, 0.06)'
              : currentFPR > 0.1
                ? 'rgba(245, 185, 66, 0.06)'
                : 'rgba(110, 231, 183, 0.06)',
          border: `1px solid ${currentFPR > 0.5 ? 'rgba(251, 113, 133, 0.3)' : currentFPR > 0.1 ? 'rgba(245, 185, 66, 0.3)' : 'rgba(110, 231, 183, 0.3)'}`,
          borderLeft: `4px solid ${currentFPR > 0.5 ? '#fb7185' : currentFPR > 0.1 ? '#f5b942' : '#6ee7b7'}`,
          borderRadius: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div className="bc-eyebrow" style={{ marginBottom: 4 }}>
            FALSE-POSITIVE PROBABILITY
          </div>
          <div
            className="bc-display"
            style={{
              fontSize: 36,
              color: currentFPR > 0.5 ? '#fb7185' : currentFPR > 0.1 ? '#f5b942' : '#6ee7b7',
            }}
          >
            {(currentFPR * 100).toFixed(2)}%
          </div>
        </div>
        <div style={{ fontSize: 14, color: '#c8bfa5', maxWidth: 360 }}>
          {currentFPR > 0.5 &&
            'Saturated. The structure is no longer reliable — most "happens-before" verdicts will be wrong.'}
          {currentFPR > 0.1 &&
            currentFPR <= 0.5 &&
            'Degraded. Verdicts should be treated as soft hints, not load-bearing.'}
          {currentFPR > 0.01 &&
            currentFPR <= 0.1 &&
            'Usable. False positives occur but at a manageable rate.'}
          {currentFPR <= 0.01 && 'Healthy. The clock is operating in its sweet spot.'}
        </div>
      </div>

      <Callout title="The formula" color="#f5b942">
        For each of the k positions A occupies, the chance B has reached it through its own k×w_B
        independent increments is roughly <Code>1 − (1 − 1/m)^(k·w)</Code>. The chance B dominates A
        at <em>all</em> of A's k positions is that raised to the kth. Like a Bloom filter, but on
        counter values instead of bits.
      </Callout>
    </div>
  );
};
