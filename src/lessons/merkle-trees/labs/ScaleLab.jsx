import { useState } from 'react';
import Plate from '../components/Plate.jsx';

function fmt(n) {
  return n.toLocaleString('en-US');
}

// Slide N from 2¹ to 2³⁰ leaves; Merkle proof size scales as log₂N (a few
// hundred bytes), while shipping the whole dataset scales linearly (MB → GB).
// Bars are drawn on a log₁₀ scale so the gap is legible.
export default function ScaleLab() {
  const [exp, setExp] = useState(20);
  const N = Math.pow(2, exp);
  const proofHashes = exp;
  const proofBytes = exp * 32; // SHA-256 = 32 bytes/hash
  const naiveBytes = N * 250; // ~250 bytes per item, illustrative

  // log-scaled bar widths
  const logFull = Math.log10(Math.max(naiveBytes, 1));
  const wNaive = Math.min(100, (logFull / 12) * 100);
  const wProof = Math.min(100, (Math.log10(Math.max(proofBytes, 1)) / 12) * 100);

  return (
    <Plate style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <span
          className="mk-mono"
          style={{
            fontSize: 12,
            letterSpacing: '0.1em',
            color: 'var(--paper-faint)',
            textTransform: 'uppercase',
          }}
        >
          Dataset size
        </span>
        <span
          className="mk-mono mk-display"
          style={{ fontSize: 'clamp(20px,5vw,30px)', color: 'var(--gold-bright)' }}
        >
          {fmt(N)} <span style={{ fontSize: 14, color: 'var(--paper-dim)' }}>leaves</span>
        </span>
      </div>
      <input
        className="mk-slider"
        type="range"
        min={1}
        max={30}
        value={exp}
        onChange={(e) => setExp(+e.target.value)}
        aria-label="Dataset size (number of leaves, as a power of two)"
        aria-valuetext={`2^${exp} = ${fmt(N)} leaves`}
        style={{ margin: '16px 0 22px' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <div
            className="mk-mono"
            style={{
              fontSize: 11,
              color: 'var(--paper-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Merkle proof
          </div>
          <div className="mk-mono" style={{ fontSize: 26, color: 'var(--patina)' }}>
            {proofHashes} <span style={{ fontSize: 13 }}>hashes</span>
          </div>
          <div className="mk-mono" style={{ fontSize: 12, color: 'var(--paper-dim)' }}>
            ≈ {fmt(proofBytes)} bytes
          </div>
        </div>
        <div>
          <div
            className="mk-mono"
            style={{
              fontSize: 11,
              color: 'var(--paper-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Ship everything
          </div>
          <div className="mk-mono" style={{ fontSize: 26, color: 'var(--cinnabar)' }}>
            {naiveBytes >= 1e9
              ? (naiveBytes / 1e9).toFixed(1) + ' GB'
              : naiveBytes >= 1e6
                ? (naiveBytes / 1e6).toFixed(1) + ' MB'
                : fmt(naiveBytes) + ' B'}
          </div>
          <div className="mk-mono" style={{ fontSize: 12, color: 'var(--paper-dim)' }}>
            the whole dataset
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {[
          ['proof', wProof, 'var(--patina)'],
          ['naive', wNaive, 'var(--cinnabar)'],
        ].map(([k, w, c]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
            <span
              className="mk-mono"
              style={{ fontSize: 10.5, width: 44, color: 'var(--paper-faint)' }}
            >
              {k}
            </span>
            <div
              style={{
                flex: 1,
                height: 12,
                background: 'var(--ink-2)',
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid var(--line)',
              }}
            >
              <div
                style={{
                  width: `${w}%`,
                  height: '100%',
                  background: c,
                  transition: 'width 0.3s ease',
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        ))}
        <div
          className="mk-mono"
          style={{ fontSize: 10.5, color: 'var(--paper-faint)', textAlign: 'right', marginTop: 4 }}
        >
          bar length on a log₁₀ scale
        </div>
      </div>
    </Plate>
  );
}
