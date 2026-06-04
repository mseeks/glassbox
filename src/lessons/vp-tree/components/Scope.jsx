import { C, clientToScope } from './helpers.js';

// The radar "scope" SVG: concentric range rings + crosshair grid, with optional
// pointer-to-pick interaction. When pickable, it carries a role/label so it is
// an operable, accessibly-named target.
export default function Scope({ children, onPick, pickable, scopeRef }) {
  const handle = (e) => {
    if (!pickable) return;
    e.preventDefault();
    onPick(clientToScope(e, e.currentTarget));
  };
  return (
    <svg
      ref={scopeRef}
      className="vp-scope"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={handle}
      role={pickable ? 'application' : 'img'}
      aria-label={pickable ? 'Sonar scope. Tap to set the query position.' : 'Sonar scope'}
      style={{ cursor: pickable ? 'crosshair' : 'default' }}
    >
      <defs>
        <radialGradient id="vpAmberG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopOpacity="0.5" style={{ stopColor: C.amber }} />
          <stop offset="100%" stopOpacity="0" style={{ stopColor: C.amber }} />
        </radialGradient>
        <filter id="vpGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity="0.7">
        {[16, 30, 44].map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="0.25"
            style={{ stroke: C.grid }}
          />
        ))}
        <line x1="50" y1="3" x2="50" y2="97" strokeWidth="0.25" style={{ stroke: C.grid }} />
        <line x1="3" y1="50" x2="97" y2="50" strokeWidth="0.25" style={{ stroke: C.grid }} />
      </g>
      {children}
    </svg>
  );
}
