import { C } from './helpers.js';

// The query marker drawn on the scope: a soft amber halo + plus-sign reticle.
export default function Crosshair({ x, y, color = C.amber, r = 3.1 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r + 4} fill={`url(#vpAmberG)`} />
      <line x1={x - r} y1={y} x2={x + r} y2={y} stroke={color} strokeWidth="0.6" />
      <line x1={x} y1={y - r} x2={x} y2={y + r} stroke={color} strokeWidth="0.6" />
      <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth="0.5" />
    </g>
  );
}
