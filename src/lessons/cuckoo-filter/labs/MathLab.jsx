import { useState } from 'react';

function Slider({ label, ariaLabel, value, unit = '', min, max, step, onChange, sub }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontFamily: 'IBM Plex Sans',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text)',
            letterSpacing: '-0.005em',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--text)',
          }}
        >
          {value}
          {unit && (
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-mute)',
                marginLeft: 2,
                letterSpacing: '0.1em',
              }}
            >
              {' '}
              {unit}
            </span>
          )}
        </div>
      </div>
      <input
        className="cf-slider"
        type="range"
        aria-label={ariaLabel}
        aria-valuetext={unit ? `${value} ${unit}` : undefined}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div
        style={{
          fontFamily: 'IBM Plex Serif',
          fontStyle: 'italic',
          fontSize: 13,
          color: 'var(--text-mute)',
          marginTop: 6,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

export function MathLab() {
  const [fpBits, setFpBits] = useState(8);
  const [bucketSize, setBucketSize] = useState(4);
  const [alpha, setAlpha] = useState(0.95);

  const fpr = (2 * bucketSize) / Math.pow(2, fpBits);
  const bitsPerItem = fpBits / alpha;

  const W = 660,
    H = 220,
    padL = 56,
    padR = 28,
    padT = 22,
    padB = 42;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const fMin = 4,
    fMax = 20;
  const yMin = Math.pow(2, -16),
    yMax = 1;

  const xS = (f) => padL + ((f - fMin) / (fMax - fMin)) * plotW;
  const yS = (p) => {
    const c = Math.log10(p) - Math.log10(yMin);
    const span = Math.log10(yMax) - Math.log10(yMin);
    return padT + (1 - c / span) * plotH;
  };

  const curvePath = (b) => {
    let d = '';
    for (let f = fMin; f <= fMax; f += 0.25) {
      const y = (2 * b) / Math.pow(2, f);
      const yy = Math.max(yMin, Math.min(yMax, y));
      d += (d ? ' L ' : 'M ') + xS(f).toFixed(2) + ' ' + yS(yy).toFixed(2);
    }
    return d;
  };

  return (
    <div>
      <div className="cf-cols cf-cols-lab" style={{ gap: 40 }}>
        <div>
          <Slider
            label={
              <>
                Fingerprint bits &nbsp;
                <span style={{ color: 'var(--cuc)', fontStyle: 'italic', fontFamily: 'Fraunces' }}>
                  f
                </span>
              </>
            }
            ariaLabel="Fingerprint bits (f)"
            value={fpBits}
            unit="bits"
            min={4}
            max={20}
            step={1}
            onChange={setFpBits}
            sub={`${(1 << fpBits).toLocaleString()} distinct fingerprints`}
          />
          <Slider
            label={
              <>
                Slots per bucket &nbsp;
                <span style={{ color: 'var(--cuc)', fontStyle: 'italic', fontFamily: 'Fraunces' }}>
                  b
                </span>
              </>
            }
            ariaLabel="Slots per bucket (b)"
            value={bucketSize}
            min={1}
            max={8}
            step={1}
            onChange={setBucketSize}
            sub="four is the practical default"
          />
          <Slider
            label={
              <>
                Load fraction &nbsp;
                <span style={{ color: 'var(--cuc)', fontStyle: 'italic', fontFamily: 'Fraunces' }}>
                  α
                </span>
              </>
            }
            ariaLabel="Load fraction (alpha)"
            value={alpha.toFixed(2)}
            min={0.5}
            max={0.98}
            step={0.01}
            onChange={(v) => setAlpha(parseFloat(v))}
            sub={`${(alpha * 100).toFixed(0)}% full`}
          />

          <div
            style={{
              marginTop: 28,
              padding: '22px 24px',
              border: '1px solid var(--cuc)',
              background: 'var(--bg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <span className="cf-eyebrow cf-eyebrow-cuc">false-positive rate</span>
              <span
                className="cf-mono"
                style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em' }}
              >
                ≈ 2b / 2<sup>f</sup>
              </span>
            </div>
            <div className="cf-readout-big" style={{ color: 'var(--cuc)' }}>
              {fpr < 0.0001 ? fpr.toExponential(2) : (fpr * 100).toFixed(3) + '%'}
            </div>
            <div style={{ height: 1, background: 'var(--line)', margin: '20px 0 16px' }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 6,
              }}
            >
              <span className="cf-eyebrow">bits per item</span>
              <span
                className="cf-mono"
                style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em' }}
              >
                ≈ f / α
              </span>
            </div>
            <div className="cf-readout-mid" style={{ color: 'var(--text)' }}>
              {bitsPerItem.toFixed(1)}
            </div>
          </div>
        </div>

        <div>
          <div className="cf-eyebrow" style={{ marginBottom: 12 }}>
            False-positive rate vs fingerprint bits
          </div>
          <div
            className="cf-cell-strip"
            style={{ '--strip-min': '560px', '--strip-min-sm': '500px' }}
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{
                width: '100%',
                height: 'auto',
                background: 'var(--bg)',
                border: '1px solid var(--line)',
              }}
            >
              {/* Y gridlines */}
              {[0, -1, -2, -3, -4, -6, -8, -12].map((e) => {
                const y = yS(Math.pow(10, e));
                return (
                  <g key={e}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={W - padR}
                      y2={y}
                      stroke="var(--line)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={padL - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontFamily="JetBrains Mono"
                      fontSize={9.5}
                      fill="var(--text-mute)"
                      letterSpacing="0.06em"
                    >
                      {e === 0
                        ? '1'
                        : `10${String(e)
                            .replace('-', '⁻')
                            .split('')
                            .map((d) => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'[d === '⁻' ? 0 : +d + 1])
                            .join('')}`}
                    </text>
                  </g>
                );
              })}
              {/* X gridlines */}
              {[4, 8, 12, 16, 20].map((f) => (
                <g key={f}>
                  <line
                    x1={xS(f)}
                    y1={padT}
                    x2={xS(f)}
                    y2={H - padB}
                    stroke="var(--line)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={xS(f)}
                    y={H - padB + 16}
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    fontSize={10}
                    fill="var(--text-mute)"
                    letterSpacing="0.06em"
                  >
                    {f}
                  </text>
                </g>
              ))}
              <line
                x1={padL}
                y1={padT}
                x2={padL}
                y2={H - padB}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />
              <line
                x1={padL}
                y1={H - padB}
                x2={W - padR}
                y2={H - padB}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />

              {[1, 2, 4, 8].map((b) => (
                <path
                  key={b}
                  d={curvePath(b)}
                  fill="none"
                  stroke={b === bucketSize ? 'var(--cuc)' : 'var(--text-ghost)'}
                  strokeWidth={b === bucketSize ? 2 : 0.8}
                  strokeDasharray={b === bucketSize ? 'none' : '2,3'}
                />
              ))}

              <circle
                cx={xS(fpBits)}
                cy={yS(Math.max(yMin, Math.min(yMax, fpr)))}
                r={5}
                fill="var(--cuc)"
                stroke="var(--bg)"
                strokeWidth={2}
              />

              {[1, 2, 4, 8].map((b) => {
                const yy = yS(Math.max(yMin, (2 * b) / Math.pow(2, fMax - 0.2)));
                return (
                  <text
                    key={b}
                    x={W - padR - 4}
                    y={yy + 3}
                    textAnchor="end"
                    fontFamily="JetBrains Mono"
                    fontStyle="italic"
                    fontSize={10}
                    fill={b === bucketSize ? 'var(--cuc)' : 'var(--cf-label-faint)'}
                    letterSpacing="0.06em"
                  >
                    b={b}
                  </text>
                );
              })}

              <text
                x={padL + plotW / 2}
                y={H - 6}
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize={10}
                fill="var(--text-mute)"
                letterSpacing="0.18em"
              >
                FINGERPRINT BITS ƒ
              </text>
            </svg>
          </div>

          <div className="cf-eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>
            Operating points (b = 4, α = 0.95)
          </div>
          <div className="cf-table-scroll">
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line-strong)' }}>
                  {['f', 'fpr', 'bits/item', 'character'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        color: 'var(--text-mute)',
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [6, '12.5%', '6.3', 'loose, very dense'],
                  [8, '3.1%', '8.4', 'a common balance'],
                  [12, '0.20%', '12.6', 'precise; common default'],
                  [16, '0.012%', '16.8', 'rarely needed in practice'],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '7px 10px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                      {row[0]}
                    </td>
                    <td style={{ padding: '7px 10px', color: 'var(--cuc)', whiteSpace: 'nowrap' }}>
                      {row[1]}
                    </td>
                    <td style={{ padding: '7px 10px', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                      {row[2]}
                    </td>
                    <td
                      style={{
                        padding: '7px 10px',
                        color: 'var(--text-mute)',
                        fontFamily: 'IBM Plex Serif',
                        fontStyle: 'italic',
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row[3]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
