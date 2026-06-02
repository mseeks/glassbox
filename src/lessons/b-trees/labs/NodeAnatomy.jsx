import { useState } from 'react';
import { Boxes } from 'lucide-react';

// §II — explorable node anatomy. Three keys carve the universe into four
// ranges; tap a gap to light up the child pointer it owns.
export default function NodeAnatomy() {
  const [sel, setSel] = useState(null);
  const keys = [17, 42, 88];
  const ranges = ['below 17', 'between 17 and 42', 'between 42 and 88', 'above 88'];
  const cw = 54,
    ch = 44,
    pad = 10,
    W = keys.length * cw + pad * 2;
  const VBW = 360,
    ox = (VBW - W) / 2;
  const childY = 104,
    childW = 64,
    childH = 34;
  const childCx = (i) => ox + (W / (keys.length + 1)) * 0 + (VBW * (i + 0.5)) / 4;

  return (
    <div className="bt-lab">
      <span className="bt-lab-tab">
        <Boxes />
        Tap a gap
      </span>
      <div className="bt-lab-body">
        <svg viewBox={`0 0 ${VBW} 150`} width="100%" style={{ maxHeight: 200, display: 'block' }}>
          {/* pointers from gaps to children */}
          {ranges.map((_, i) => {
            const gx = ox + pad + i * cw;
            const cx = childCx(i);
            const on = sel === i;
            return (
              <path
                key={i}
                d={`M ${gx} ${ch} C ${gx} ${(ch + childY) / 2}, ${cx} ${(ch + childY) / 2}, ${cx} ${childY}`}
                fill="none"
                stroke={on ? 'var(--blue)' : 'var(--rule-2)'}
                strokeWidth={on ? 2.4 : 1.3}
                strokeDasharray={on ? '0' : '3 3'}
                style={{ transition: 'all .25s' }}
              />
            );
          })}
          {/* the node */}
          <rect
            x={ox}
            y="2"
            width={W}
            height={ch}
            rx="6"
            fill="var(--card)"
            stroke="var(--oak-2)"
            strokeWidth="1.6"
          />
          {keys.map((k, j) => (
            <g key={j}>
              {j > 0 && (
                <line
                  x1={ox + pad + j * cw}
                  y1="7"
                  x2={ox + pad + j * cw}
                  y2={ch - 5}
                  stroke="var(--rule)"
                  strokeWidth="1"
                />
              )}
              <text
                x={ox + pad + j * cw + cw / 2}
                y={ch / 2 + 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                fontSize="17"
                fill="var(--ink)"
              >
                {k}
              </text>
            </g>
          ))}
          {/* children + invisible hit areas covering each gap column */}
          {ranges.map((_, i) => {
            const cx = childCx(i);
            const on = sel === i;
            return (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`Select the ${
                  i === 0 ? '< 17' : i === 1 ? '17–42' : i === 2 ? '42–88' : '> 88'
                } range`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSel(on ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSel(on ? null : i);
                  }
                }}
              >
                <rect
                  x={cx - childW / 2}
                  y={childY}
                  width={childW}
                  height={childH}
                  rx="5"
                  fill={on ? 'var(--blue-wash)' : 'var(--card-2)'}
                  stroke={on ? 'var(--blue)' : 'var(--rule-2)'}
                  strokeWidth={on ? 2 : 1.2}
                  style={{ transition: 'all .25s', opacity: sel != null && !on ? 0.45 : 1 }}
                />
                <text
                  x={cx}
                  y={childY + childH / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="var(--font-mono)"
                  fontSize="10.5"
                  fontWeight="700"
                  fill={on ? 'var(--blue)' : 'var(--ink-2)'}
                  style={{ opacity: sel != null && !on ? 0.45 : 1, transition: 'all .25s' }}
                >
                  {i === 0 ? '< 17' : i === 1 ? '17–42' : i === 2 ? '42–88' : '> 88'}
                </text>
                <rect
                  x={ox + i * cw}
                  y="2"
                  width={cw + (i === 0 || i === 3 ? 12 : 0)}
                  height={childY - 2}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>
        <div className="bt-lab-cap">
          {sel == null ? (
            'Three keys carve the universe into four ranges. Each gap between keys owns one child pointer. Tap a gap.'
          ) : (
            <>
              Everything <strong>{ranges[sel]}</strong> lives down this one pointer. The keys
              aren&rsquo;t the data — they&rsquo;re <span className="bt-blue">signposts</span> that
              tell you which drawer to open next.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
