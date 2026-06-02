import { useState } from 'react';
import { altIndex, fingerprintOf, fpHex, indexOf } from '../engine/index.js';

export function XorPactLab() {
  const NB = 16;
  const FP_BITS = 8;
  const [fp, setFp] = useState(() => fingerprintOf('quill', FP_BITS));
  const [primary, setPrimary] = useState(3);
  const [exemplars] = useState(() => [
    'amber',
    'birch',
    'cedar',
    'dune',
    'ember',
    'fern',
    'grove',
    'haze',
  ]);

  const partner = altIndex(primary, fp, NB);
  const partnerOfPartner = altIndex(partner, fp, NB);

  function pickExemplar(name) {
    setFp(fingerprintOf(name, FP_BITS));
    setPrimary(indexOf(name, NB));
  }
  function shuffleFp() {
    const r = Math.floor(Math.random() * ((1 << FP_BITS) - 1)) + 1;
    setFp(r);
  }

  return (
    <div>
      <div className="cf-cols cf-cols-lab-wide">
        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 14 }}>
            Bucket array — m = {NB}
          </div>
          <div className="cf-cell-strip">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${NB}, 1fr)`,
                gap: 4,
                marginBottom: 8,
              }}
            >
              {Array.from({ length: NB }).map((_, i) => {
                const isPrimary = i === primary;
                const isPartner = i === partner;
                return (
                  <button
                    key={i}
                    onClick={() => setPrimary(i)}
                    style={{
                      appearance: 'none',
                      cursor: 'pointer',
                      border: 'none',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 4,
                      background: 'none',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: 9,
                        textAlign: 'center',
                        letterSpacing: '0.12em',
                        color: isPrimary
                          ? 'var(--cuc)'
                          : isPartner
                            ? 'var(--steel)'
                            : 'var(--text-mute)',
                        fontWeight: isPrimary || isPartner ? 600 : 400,
                      }}
                    >
                      {i.toString().padStart(2, '0')}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: 0.9,
                        background: isPrimary
                          ? 'var(--cuc)'
                          : isPartner
                            ? 'var(--steel)'
                            : 'transparent',
                        border: `1px solid ${isPrimary ? 'var(--cuc)' : isPartner ? 'var(--steel)' : 'var(--line)'}`,
                        transition: 'all 0.25s ease',
                        color: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'JetBrains Mono',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {isPrimary ? 'i₁' : isPartner ? 'i₂' : ''}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* arc */}
            <svg viewBox={`0 0 ${NB * 30} 70`} style={{ width: '100%', height: 70, marginTop: 6 }}>
              {(() => {
                const cellW = (NB * 30) / NB;
                const xP = primary * cellW + cellW / 2;
                const xQ = partner * cellW + cellW / 2;
                const xMid = (xP + xQ) / 2;
                const arcH = 28 + Math.abs(xP - xQ) * 0.08;
                return (
                  <>
                    <path
                      d={`M ${xP} 6 Q ${xMid} ${6 + arcH} ${xQ} 6`}
                      stroke="var(--cuc)"
                      strokeWidth={1.4}
                      fill="none"
                      strokeDasharray="3,3"
                    />
                    <circle cx={xP} cy={6} r={3.5} fill="var(--cuc)" />
                    <circle cx={xQ} cy={6} r={3.5} fill="var(--steel)" />
                    <text
                      x={xMid}
                      y={6 + arcH + 14}
                      textAnchor="middle"
                      fontFamily="JetBrains Mono"
                      fontSize={11}
                      fill="var(--text-mute)"
                      letterSpacing="2"
                    >
                      ⊕ hash(fp) mod m
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Equation, current instance */}
          <div
            style={{
              border: '1px solid var(--line)',
              background: 'var(--bg-1)',
              padding: '20px 24px',
              marginTop: 16,
              fontFamily: 'JetBrains Mono',
              fontSize: 13.5,
              lineHeight: 2,
            }}
          >
            <div>
              <span style={{ color: 'var(--cuc)', fontWeight: 700 }}>{primary}</span> ⊕ hash(
              <span style={{ color: 'var(--text)' }}>{fpHex(fp, FP_BITS)}</span>) mod {NB} =&nbsp;
              <span style={{ color: 'var(--steel)', fontWeight: 700 }}>{partner}</span>
            </div>
            <div>
              <span style={{ color: 'var(--steel)', fontWeight: 700 }}>{partner}</span> ⊕ hash(
              <span style={{ color: 'var(--text)' }}>{fpHex(fp, FP_BITS)}</span>) mod {NB} =&nbsp;
              <span style={{ color: 'var(--cuc)', fontWeight: 700 }}>{partnerOfPartner}</span>
              <span
                style={{
                  color: 'var(--text-mute)',
                  fontFamily: 'IBM Plex Serif',
                  fontStyle: 'italic',
                  fontSize: 13,
                  marginLeft: 14,
                }}
              >
                // back where we started
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 10 }}>
            The fingerprint
          </div>
          <div
            style={{
              padding: '22px 24px',
              border: '1px solid var(--cuc)',
              background: 'var(--cuc)',
              color: 'var(--bg)',
              marginBottom: 18,
            }}
          >
            <div className="cf-fp-display">{fpHex(fp, FP_BITS)}</div>
            <div
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 10,
                opacity: 0.7,
                letterSpacing: '0.2em',
                marginTop: 8,
              }}
            >
              {fp.toString(2).padStart(FP_BITS, '0')} &nbsp;·&nbsp; {FP_BITS}-BIT
            </div>
          </div>
          <button
            className="cf-btn"
            onClick={shuffleFp}
            style={{ width: '100%', justifyContent: 'center', marginBottom: 24 }}
          >
            new fingerprint
          </button>

          <div className="cf-eyebrow" style={{ marginBottom: 10 }}>
            Or from a word
          </div>
          <div className="cf-cols-exemplars">
            {exemplars.map((e) => (
              <button
                key={e}
                className="cf-btn"
                onClick={() => pickExemplar(e)}
                style={{
                  fontSize: 10,
                  padding: '6px 10px',
                  justifyContent: 'flex-start',
                  letterSpacing: '0.1em',
                }}
              >
                "{e}"
              </button>
            ))}
          </div>

          <div className="cf-eyebrow" style={{ marginTop: 22, marginBottom: 8 }}>
            Or any bucket
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Serif',
              fontStyle: 'italic',
              fontSize: 13.5,
              color: 'var(--text-mute)',
              lineHeight: 1.55,
            }}
          >
            tap any cell to set the primary. The partner — in steel — follows from the equation,
            wherever the primary moves.
          </div>
        </div>
      </div>
    </div>
  );
}
