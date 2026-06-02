import { useState } from 'react';
import Figure from '../components/Figure.jsx';

// §VI — the RUM impossibility surface. Drag the survey point inside the
// read/update/memory triangle and feel the trade: push any one toward zero,
// another swells. Every LSM knob is just a coordinate on this surface.
export default function RumLab() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.52 });
  const [drag, setDrag] = useState(false);
  const A = { x: 0.5, y: 0.12 },
    B = { x: 0.12, y: 0.84 },
    C = { x: 0.88, y: 0.84 };
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const bary = (p) => {
    const det = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
    const a = ((B.y - C.y) * (p.x - C.x) + (C.x - B.x) * (p.y - C.y)) / det;
    const b = ((C.y - A.y) * (p.x - C.x) + (A.x - C.x) * (p.y - C.y)) / det;
    return { R: clamp(a), U: clamp(b), M: clamp(1 - a - b) };
  };
  const co = bary(pos);
  const presets = [
    { n: 'leveled', x: 0.34, y: 0.4 },
    { n: 'tiered', x: 0.66, y: 0.4 },
    { n: 'log-only', x: 0.74, y: 0.8 },
    { n: 'b-tree', x: 0.46, y: 0.22 },
  ];
  const move = (cx, cy, el) => {
    const r = el.getBoundingClientRect();
    setPos({ x: clamp((cx - r.left) / r.width), y: clamp((cy - r.top) / r.height) });
  };

  return (
    <Figure cap="figure · the impossibility surface" style={{ padding: '24px 22px 20px' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 24 }}
        className="g2"
      >
        <div
          style={{
            position: 'relative',
            paddingBottom: '88%',
            cursor: drag ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
          onMouseDown={(e) => {
            setDrag(true);
            move(e.clientX, e.clientY, e.currentTarget);
          }}
          onMouseUp={() => setDrag(false)}
          onMouseLeave={() => setDrag(false)}
          onMouseMove={(e) => drag && move(e.clientX, e.clientY, e.currentTarget)}
          onTouchStart={(e) => {
            setDrag(true);
            const tt = e.touches[0];
            move(tt.clientX, tt.clientY, e.currentTarget);
          }}
          onTouchEnd={() => setDrag(false)}
          onTouchMove={(e) => {
            if (!drag) return;
            const tt = e.touches[0];
            move(tt.clientX, tt.clientY, e.currentTarget);
          }}
        >
          <svg
            viewBox="0 0 100 100"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            <defs>
              <radialGradient id="rumglow" cx="50%" cy="55%" r="55%">
                <stop offset="0%" stopColor="rgba(227,170,51,0.16)" />
                <stop offset="100%" stopColor="rgba(227,170,51,0)" />
              </radialGradient>
            </defs>
            <polygon
              points={`${A.x * 100},${A.y * 100} ${B.x * 100},${B.y * 100} ${C.x * 100},${C.y * 100}`}
              fill="url(#rumglow)"
            />
            <polygon
              points={`${A.x * 100},${A.y * 100} ${B.x * 100},${B.y * 100} ${C.x * 100},${C.y * 100}`}
              fill="rgba(236,214,160,0.05)"
              stroke="var(--edge)"
              strokeWidth="0.5"
            />
            <g fontFamily="Bitter" fontWeight="700">
              <text
                x={A.x * 100}
                y={A.y * 100 - 2}
                textAnchor="middle"
                fontSize="5.5"
                fill="var(--writ)"
              >
                READ
              </text>
              <text
                x={B.x * 100 - 3}
                y={B.y * 100 + 6}
                textAnchor="middle"
                fontSize="5.5"
                fill="var(--gold)"
              >
                UPDATE
              </text>
              <text
                x={C.x * 100 + 3}
                y={B.y * 100 + 6}
                textAnchor="middle"
                fontSize="5.5"
                fill="var(--jade)"
              >
                MEMORY
              </text>
            </g>
            {presets.map((p) => (
              <g key={p.n}>
                <circle cx={p.x * 100} cy={p.y * 100} r="1.4" fill="var(--ink-3)" />
                <text
                  x={p.x * 100 + 2.4}
                  y={p.y * 100 + 1.4}
                  fontSize="3"
                  fill="var(--ink-3)"
                  fontFamily="JetBrains Mono"
                >
                  {p.n}
                </text>
              </g>
            ))}
            <circle cx={pos.x * 100} cy={pos.y * 100} r="6" fill="rgba(227,88,44,0.18)" />
            <circle
              cx={pos.x * 100}
              cy={pos.y * 100}
              r="3.1"
              fill="var(--writ)"
              stroke="var(--ink)"
              strokeWidth="0.8"
            />
          </svg>
        </div>
        <div>
          <div className="d" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            R · U · M
          </div>
          <div
            className="serif"
            style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}
          >
            drag the survey point
          </div>
          {[
            {
              l: 'read amplification',
              v: co.R,
              c: 'var(--writ)',
              d: 'places a read may have to look',
            },
            {
              l: 'update amplification',
              v: co.U,
              c: 'var(--gold)',
              d: 'times a byte is rewritten in its life',
            },
            {
              l: 'memory amplification',
              v: co.M,
              c: 'var(--jade)',
              d: 'extra storage carried — dead versions, indexes',
            },
          ].map((x) => (
            <div key={x.l} style={{ marginBottom: 13 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 4,
                }}
              >
                <span
                  className="m"
                  style={{
                    fontSize: 10.5,
                    color: x.c,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {x.l}
                </span>
                <span className="m" style={{ fontSize: 13, color: x.c, fontWeight: 600 }}>
                  {(x.v * 100).toFixed(0)}
                </span>
              </div>
              <div style={{ height: 5, background: 'var(--paper-4)', borderRadius: 2 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${x.v * 100}%`,
                    background: x.c,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${x.c}`,
                    transition: 'width 0.1s',
                  }}
                />
              </div>
              <div
                className="serif"
                style={{ fontStyle: 'italic', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}
              >
                {x.d}
              </div>
            </div>
          ))}
          <div
            className="serif"
            style={{
              marginTop: 10,
              padding: '10px 12px',
              background: 'var(--paper-3)',
              border: '1px solid var(--rule-soft)',
              fontStyle: 'italic',
              fontSize: 12.5,
              color: 'var(--ink-2)',
            }}
          >
            Push any one toward zero and another swells. There is no point in a corner. That is the
            RUM conjecture, and every LSM knob is just a coordinate on this surface.
          </div>
        </div>
      </div>
    </Figure>
  );
}
