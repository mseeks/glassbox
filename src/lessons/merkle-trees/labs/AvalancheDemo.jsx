import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { hashHex } from '../engine/index.js';
import Plate from '../components/Plate.jsx';

// Avalanche on a single character — flip one letter and the entire digest
// scrambles. The interactive Plate inside the Hash section.
export default function AvalancheDemo() {
  const [text, setText] = useState('title deed №1842');
  const digest = hashHex(text);

  // a one-character mutation to demonstrate avalanche
  const mutate = () => {
    if (text.length === 0) return;
    const i = Math.floor(Math.random() * text.length);
    const code = text.charCodeAt(i);
    const repl = String.fromCharCode(code === 122 ? 97 : code + 1);
    const next = text.slice(0, i) + repl + text.slice(i + 1);
    setText(next);
  };

  // diff coloring vs a baseline
  const baseline = useMemo(() => hashHex('title deed №1842'), []);

  return (
    <Plate style={{ padding: 22 }}>
      <div
        className="mk-mono"
        style={{
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'var(--paper-faint)',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Try it: type, or flip a single character
      </div>
      <input
        className="mk-input"
        value={text}
        maxLength={40}
        onChange={(e) => setText(e.target.value)}
        aria-label="Document text to hash"
      />
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}
      >
        <span className="mk-mono" style={{ fontSize: 12, color: 'var(--paper-faint)' }}>
          H(input) =
        </span>
        <span
          className="mk-mono"
          style={{
            fontSize: 'clamp(15px,4vw,22px)',
            letterSpacing: '0.06em',
            color: 'var(--patina)',
          }}
        >
          {digest.split('').map((c, i) => (
            <span
              key={i}
              style={{
                color: baseline[i] === c ? 'var(--patina)' : 'var(--gold-bright)',
                transition: 'color 0.3s',
              }}
            >
              {c}
            </span>
          ))}
        </span>
        <button className="mk-btn" onClick={mutate} style={{ marginLeft: 'auto' }}>
          <Sparkles size={13} /> Flip a char
        </button>
      </div>
      <div className="mk-mono" style={{ fontSize: 11, color: 'var(--paper-faint)', marginTop: 10 }}>
        gold digits differ from the original input's fingerprint. A tiny change scatters everywhere.
      </div>
    </Plate>
  );
}
