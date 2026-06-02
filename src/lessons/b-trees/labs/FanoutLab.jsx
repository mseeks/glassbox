import { useState } from 'react';
import { Layers } from 'lucide-react';
import { FANOUTS, levelsFor } from '../engine/index.js';

// §I — fan-out lab. Drag the branching factor and watch a billion keys
// collapse from ~30 levels (binary) to three or four (a real B-tree node).
export default function FanoutLab() {
  const [idx, setIdx] = useState(0);
  const f = FANOUTS[idx];
  const levels = levelsFor(f);
  const keysPerPage = f - 1;

  // drawer fill viz
  const cw = 17,
    ch = 30,
    pad = 6;
  const shown = Math.min(f, 13);
  const capped = f > 13;
  const drawerW = shown * cw + pad * 2;

  // depth bars
  const barCount = Math.min(levels, 30);
  const gap = 2.2;
  const totalBarH = 116;
  const barH = Math.max(2.4, (totalBarH - gap * (barCount - 1)) / barCount);

  const caption =
    f === 2
      ? 'A binary tree. Roughly thirty levels for a billion keys, and every single page fetch is squandered on one lonely key.'
      : f >= 256
        ? 'A real B-tree node. A billion keys now sit just three or four levels down: a handful of disk trips, total.'
        : `Each page now holds ${keysPerPage} keys and fans out ${f} ways. The tree flattens fast.`;

  return (
    <div className="bt-lab">
      <span className="bt-lab-tab">
        <Layers />
        Lab · fan-out
      </span>
      <div className="bt-lab-body">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 6,
          }}
        >
          <span className="bt-mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            keys per page
          </span>
          <span className="bt-mono" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            fan&#8209;out = {f}&times;
          </span>
        </div>
        <input
          className="bt-slider"
          type="range"
          min={0}
          max={FANOUTS.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setIdx(+e.target.value)}
          aria-label="Fan-out"
        />

        <div className="bt-readgrid" style={{ marginTop: 16 }}>
          <div className="bt-read">
            <div className="bt-read-n">{keysPerPage}</div>
            <div className="bt-read-l">keys / page</div>
          </div>
          <div className="bt-read">
            <div className="bt-read-n" style={{ color: 'var(--ink)' }}>
              {levels}
            </div>
            <div className="bt-read-l">levels (= seeks)</div>
          </div>
          <div className="bt-read">
            <div
              className="bt-read-n"
              style={{ color: levels <= 4 ? 'var(--blue)' : 'var(--ink)' }}
            >
              {levels <= 4 ? '≈4' : levels >= 28 ? '≈30' : levels}
            </div>
            <div className="bt-read-l">disk trips / lookup</div>
          </div>
        </div>

        <div
          className="bt-grid-2"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginTop: 20,
            alignItems: 'center',
          }}
        >
          {/* one page filling up */}
          <div>
            <div
              className="bt-mono"
              style={{
                fontSize: 10.5,
                letterSpacing: '.1em',
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              one page
            </div>
            <svg
              viewBox={`0 0 ${drawerW + 4} ${ch + 4}`}
              width="100%"
              style={{ maxHeight: 56, display: 'block' }}
            >
              <rect
                x="1"
                y="1"
                width={drawerW}
                height={ch}
                rx="5"
                fill="var(--card)"
                stroke="var(--blue)"
                strokeWidth="1.6"
                style={{ transition: 'all .3s' }}
              />
              {Array.from({ length: shown }).map((_, j) => (
                <g key={j}>
                  {j > 0 && (
                    <line
                      x1={pad + j * cw}
                      y1="5"
                      x2={pad + j * cw}
                      y2={ch - 5}
                      stroke="var(--rule)"
                      strokeWidth="1"
                    />
                  )}
                  <text
                    x={pad + j * cw + cw / 2}
                    y={ch / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="var(--font-mono)"
                    fontSize="9.5"
                    fill="var(--ink-2)"
                  >
                    {capped && j === shown - 1 ? '…' : '·'}
                  </text>
                </g>
              ))}
            </svg>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 8, fontStyle: 'italic' }}>
              {capped ? `${keysPerPage} keys, ${f} pointers` : `${keysPerPage} keys, ${f} pointers`}
            </div>
          </div>
          {/* depth */}
          <div>
            <div
              className="bt-mono"
              style={{
                fontSize: 10.5,
                letterSpacing: '.1em',
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              tree depth
            </div>
            <svg
              viewBox={`0 0 120 ${totalBarH}`}
              width="100%"
              style={{ maxHeight: 120, display: 'block' }}
            >
              {Array.from({ length: barCount }).map((_, i) => {
                const w = 26 + (i / Math.max(1, barCount - 1)) * 86;
                const y = i * (barH + gap);
                return (
                  <rect
                    key={i}
                    x={(120 - w) / 2}
                    y={y}
                    width={w}
                    height={barH}
                    rx={Math.min(2, barH / 2)}
                    fill={levels <= 4 ? 'var(--blue)' : 'var(--oak-2)'}
                    style={{ transition: 'all .35s ease' }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
        <div className="bt-lab-cap">{caption}</div>
      </div>
    </div>
  );
}
