import { useMemo, useState } from 'react';
import { KB, MB, GB, TB } from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// Find Apollo in your phone. The whole frame is a modern phone's memory.
// Apollo's entire 76 KB is one true-to-scale speck. Magnify toward it and
// feel five orders of magnitude. (Renamed from "Ocean" so it doesn't shadow
// the §04 section also called Ocean.)
const APOLLO_B = 76 * KB;
const PHONE_B = 8 * GB;
const RATIO = PHONE_B / APOLLO_B; // ~110,000
const SIDE = Math.sqrt(RATIO); // ~332 (linear zoom to fill frame)
const LADDER = [
  { label: 'Apollo · 76 KB', mult: 1, hue: 'amber' },
  { label: 'C64 · 64 KB', mult: (64 * KB) / APOLLO_B, hue: 'dim' },
  { label: 'CD-ROM · 650 MB', mult: (650 * MB) / APOLLO_B, hue: 'dim' },
  { label: 'Phone · 8 GB', mult: RATIO, hue: 'steel' },
  { label: 'AI server · 2 TB', mult: (2 * TB) / APOLLO_B, hue: 'steel' },
];

export default function ApolloSpeck() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0); // 0..1 slider
  const M = Math.pow(SIDE, t); // 1 → ~332
  const ocean = useMemo(() => {
    const out = [];
    let s = 42;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 460; i++) {
      out.push({ x: rnd() * 100, y: rnd() * 100, r: 0.5 + rnd() * 0.7, on: rnd() < 0.4 });
    }
    return out;
  }, []);
  const speckSide = 100 / SIDE; // true speck side in viewBox units
  const narr =
    M < 4
      ? "Your phone's entire memory. Apollo's 76 KB is the bright speck at the centre. Can you even see it?"
      : M < 30
        ? 'Diving in. That speck is the whole Apollo Guidance Computer.'
        : M < 150
          ? 'Closer. Everything around it is memory your phone simply has to spare.'
          : 'Found it. This single ring is all 76 KB that guided humans to the Moon, and your phone holds about 110,000 of them.';
  return (
    <div className="lab">
      <div className="lab-tag">Lab · find Apollo</div>
      <p className="lab-note">
        This square is one modern phone's working memory. Somewhere inside, drawn to true scale,
        sits Apollo's
        <em className="term"> entire</em> memory, all 76 KB of it. Magnify, and go find it.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: 'min(82vw,400px)',
            aspectRatio: '1',
            background: 'radial-gradient(circle at 50% 50%, #0d1424, #070a12)',
            border: '1px solid var(--line2)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: 'block' }}>
            <g transform={`translate(50 50) scale(${M}) translate(-50 -50)`}>
              {ocean.map((o, i) => (
                <circle
                  key={i}
                  cx={o.x}
                  cy={o.y}
                  r={o.r}
                  fill="none"
                  stroke={o.on ? 'rgba(246,181,69,.5)' : '#2a3756'}
                  strokeWidth={0.18}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {/* Apollo speck, true to scale, at centre */}
              <g>
                <line
                  x1={50 - speckSide}
                  y1={50}
                  x2={50 + speckSide}
                  y2={50}
                  stroke="var(--steel-dim)"
                  strokeWidth="0.4"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={50}
                  y1={50 - speckSide}
                  x2={50}
                  y2={50 + speckSide}
                  stroke="var(--steel-dim)"
                  strokeWidth="0.4"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={speckSide * 0.5}
                  fill="rgba(255,211,132,.18)"
                  stroke="var(--amber-hi)"
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(246,181,69,.9))' }}
                >
                  {M < 6 && !reduced && (
                    <animate
                      attributeName="r"
                      values={`${speckSide * 0.5};${speckSide * 0.9};${speckSide * 0.5}`}
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
              </g>
            </g>
          </svg>
          <div
            className="readout"
            style={{
              position: 'absolute',
              top: 10,
              left: 12,
              fontSize: 12,
              color: 'var(--amber-hi)',
            }}
          >
            {M < 10 ? M.toFixed(1) : Math.round(M)}× magnified
          </div>
        </div>
      </div>
      {/* slider */}
      <div style={{ margin: '16px 0 4px' }}>
        <input
          type="range"
          min={0}
          max={1000}
          value={t * 1000}
          onChange={(e) => setT(e.target.value / 1000)}
          aria-label="Magnification level"
          aria-valuetext={`${M < 10 ? M.toFixed(1) : Math.round(M)}× magnified`}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>
            your phone (1×)
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>
            Apollo ({Math.round(SIDE)}×)
          </span>
        </div>
      </div>
      <div
        style={{
          minHeight: 54,
          marginTop: 8,
          fontSize: 14.5,
          color: 'var(--dim)',
          lineHeight: 1.55,
        }}
      >
        {narr}
      </div>

      {/* static order-of-magnitude ladder */}
      <div style={{ marginTop: 6, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        <div
          className="mono"
          style={{ fontSize: 10, color: 'var(--faint)', letterSpacing: '.16em', marginBottom: 8 }}
        >
          SIZED AGAINST APOLLO'S 76 KB
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {LADDER.map((l, i) => {
            const m = l.mult;
            const ms =
              m < 1
                ? m.toFixed(2) + '×'
                : m < 10000
                  ? Math.round(m).toLocaleString() + '×'
                  : m < 1e6
                    ? (m / 1000).toFixed(0) + 'k×'
                    : (m / 1e6).toFixed(0) + 'M×';
            return (
              <span
                key={i}
                className="pill"
                style={{
                  borderColor:
                    l.hue === 'amber'
                      ? 'var(--amber-deep)'
                      : l.hue === 'steel'
                        ? 'var(--steel-dim)'
                        : 'var(--line2)',
                  color:
                    l.hue === 'amber'
                      ? 'var(--amber-hi)'
                      : l.hue === 'steel'
                        ? 'var(--steel)'
                        : 'var(--dim)',
                }}
              >
                {l.label} · {ms}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
