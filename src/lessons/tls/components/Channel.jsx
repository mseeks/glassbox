// A horizontal channel line; tone = 'exposed' | 'sealed' | 'broken'. The flow
// dash animation is pure CSS (tls-flow), neutralized globally under reduced
// motion, so no JS gating is needed here.
export default function Channel({ tone = 'exposed', label, height = 2 }) {
  const color =
    tone === 'sealed' ? 'var(--aqua)' : tone === 'broken' ? 'var(--verm)' : 'var(--steel)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <svg
        width="100%"
        height="14"
        style={{ overflow: 'visible', flex: 1 }}
        preserveAspectRatio="none"
        viewBox="0 0 300 14"
      >
        <line
          x1="0"
          y1="7"
          x2="300"
          y2="7"
          stroke={color}
          strokeWidth={height}
          strokeDasharray={tone === 'exposed' ? '2 4' : '9 6'}
          opacity={tone === 'exposed' ? 0.6 : 0.95}
          style={tone !== 'exposed' ? { animation: 'tls-flow 1.1s linear infinite' } : undefined}
        />
      </svg>
      {label && (
        <span
          className="tls-mono"
          style={{ fontSize: 10.5, color, letterSpacing: '.08em', whiteSpace: 'nowrap' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
