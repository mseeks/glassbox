import { useEffect, useMemo, useRef, useState } from 'react';
import { dist, makeField } from '../engine/index.js';
import Scope from '../components/Scope.jsx';
import Crosshair from '../components/Crosshair.jsx';
import { C } from '../components/helpers.js';

/* ── §I · brute force — the ocean you can't see ── */
export default function BruteForceLab() {
  const field = useMemo(() => makeField(50231, 24), []);
  const [q, setQ] = useState({ x: 63, y: 39 });
  const [k, setK] = useState(-1);
  const timer = useRef(null);

  const nearest = useMemo(() => {
    let bi = 0,
      bd = Infinity;
    field.forEach((p, i) => {
      const d = dist(p, q);
      if (d < bd) {
        bd = d;
        bi = i;
      }
    });
    return { i: bi, d: bd };
  }, [field, q]);

  const ping = () => {
    clearInterval(timer.current);
    setK(0);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      setK(i);
      if (i >= field.length) clearInterval(timer.current);
    }, 55);
  };
  const reset = (qq) => {
    clearInterval(timer.current);
    setQ(qq);
    setK(-1);
  };
  useEffect(() => () => clearInterval(timer.current), []);

  const done = k >= field.length;
  let bestSoFar = -1,
    bd = Infinity;
  for (let i = 0; i < Math.min(Math.max(k, 0), field.length); i++) {
    const d = dist(field[i], q);
    if (d < bd) {
      bd = d;
      bestSoFar = i;
    }
  }

  return (
    <div className="vp-plate">
      <div className="vp-plabel">
        <span className="dot" /> scope · brute-force ranging
      </div>
      <Scope pickable onPick={reset}>
        {field.map((p, i) => {
          const measured = k > i;
          const isCurrent = k === i + 1 && !done;
          const isNearest = done && i === nearest.i;
          const isBest = !done && i === bestSoFar;
          return (
            <g key={i}>
              {measured && (
                <line
                  x1={q.x}
                  y1={q.y}
                  x2={p.x}
                  y2={p.y}
                  strokeWidth="0.3"
                  style={{ stroke: isNearest || isBest ? C.amber : C.hairline }}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isNearest ? 2.4 : isCurrent ? 2.2 : 1.5}
                opacity={measured || isCurrent ? 1 : 0.55}
                filter={isCurrent || isNearest ? 'url(#vpGlow)' : undefined}
                style={{ fill: isNearest || isBest ? C.amber : measured ? C.ping : C.contact }}
              />
              {isCurrent && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="none"
                  strokeWidth="0.4"
                  opacity="0.8"
                  style={{ stroke: C.ping }}
                />
              )}
            </g>
          );
        })}
        <Crosshair x={q.x} y={q.y} />
      </Scope>

      <div className="vp-stat">
        <div className="vp-statcell">
          <div className="k">Echoes measured</div>
          <div className="v ping">
            {k < 0 ? 0 : Math.min(k, field.length)}
            <span className="u">/ {field.length}</span>
          </div>
        </div>
        <div className="vp-statcell">
          <div className="k">Nearest range</div>
          <div className="v amber">{done ? nearest.d.toFixed(1) : '–'}</div>
        </div>
      </div>

      <div className="vp-ctrls">
        <button className="vp-btn solid" onClick={ping} disabled={k >= 0 && !done}>
          ▸ Ping all contacts
        </button>
        <button className="vp-btn" onClick={() => reset(q)}>
          Reset
        </button>
      </div>
      <div className="vp-hint">
        <span className="pip" /> tap anywhere on the scope to move the query
      </div>
      <div className="vp-caption">
        To answer "what&apos;s closest?" the naïve way, you measure the range to <em>every</em>{' '}
        contact and keep the smallest. {field.length} contacts means {field.length} measurements, on
        every single query. Double the ocean, double the work. This linear cost is the thing the
        tree exists to beat.
      </div>
    </div>
  );
}
