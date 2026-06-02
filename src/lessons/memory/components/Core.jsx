import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// The magnetic-core motif. Each "core" is a ferrite ring threaded by wires.
// on = a stored 1 (magnetized, amber glow); off = a 0. Every lab and the
// page coda renders one of these — it's the lesson's central image.
export default function Core({ on, size = 26, idx = 0, hue = 'amber' }) {
  const reduced = usePrefersReducedMotion();
  const r = size * 0.3,
    c = size / 2;
  const col = hue === 'steel' ? 'var(--steel)' : 'var(--amber)';
  const glow = hue === 'steel' ? 'rgba(115,188,207,.85)' : 'rgba(246,181,69,.85)';
  const fill = hue === 'steel' ? 'rgba(155,214,228,.5)' : 'rgba(255,211,132,.5)';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <line
        x1={2}
        y1={c}
        x2={size - 2}
        y2={c}
        stroke="var(--steel-dim)"
        strokeWidth="1"
        opacity={on ? 0.55 : 0.32}
      />
      <line
        x1={c}
        y1={2}
        x2={c}
        y2={size - 2}
        stroke="var(--steel-dim)"
        strokeWidth="1"
        opacity={on ? 0.55 : 0.32}
      />
      <line
        x1={4}
        y1={size - 4}
        x2={size - 4}
        y2={4}
        stroke="var(--steel-dim)"
        strokeWidth="0.8"
        opacity={on ? 0.4 : 0.18}
      />
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={on ? col : '#2c364f'}
        strokeWidth={on ? 2.4 : 1.6}
        style={on ? { filter: `drop-shadow(0 0 5px ${glow})` } : {}}
      >
        {on && !reduced && (
          <animate
            attributeName="opacity"
            values="0.78;1;0.78"
            dur="2.6s"
            begin={`${(idx % 7) * 0.18}s`}
            repeatCount="indefinite"
          />
        )}
      </circle>
      {on && <circle cx={c} cy={c} r={r * 0.42} fill={fill} />}
    </svg>
  );
}
