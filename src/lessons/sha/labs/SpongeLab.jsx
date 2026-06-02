import { useState, useEffect, useMemo } from 'react';
import { Droplets, Waves, RotateCcw } from 'lucide-react';
import { strBytes } from '../engine/index.js';
import Figure from '../components/Figure.jsx';

// A pedagogical "toy" sponge: the absorb/squeeze mechanics + the rate/capacity
// split are faithful; the permutation is simplified (real Keccak-f is far
// more involved). Labeled as such in the figure caption.
const SP_N = 25,
  SP_RATE = 10;

function spongePermute(stateIn) {
  const s = stateIn.slice();
  for (let round = 0; round < 4; round++) {
    // theta-like: column parity (5 columns) folded in
    const par = [0, 0, 0, 0, 0];
    for (let c = 0; c < 5; c++) {
      let p = 0;
      for (let r = 0; r < 5; r++) p ^= s[r * 5 + c];
      par[c] = p;
    }
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++)
        s[r * 5 + c] ^=
          par[(c + 4) % 5] ^ (((par[(c + 1) % 5] << 1) | (par[(c + 1) % 5] >>> 7)) & 0xff);
    // rho/pi-like: rotate each byte by a position-dependent amount, then permute cells
    const t = s.slice();
    for (let i = 0; i < SP_N; i++) {
      const rot = (i * 3 + round) & 7;
      const v = t[i];
      s[(i * 7 + 3) % SP_N] = ((v << rot) | (v >>> (8 - rot))) & 0xff;
    }
    // chi-like: nonlinear across each row of 5
    for (let r = 0; r < 5; r++) {
      const row = [s[r * 5], s[r * 5 + 1], s[r * 5 + 2], s[r * 5 + 3], s[r * 5 + 4]];
      for (let c = 0; c < 5; c++) s[r * 5 + c] = row[c] ^ (~row[(c + 1) % 5] & row[(c + 2) % 5]);
    }
    // iota-like: round constant into cell 0
    s[0] ^= (0x8d ^ (round * 0x5b)) & 0xff;
  }
  return s;
}

export default function SpongeLab() {
  const [input, setInput] = useState('hello');
  const chunks = useMemo(() => {
    const b = strBytes(input);
    const out = [];
    for (let i = 0; i < Math.max(b.length, 1); i += SP_RATE) {
      const c = new Uint8Array(SP_RATE);
      for (let j = 0; j < SP_RATE; j++) c[j] = b[i + j] || (i + j === b.length ? 0x01 : 0); // simple pad marker
      out.push(c);
    }
    return out;
  }, [input]);

  // phases: absorb chunk 0..n-1, then squeeze
  const [state, setState] = useState(() => new Uint8Array(SP_N));
  const [phase, setPhase] = useState('idle'); // idle | absorbed-k | squeezed
  const [absorbedCount, setAbsorbedCount] = useState(0);
  const [out, setOut] = useState([]);
  const [lastTouched, setLastTouched] = useState(-1); // 0 absorb, 1 squeeze

  const reset = () => {
    setState(new Uint8Array(SP_N));
    setPhase('idle');
    setAbsorbedCount(0);
    setOut([]);
    setLastTouched(-1);
  };
  useEffect(reset, [input]);

  const absorbNext = () => {
    if (absorbedCount >= chunks.length) return;
    let s = state.slice();
    const ch = chunks[absorbedCount];
    for (let i = 0; i < SP_RATE; i++) s[i] ^= ch[i]; // XOR chunk into the rate
    s = spongePermute(s); // stir the whole state
    setState(s);
    setAbsorbedCount((c) => c + 1);
    setPhase('absorbing');
    setLastTouched(0);
  };
  const squeeze = () => {
    let s = state;
    if (out.length > 0) s = spongePermute(state); // permute between squeezes
    const o = [];
    for (let i = 0; i < SP_RATE; i++) o.push(s[i]);
    setState(s);
    setOut((prev) => [...prev, ...o]);
    setPhase('squeezed');
    setLastTouched(1);
  };

  const allAbsorbed = absorbedCount >= chunks.length;
  const cellHex = (v) => v.toString(16).padStart(2, '0');

  return (
    <Figure
      label="Fig. 6 · The sponge"
      title="Soak input through the rate. Wring output from the rate. The deep half stays hidden."
      foot={
        <>
          A faithful illustration of the <em>mechanics</em>: input only ever enters through the
          <span style={{ color: 'var(--copper-bright)' }}> rate</span> (top), output only ever
          leaves through the rate, and the <span style={{ color: 'var(--steel)' }}>capacity</span>{' '}
          (bottom) is never read or written directly, yet the stir mixes it into everything. (The
          stir here is a simplified stand-in; real Keccak-f does far more.)
        </>
      }
    >
      <label className="field-label">input</label>
      <input
        className="field"
        aria-label="Input to absorb into the sponge"
        value={input}
        maxLength={40}
        spellCheck={false}
        onChange={(e) => setInput(e.target.value)}
      />
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: 'var(--bone-faint)',
          marginTop: 7,
        }}
      >
        → {chunks.length} chunk{chunks.length > 1 ? 's' : ''} of {SP_RATE} bytes · absorbed{' '}
        {absorbedCount}/{chunks.length}
      </div>

      {/* the 5x5 state */}
      <div
        style={{ display: 'flex', gap: 14, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5,1fr)',
              gap: 4,
              width: 'min(230px, 70vw)',
            }}
          >
            {Array.from({ length: SP_N }).map((_, i) => {
              const isRate = i < SP_RATE;
              const touched =
                isRate &&
                ((lastTouched === 0 && phase === 'absorbing') ||
                  (lastTouched === 1 && phase === 'squeezed'));
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--mono)',
                    fontSize: 'clamp(9px,2.5vw,12px)',
                    borderRadius: 5,
                    border:
                      '1px solid ' +
                      (isRate
                        ? touched
                          ? lastTouched === 1
                            ? 'var(--jade)'
                            : 'var(--copper)'
                          : 'rgba(224,122,60,0.4)'
                        : 'rgba(141,155,176,0.35)'),
                    background: isRate
                      ? touched
                        ? lastTouched === 1
                          ? 'var(--jade-glow)'
                          : 'var(--copper-glow)'
                        : 'rgba(224,122,60,0.05)'
                      : 'rgba(141,155,176,0.06)',
                    color: isRate ? 'var(--copper-bright)' : 'var(--steel-dim)',
                    transition: 'all .3s',
                  }}
                >
                  {cellHex(state[i])}
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 14,
              marginTop: 8,
              fontFamily: 'var(--mono)',
              fontSize: 10.5,
            }}
          >
            <span style={{ color: 'var(--copper-bright)' }}>■ rate (10)</span>
            <span style={{ color: 'var(--steel)' }}>■ capacity (15) · hidden</span>
          </div>
        </div>
        <div style={{ flex: '1 1 150px', minWidth: 140 }}>
          <div className="field-label">output squeezed</div>
          {out.length === 0 ? (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--bone-faint)' }}>
              — absorb, then squeeze —
            </div>
          ) : (
            <div className="digest" style={{ fontSize: 12 }}>
              {out.map((v, i) => (
                <span key={i} className="nib same" style={{ color: 'var(--jade)' }}>
                  {cellHex(v)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button className="btn primary" disabled={allAbsorbed} onClick={absorbNext}>
          <Droplets size={13} /> Absorb chunk
        </button>
        <button className="btn" disabled={!allAbsorbed} onClick={squeeze}>
          <Waves size={13} /> Squeeze
        </button>
        <button className="btn ghost" onClick={reset}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </Figure>
  );
}
