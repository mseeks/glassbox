import { KeyRound } from 'lucide-react';

// A colour chip for the Diffie–Hellman paint metaphor, with an optional
// key glyph marking a secret colour.
export default function Swatch({ color, size = 46, label, lock }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        className="tls-swatch"
        style={{ width: size, height: size, background: color, position: 'relative' }}
      >
        {lock && (
          <KeyRound
            size={13}
            style={{ position: 'absolute', right: 3, bottom: 3, color: 'rgba(0,0,0,.55)' }}
          />
        )}
      </div>
      {label && (
        <span
          className="tls-mono"
          style={{ fontSize: 10.5, color: 'var(--bone-faint)', letterSpacing: '.08em' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
