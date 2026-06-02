import { toHex } from '../engine/index.js';

// The byte colour-key legend: tag (amber) · length (violet) · value (lime).
export function Legend() {
  return (
    <div className="gx-legend" style={{ marginTop: 14 }}>
      <span>
        <i style={{ background: 'var(--amber)' }} />
        tag (field # + type)
      </span>
      <span>
        <i style={{ background: 'var(--violet)' }} />
        length
      </span>
      <span>
        <i style={{ background: 'var(--lime)' }} />
        value
      </span>
    </div>
  );
}

// Render a sequence of {byte, role, label, kind} as glowing wire tokens. String
// values can show their ASCII glyph instead of hex when `showAscii` is set.
export function ByteStrip({ parts, showAscii }) {
  return (
    <div className="gx-bytes">
      {parts.map((p, i) => (
        <span key={i} className={`gx-byte ${p.role}`} title={p.label}>
          {showAscii && p.role === 'val' && p.kind === 'string'
            ? String.fromCharCode(p.byte)
            : toHex(p.byte)}
        </span>
      ))}
    </div>
  );
}
