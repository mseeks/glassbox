/* ─────────────────────────────────────────────────────────────────────────
   NODE — the basic visual atom. A circle representing a participant in
   a distributed system. Colors encode role/state.
   ───────────────────────────────────────────────────────────────────────── */
export function Node({ x, y, r = 22, label, state = 'alive', value, sub, animated = false }) {
  const colors = {
    alive: { ring: 'var(--emerald)', fill: 'var(--emerald-soft)', text: 'var(--emerald)' },
    unavail: { ring: 'var(--coral)', fill: 'var(--coral-soft)', text: 'var(--coral)' },
    available: { ring: 'var(--cyan)', fill: 'var(--cyan-soft)', text: 'var(--cyan)' },
    quiet: { ring: 'var(--border-bright)', fill: 'var(--surface)', text: 'var(--ink-dim)' },
    consistent: { ring: 'var(--emerald)', fill: 'var(--emerald-soft)', text: 'var(--emerald)' },
  };
  const c = colors[state] || colors.alive;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {animated && (
        <circle r={r} fill="none" stroke={c.ring} strokeOpacity="0.4">
          <animate attributeName="r" from={r} to={r + 16} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <circle r={r} fill={c.fill} stroke={c.ring} strokeWidth="1.5" />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Spectral, serif"
        fontSize="14"
        fontWeight="500"
        fill={c.text}
      >
        {label}
      </text>
      {value !== undefined && (
        <text
          textAnchor="middle"
          y={r + 18}
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
          fill="var(--ink-2)"
        >
          {value}
        </text>
      )}
      {sub && (
        <text
          textAnchor="middle"
          y={r + (value !== undefined ? 32 : 18)}
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fill="var(--ink-faint)"
          letterSpacing="0.1em"
        >
          {sub}
        </text>
      )}
    </g>
  );
}
