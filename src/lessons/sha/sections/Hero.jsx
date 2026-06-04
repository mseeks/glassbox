import { useState, useEffect, useRef } from 'react';
import { Zap, Repeat } from 'lucide-react';
import { sha256Hex } from '../engine/index.js';
import { splitNibbles, diffMask } from '../components/helpers.js';

// The avalanche, on the door: one character changes and the entire 256-bit
// fingerprint detonates.
export default function Hero() {
  const base = 'the quick brown fox';
  const alt = 'the quick brown fix';
  const [flipped, setFlipped] = useState(false);
  const text = flipped ? alt : base;
  const prevRef = useRef(sha256Hex(base));
  const hex = sha256Hex(text);
  const prev = prevRef.current;
  const mask = diffMask(prev, hex);
  useEffect(() => {
    prevRef.current = hex;
  });

  // ambient: count changed nibbles for the caption
  const changed = mask.filter(Boolean).length;

  return (
    <header style={{ paddingTop: 64, paddingBottom: 30 }}>
      <div className="sha-wrap">
        <div className="eyebrow reveal in" style={{ justifyContent: 'flex-start' }}>
          <span className="dash" /> NIST · FIPS 180 · Secure Hash Algorithms
        </div>
        <h1 className="h-display reveal in" style={{ marginTop: 22, animationDelay: '.05s' }}>
          The one-way
          <br />
          <span style={{ color: 'var(--copper)' }}>machine.</span>
        </h1>
        <p
          className="lede reveal in"
          style={{ marginTop: 24, maxWidth: 600, animationDelay: '.12s' }}
        >
          A function that swallows anything, a word, a film, a galaxy of data, and stamps out a
          short, fixed fingerprint. Easy to compute. Effectively impossible to reverse. Change one
          letter and the entire fingerprint shatters.
        </p>

        <div className="figure reveal in" style={{ marginTop: 36, animationDelay: '.2s' }}>
          <div className="figure-head">
            <div className="figure-label">Live · SHA-256</div>
            <div className="chip cer" style={{ visibility: changed ? 'visible' : 'hidden' }}>
              <Zap size={12} /> {changed}/64 nibbles changed
            </div>
          </div>
          <div className="figure-body">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 14,
              }}
            >
              <span className="field-label" style={{ margin: 0 }}>
                input
              </span>
              <code style={{ fontSize: 15, color: 'var(--bone)' }}>
                "the quick brown{' '}
                <span
                  style={{
                    color: flipped ? 'var(--cerise-bright)' : 'var(--copper-bright)',
                    fontWeight: 600,
                  }}
                >
                  {flipped ? 'fix' : 'fox'}
                </span>
                "
              </code>
            </div>
            <div className="digest" aria-label="SHA-256 digest">
              {splitNibbles(hex).map((c, i) => (
                <span key={i} className={'nib ' + (mask[i] ? 'chg' : 'same')}>
                  {c}
                </span>
              ))}
            </div>
            <div className="btn-row" style={{ marginTop: 16 }}>
              <button className="btn primary" onClick={() => setFlipped((f) => !f)}>
                <Repeat size={14} /> Flip one letter (o → i)
              </button>
              <span
                style={{ fontSize: 13, color: 'var(--bone-faint-fn)', fontFamily: 'var(--mono)' }}
              >
                a single bit of intent, a wholly different fingerprint
              </span>
            </div>
          </div>
          <div className="figure-foot">
            This digest is computed by a genuine SHA-256 running in the page, not a mock-up. Every
            hash you see in this lesson is real.
          </div>
        </div>

        <div
          className="reveal in"
          style={{
            marginTop: 30,
            display: 'flex',
            gap: 18,
            flexWrap: 'wrap',
            fontFamily: 'var(--mono)',
            fontSize: 12.5,
            color: 'var(--bone-faint-fn)',
            animationDelay: '.3s',
          }}
        >
          <span>
            ↓ what makes a hash <span style={{ color: 'var(--copper)' }}>cryptographic</span>
          </span>
          <span>· the two great machines</span>
          <span>· where they break</span>
        </div>
      </div>
    </header>
  );
}
