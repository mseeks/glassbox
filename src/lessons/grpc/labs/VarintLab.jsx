import { useState } from 'react';
import { varintBytes, varintGroups, zigzag, toUnsigned64 } from '../engine/index.js';
import { ICONS } from '../components/Callout.jsx';

// Varint encoder: drag a number and watch it grow byte by byte — seven value
// bits per byte, the top bit flagging "more to come". Toggle int64 vs sint64 to
// see why negatives want zig-zag.
export default function VarintLab() {
  const [n, setN] = useState(300);
  const [signed, setSigned] = useState(false);

  const big = BigInt(n);
  const payload = signed ? zigzag(big) : toUnsigned64(big);
  const bytes = varintBytes(payload);
  const groups = varintGroups(bytes);

  const presets = [
    { l: '0', v: 0 },
    { l: '127', v: 127 },
    { l: '128', v: 128 },
    { l: '300', v: 300 },
    { l: '16384', v: 16384 },
    { l: '−1', v: -1 },
  ];

  return (
    <div className="gx-panel pad" style={{ marginTop: 22 }}>
      <div className="gx-panel-label">
        <span className="dot" />
        varint encoder
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: 6,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: "'Bricolage Grotesque'",
            fontSize: 34,
            fontWeight: 700,
            color: 'var(--ink-bright)',
          }}
        >
          {n}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-dim)' }}>
          → {bytes.length} byte{bytes.length > 1 ? 's' : ''}
        </span>
      </div>
      <input
        className="gx-range"
        type="range"
        aria-label="value to encode as a varint"
        min={-1}
        max={20000}
        value={n}
        onChange={(e) => setN(+e.target.value)}
        style={{ margin: '8px 0 12px' }}
      />
      <div className="gx-seg" style={{ marginBottom: 16 }}>
        {presets.map((p) => (
          <button key={p.l} className={`gx-btn ${n === p.v ? 'on' : ''}`} onClick={() => setN(p.v)}>
            {p.l}
          </button>
        ))}
      </div>

      {/* group construction */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint2)',
          marginBottom: 9,
        }}
      >
        seven bits per byte · top bit = "more coming"
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {groups.map((g, i) => (
          <div
            key={i}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
          >
            <div
              style={{
                display: 'flex',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid var(--line2)',
              }}
            >
              <span
                style={{
                  padding: '5px 7px',
                  background: g.cont ? 'var(--cyan-glow)' : 'var(--panel2)',
                  color: g.cont ? 'var(--cyan)' : 'var(--ink-faint2)',
                  fontWeight: 600,
                }}
              >
                {g.cont ? '1' : '0'}
              </span>
              <span
                style={{
                  padding: '5px 8px',
                  background: 'var(--lime-glow)',
                  color: 'var(--lime)',
                  letterSpacing: '0.08em',
                }}
              >
                {g.bits}
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)' }}>
              0x{g.hex}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}
      >
        <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>negative handling:</span>
        <div className="gx-seg">
          <button className={`gx-btn ${!signed ? 'on' : ''}`} onClick={() => setSigned(false)}>
            int64
          </button>
          <button className={`gx-btn ${signed ? 'on' : ''}`} onClick={() => setSigned(true)}>
            sint64 (zigzag)
          </button>
        </div>
      </div>
      {n < 0 && (
        <div className={`gx-callout ${signed ? 'ok' : 'warn'}`} style={{ margin: '16px 0 0' }}>
          {signed ? ICONS.ok : ICONS.warn}
          <div style={{ fontSize: 14 }}>
            {signed ? (
              <>
                Zigzag maps <b>−1 → 1</b>, so it fits in a <b>single byte</b>. Use{' '}
                <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                  sint32/64
                </code>{' '}
                for fields that hold negatives.
              </>
            ) : (
              <>
                A plain{' '}
                <code className="gx-kw" style={{ color: 'var(--ink)' }}>
                  int64
                </code>{' '}
                sign-extends −1 to 64 one-bits: <b>10 bytes</b> for the smallest negative number
                there is. Flip to sint64.
              </>
            )}
          </div>
        </div>
      )}
      {n >= 0 && n <= 127 && (
        <Note>
          Numbers 0–127 cost <b>one byte</b>. This is why field tags 1–15 are one byte and worth
          reserving for hot fields.
        </Note>
      )}
      {n >= 128 && n <= 16383 && (
        <Note>
          Crossed 127 → a <b>second byte</b> appeared. The continuation bit on the first byte says
          "keep reading."
        </Note>
      )}
      {n >= 16384 && (
        <Note>
          Three bytes now. Varints stay compact for small numbers and grow only as needed. That's
          the whole point.
        </Note>
      )}
    </div>
  );
}

function Note({ children }) {
  return (
    <p
      style={{
        fontSize: 13.5,
        color: 'var(--ink-dim)',
        margin: '14px 0 0',
        paddingLeft: 12,
        borderLeft: '2px solid var(--line2)',
      }}
    >
      {children}
    </p>
  );
}
