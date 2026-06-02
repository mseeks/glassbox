import { bits32, leadingZeros } from '../engine/index.js';

// Renders a 32-bit hash split at bit p: the first p bits (the register index)
// are tinted brass, a divider, then the remaining bits with their leading zeros
// (the run) in cyan and the first 1 in magenta.
export default function SplitBits({ h, p }) {
  const s = bits32(h);
  const idx = s.slice(0, p),
    rest = s.slice(p);
  const lz = leadingZeros(rest);
  return (
    <span className="bitstr" style={{ fontSize: 'clamp(12px,3.4vw,17px)' }}>
      {idx.split('').map((c, j) => (
        <span key={'i' + j} className="idxb">
          {c}
        </span>
      ))}
      <span style={{ color: 'var(--ink-faint)', margin: '0 4px' }}>│</span>
      {rest.split('').map((c, j) => (
        <span key={'r' + j} className={j < lz ? 'z' : j === lz ? 'one' : 'rest'}>
          {c}
        </span>
      ))}
    </span>
  );
}
