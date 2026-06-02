export function ClusterNode({
  x,
  y,
  state = 'alive',
  label,
  size = 8,
  dim = false,
  pulse = false,
  incarnation,
}) {
  const color =
    state === 'alive'
      ? 'var(--alive)'
      : state === 'suspect'
        ? 'var(--suspect)'
        : state === 'dead'
          ? 'var(--dead)'
          : 'var(--ink-faint)';
  const glow =
    state === 'alive'
      ? 'var(--alive-glow)'
      : state === 'suspect'
        ? 'var(--suspect-glow)'
        : state === 'dead'
          ? 'var(--dead-glow)'
          : 'transparent';
  return (
    <g style={{ opacity: dim ? 0.35 : 1, transition: 'opacity 0.4s' }}>
      {/* halo */}
      <circle cx={x} cy={y} r={size + 6} fill={glow} style={{ transition: 'fill 0.4s' }} />
      {/* outer ring (pulse for suspect) */}
      <circle
        cx={x}
        cy={y}
        r={size + 2.5}
        fill="none"
        stroke={color}
        strokeWidth={state === 'dead' ? 0 : 1.2}
        strokeOpacity={state === 'suspect' ? 0.85 : 0.45}
        style={{
          transition: 'stroke 0.4s, stroke-opacity 0.4s',
          animation:
            pulse || state === 'suspect' ? 'swim-pulse-soft 1.4s ease-in-out infinite' : undefined,
        }}
      />
      {/* fill */}
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={state === 'dead' ? 'var(--bg-deeper)' : color}
        stroke={state === 'dead' ? color : 'none'}
        strokeWidth={state === 'dead' ? 1.4 : 0}
        strokeDasharray={state === 'dead' ? '2 2' : ''}
        style={{ transition: 'fill 0.4s, stroke 0.4s' }}
      />
      {/* X mark for dead */}
      {state === 'dead' && (
        <g stroke={color} strokeWidth="1.2" strokeLinecap="round">
          <line x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3} />
          <line x1={x - 3} y1={y + 3} x2={x + 3} y2={y - 3} />
        </g>
      )}
      {label && (
        <text
          x={x}
          y={y + size + 14}
          textAnchor="middle"
          fill="var(--ink-dim)"
          fontSize="9"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="0.08em"
        >
          {label}
        </text>
      )}
      {incarnation != null && (
        <text
          x={x}
          y={y - size - 7}
          textAnchor="middle"
          fill="var(--brass)"
          fontSize="8.5"
          fontFamily="JetBrains Mono, monospace"
        >
          i={incarnation}
        </text>
      )}
    </g>
  );
}
