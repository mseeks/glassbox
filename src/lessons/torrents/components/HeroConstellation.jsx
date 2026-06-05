import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// The hero / footer glyph: a constellation whose central gold star reaches out
// to two others along dashed "signal" threads. Those threads animate with SVG
// SMIL (<animate>), which the global reduced-motion CSS cannot reach, and the
// outer stars pulse via the CSS @keyframes tor-hn (already neutralized). Under
// prefers-reduced-motion we drop the SMIL so a clean static frame remains.
const P = [
  { x: 58, y: 38 },
  { x: 150, y: 26 },
  { x: 252, y: 44 },
  { x: 298, y: 90 },
  { x: 210, y: 104 },
  { x: 116, y: 98 },
  { x: 40, y: 86 },
  { x: 172, y: 66 },
];
const G = 7; // the central gold star

export default function HeroConstellation() {
  const reduced = usePrefersReducedMotion();
  return (
    <svg
      width="320"
      height="130"
      viewBox="0 0 320 130"
      aria-hidden="true"
      style={{ maxWidth: '90vw' }}
    >
      {P.map((p, i) =>
        i === G ? null : (
          <line
            key={'l' + i}
            x1={P[G].x}
            y1={P[G].y}
            x2={p.x}
            y2={p.y}
            stroke="var(--signal)"
            strokeWidth="1"
            opacity="0.15"
          />
        ),
      )}
      <line
        x1={P[G].x}
        y1={P[G].y}
        x2={P[2].x}
        y2={P[2].y}
        stroke="var(--signal-2)"
        strokeWidth="1.4"
        strokeDasharray="3 5"
        opacity="0.75"
      >
        {!reduced && (
          <animate
            attributeName="stroke-dashoffset"
            from="8"
            to="0"
            dur="0.9s"
            repeatCount="indefinite"
          />
        )}
      </line>
      <line
        x1={P[G].x}
        y1={P[G].y}
        x2={P[6].x}
        y2={P[6].y}
        stroke="var(--signal-2)"
        strokeWidth="1.4"
        strokeDasharray="3 5"
        opacity="0.75"
      >
        {!reduced && (
          <animate
            attributeName="stroke-dashoffset"
            from="8"
            to="0"
            dur="1.15s"
            repeatCount="indefinite"
          />
        )}
      </line>
      {P.map((p, i) => {
        const gold = i === G;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={gold ? 5.5 : 3}
            fill={gold ? 'var(--gold)' : 'var(--signal)'}
            className={gold ? '' : 'tor-hn'}
            style={{
              filter: `drop-shadow(0 0 ${gold ? 8 : 4}px ${gold ? 'var(--gold)' : 'var(--signal)'})`,
            }}
          />
        );
      })}
    </svg>
  );
}
