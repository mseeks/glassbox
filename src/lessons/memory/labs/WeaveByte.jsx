import { useState } from 'react';
import Core from '../components/Core.jsx';
import { PLACE, charOf } from '../engine/index.js';

// Lab 1 — eight clickable rings = one byte. Thread a ring (1) or leave it
// (0) and the decoded letter changes live. The transition teaches: a letter
// is just eight physical yes/no magnets — and every one was once set by hand.
export default function WeaveByte() {
  const [bits, setBits] = useState([0, 1, 0, 0, 1, 1, 0, 1]); // 'M' = 77
  const code = bits.reduce((a, b, i) => a + b * PLACE[i], 0);
  const ch = charOf(code);
  const printable = code >= 32 && code <= 126;
  const toggle = (i) => setBits((b) => b.map((x, k) => (k === i ? (x ? 0 : 1) : x)));
  const setChar = (v) => {
    const cp = v.length ? v.charCodeAt(v.length - 1) & 0xff : 0;
    setBits(cp.toString(2).padStart(8, '0').split('').map(Number));
  };
  return (
    <div className="lab">
      <div className="lab-tag">Lab · weave one byte</div>
      <p className="lab-note">
        A <em className="term">byte</em> is eight <em className="term">bits</em>: eight yes/no
        magnets. Tap a ring to thread the wire through it (a{' '}
        <strong style={{ color: 'var(--amber-hi)' }}>1</strong>) or leave it bare (a{' '}
        <strong>0</strong>). Watch the letter change. On Apollo, a worker set rings exactly like
        these <em className="term">by hand</em>.
      </p>

      {/* rings + place values */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(4px,1.4vw,9px)',
          margin: '6px 0 4px',
        }}
      >
        {bits.map((b, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
            }}
            aria-label={`bit ${i}, value ${PLACE[i]}, currently ${b}`}
          >
            <Core on={!!b} size={Math.min(34, 30)} idx={i} />
            <span
              className="mono"
              style={{ fontSize: 9.5, color: b ? 'var(--amber-hi)' : 'var(--faint)' }}
            >
              {PLACE[i]}
            </span>
          </button>
        ))}
      </div>

      {/* live decode */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          borderTop: '1px solid var(--line)',
          marginTop: 14,
          paddingTop: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="disp"
            style={{
              fontSize: 54,
              lineHeight: 1,
              color: printable ? 'var(--amber-hi)' : 'var(--faint)',
            }}
          >
            {ch}
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--faint)', marginTop: 4 }}>
            {printable ? 'the letter' : '(non-printing)'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="readout" style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--faint)' }}>binary</span>{' '}
            <span style={{ color: 'var(--steel)' }}>{bits.join('')}</span>
          </div>
          <div className="readout" style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--faint)' }}>decimal</span>{' '}
            <span style={{ color: 'var(--ivory)' }}>{code}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--faint)' }}>
              set:
            </span>
            <input
              className="input mono"
              style={{ width: 54, padding: '5px 8px', fontSize: 13, textAlign: 'center' }}
              maxLength={1}
              value={printable && ch !== '␣' ? ch : ''}
              placeholder="A"
              onChange={(e) => setChar(e.target.value)}
              aria-label="type a character"
            />
          </div>
        </div>
      </div>

      <div className="callout" style={{ margin: '16px 0 0', padding: '11px 15px' }}>
        <span style={{ fontSize: 14.5 }}>
          This page of text you're reading is a few thousand of these bytes. By hand, at a careful
          one thread per second, a single page would take a worker about{' '}
          <strong style={{ color: 'var(--amber-hi)' }}>four hours</strong> to weave.
        </span>
      </div>
    </div>
  );
}
