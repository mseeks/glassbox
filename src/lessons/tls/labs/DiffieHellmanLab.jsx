import { useState, useEffect } from 'react';
import { KeyRound, Globe, Server, Lock, Check, Eye, ShieldAlert } from 'lucide-react';
import { modpow, discreteLog, mix, hslToHex, DH_P, DH_G } from '../engine/index.js';
import Swatch from '../components/Swatch.jsx';

// §3 — Diffie–Hellman, shown twice: as mixing paint, and as real modular
// exponentiation over p=23, g=5. Drag each side's secret; watch both ends
// derive the identical secret; let the eavesdropper try to break it.
export default function DiffieHellmanLab() {
  const [mode, setMode] = useState('paint');
  const [a, setA] = useState(6),
    [b, setB] = useState(15);
  const [hueA, setHueA] = useState(355),
    [hueB, setHueB] = useState(212);
  const [cracked, setCracked] = useState(false);
  useEffect(() => setCracked(false), [a, b, mode]);

  // PAINT
  const BASE = '#cdba46';
  const colA = hslToHex(hueA, 72, 56),
    colB = hslToHex(hueB, 72, 56);
  const sentA = mix(BASE, colA),
    sentB = mix(BASE, colB);
  const sharedPaint = mix(BASE, colA, colB); // both sides mix the same three paints

  // NUMBERS (real modular exponentiation)
  const A = modpow(DH_G, BigInt(a), DH_P);
  const B = modpow(DH_G, BigInt(b), DH_P);
  const sharedA = modpow(B, BigInt(a), DH_P);
  const sharedB = modpow(A, BigInt(b), DH_P);
  const recovered = cracked ? discreteLog(DH_G, A, DH_P) : null;

  const paint = mode === 'paint';

  const Party = ({ side, color, hue, setHue, exp, setExp, pub, shared, accent }) => (
    <div className="tls-party">
      <div className="nm">
        {side === 'client' ? <Globe size={13} /> : <Server size={13} />}
        {side === 'client' ? 'CLIENT' : 'SERVER'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <KeyRound size={13} style={{ color: 'var(--brass)' }} />
        <span
          className="tls-mono"
          style={{ fontSize: 10.5, letterSpacing: '.1em', color: 'var(--brass)' }}
        >
          SECRET (never sent)
        </span>
      </div>
      {paint ? (
        <input
          type="range"
          className="tls-range brass"
          aria-label={`${side === 'client' ? 'Client' : 'Server'} secret colour hue`}
          min={0}
          max={359}
          value={hue}
          onChange={(e) => setHue(+e.target.value)}
        />
      ) : (
        <div>
          <input
            type="range"
            className="tls-range brass"
            aria-label={`${side === 'client' ? 'Client' : 'Server'} secret exponent`}
            min={1}
            max={22}
            value={exp}
            onChange={(e) => setExp(+e.target.value)}
          />
          <span className="tls-mono" style={{ fontSize: 12, color: 'var(--brass-bright)' }}>
            {side === 'client' ? 'a' : 'b'} = {exp}
          </span>
        </div>
      )}
      {paint && <Swatch color={color} size={34} lock label="your colour" />}

      <div style={{ height: 1, background: 'var(--line-soft)', margin: '13px 0' }} />
      <div
        className="tls-mono"
        style={{ fontSize: 10, letterSpacing: '.1em', color: 'var(--bone-faint)', marginBottom: 7 }}
      >
        ↑ SENDS IN THE OPEN
      </div>
      {paint ? (
        <Swatch color={pub} size={34} />
      ) : (
        <div className="tls-mono" style={{ fontSize: 14, color: 'var(--bone)' }}>
          {side === 'client' ? 'A' : 'B'} = {DH_G.toString()}
          <sup>{exp}</sup> mod {DH_P.toString()} = <b style={{ color: accent }}>{pub.toString()}</b>
        </div>
      )}

      <div style={{ height: 1, background: 'var(--line-soft)', margin: '13px 0' }} />
      <div
        className="tls-mono"
        style={{ fontSize: 10, letterSpacing: '.1em', color: 'var(--aqua)', marginBottom: 7 }}
      >
        DERIVES SHARED SECRET
      </div>
      {paint ? (
        <Swatch color={shared} size={40} lock />
      ) : (
        <div className="tls-mono" style={{ fontSize: 18, color: 'var(--aqua-bright)' }}>
          <Lock size={13} style={{ verticalAlign: 'middle', color: 'var(--aqua)' }} />{' '}
          {shared.toString()}
        </div>
      )}
    </div>
  );

  return (
    <div className="tls-panel tls-rv" style={{ padding: 18 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div className="tls-seg">
          <button className={`tls-segbtn ${paint ? 'on' : ''}`} onClick={() => setMode('paint')}>
            Paint
          </button>
          <button className={`tls-segbtn ${!paint ? 'on' : ''}`} onClick={() => setMode('numbers')}>
            Real numbers
          </button>
        </div>
        <span className="tls-mono" style={{ fontSize: 11, color: 'var(--bone-faint)' }}>
          {paint ? 'drag each secret colour' : `public: p = ${DH_P}, g = ${DH_G}`}
        </span>
      </div>

      <div className="tls-grid2">
        <Party
          side="client"
          color={colA}
          hue={hueA}
          setHue={setHueA}
          exp={a}
          setExp={setA}
          pub={paint ? sentA : A}
          shared={paint ? sharedPaint : sharedA}
          accent="var(--aqua-bright)"
        />
        <Party
          side="server"
          color={colB}
          hue={hueB}
          setHue={setHueB}
          exp={b}
          setExp={setB}
          pub={paint ? sentB : B}
          shared={paint ? sharedPaint : sharedB}
          accent="var(--brass-bright)"
        />
      </div>

      {/* the match */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
        <span
          className="tls-chip"
          style={{
            borderColor: 'var(--aqua)',
            color: 'var(--aqua-bright)',
            background: 'rgba(70,214,198,.08)',
            fontSize: 12.5,
          }}
        >
          <Check size={14} /> both sides now hold the identical secret
          {!paint && ` = ${sharedA.toString()}`}
        </span>
      </div>

      {/* PUBLIC CHANNEL + EAVESDROPPER */}
      <div className="tls-inset" style={{ padding: 14, borderColor: 'var(--verm-deep)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Eye size={15} style={{ color: 'var(--verm)' }} />
          <span
            className="tls-mono"
            style={{ fontSize: 10.5, letterSpacing: '.12em', color: 'var(--verm)' }}
          >
            EVERYTHING THE EAVESDROPPER CAPTURED
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {paint ? (
            <>
              <Swatch color={BASE} size={28} label="base" />
              <Swatch color={sentA} size={28} label="A→" />
              <Swatch color={sentB} size={28} label="B→" />
            </>
          ) : (
            <span className="tls-mono" style={{ fontSize: 13, color: 'var(--steel)' }}>
              p={DH_P.toString()} · g={DH_G.toString()} · A={A.toString()} · B={B.toString()}
            </span>
          )}
        </div>

        <div style={{ height: 1, background: 'var(--line-soft)', margin: '12px 0' }} />

        {paint ? (
          <p className="tls-prose" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
            To reach the shared paint, the eavesdropper would have to <em>un-mix</em> a sent colour
            back into its secret — and pulling one paint out of a blend is the hard part. Mixing is
            easy; separating is effectively impossible.
          </p>
        ) : recovered === null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="tls-btn ghost" onClick={() => setCracked(true)}>
              crack the discrete log
            </button>
            <span className="tls-prose" style={{ fontSize: 13, margin: 0 }}>
              They must recover a secret exponent from a public value — solve{' '}
              <span className="tls-mono">
                g<sup>?</sup> mod p = A
              </span>
              .
            </span>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <ShieldAlert size={15} style={{ color: 'var(--verm)' }} />
              <span className="tls-mono" style={{ fontSize: 13, color: 'var(--verm-bright)' }}>
                recovered a = {recovered.toString()} → shared secret ={' '}
                {modpow(B, recovered, DH_P).toString()}
              </span>
            </div>
            <p className="tls-prose" style={{ fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>
              Feasible here <strong>only</strong> because p = 23 — about {DH_P.toString()} guesses.
              Real TLS uses a ~2048-bit prime, or an elliptic curve: the same brute force would
              outlast the universe. The wall is real; we just shrank it so you could see over it.
            </p>
          </div>
        )}
      </div>

      <p className="tls-prose" style={{ fontSize: 12.5, marginTop: 12, lineHeight: 1.5 }}>
        Paint and numbers are the <em>same trick</em>: an operation easy to perform and effectively
        impossible to reverse. Mixing ↔ exponentiation; un-mixing ↔ the discrete logarithm. Modern
        TLS uses the elliptic-curve flavour, <span className="tls-mono">ECDHE</span> — smaller,
        faster, same idea.
      </p>
    </div>
  );
}
