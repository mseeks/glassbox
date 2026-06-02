import { useState, useMemo } from 'react';
import { Repeat } from 'lucide-react';
import { sha256Hex, sha256Words, bitsToBoolArray, strBytes } from '../engine/index.js';
import Figure from '../components/Figure.jsx';
import { splitNibbles } from '../components/helpers.js';

export default function AvalancheLab() {
  const [text, setText] = useState('balance: $40.00');
  const [bitIdx, setBitIdx] = useState(0); // which bit of which char to flip
  const bytes = strBytes(text);

  // flip one chosen bit of the input
  const flipped = useMemo(() => {
    if (bytes.length === 0) return bytes;
    const out = bytes.slice();
    const tot = out.length * 8;
    const idx = ((bitIdx % tot) + tot) % tot;
    const byteI = Math.floor(idx / 8),
      bit = 7 - (idx % 8);
    out[byteI] = out[byteI] ^ (1 << bit);
    return out;
  }, [bytes, bitIdx]);

  const hexA = sha256Hex(bytes);
  const hexB = sha256Hex(flipped);
  const bitsA = bitsToBoolArray(sha256Words(bytes));
  const bitsB = bitsToBoolArray(sha256Words(flipped));
  let diff = 0;
  for (let i = 0; i < 256; i++) if (bitsA[i] !== bitsB[i]) diff++;
  const pct = (diff / 256) * 100;

  return (
    <Figure
      label="Fig. 1 · Avalanche"
      title="One input bit in. Half the output bits out."
      foot={
        <>
          A good cryptographic hash behaves like a fair coin: flip any single input bit and each of
          the 256 output bits flips with probability ≈ ½. The meter hovers near 50% no matter what
          you type. That statistical independence is the engine behind every property above.
        </>
      }
    >
      <label className="field-label">Type anything — then flip a single bit of it</label>
      <input
        className="field"
        aria-label="Message to hash"
        value={text}
        maxLength={80}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
      />
      <div className="btn-row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={() => setBitIdx((i) => i + 1)}>
          <Repeat size={13} /> Flip next bit
        </button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--bone-faint)' }}>
          flipping bit #
          {bytes.length
            ? ((bitIdx % (bytes.length * 8)) + bytes.length * 8) % (bytes.length * 8)
            : 0}{' '}
          of {bytes.length * 8}
        </span>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div>
          <div className="field-label">original digest</div>
          <div className="digest" style={{ fontSize: 12 }}>
            {splitNibbles(hexA).map((c, i) => (
              <span key={i} className="nib same">
                {c}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="field-label" style={{ color: 'var(--cerise)' }}>
            after one flipped bit
          </div>
          <div className="digest" style={{ fontSize: 12 }}>
            {splitNibbles(hexB).map((c, i) => (
              <span key={i} className={'nib ' + (hexA[i] !== hexB[i] ? 'chg' : 'same')}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <div style={{ flex: '1 1 200px', minWidth: 180 }}>
          <div className="meter">
            <span style={{ width: pct + '%' }} />
          </div>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
          <span style={{ color: 'var(--copper-bright)', fontWeight: 700, fontSize: 19 }}>
            {diff}
          </span>
          <span style={{ color: 'var(--bone-faint)' }}> / 256 bits · </span>
          <span style={{ color: 'var(--bone)' }}>{pct.toFixed(1)}%</span>
        </div>
      </div>
    </Figure>
  );
}
