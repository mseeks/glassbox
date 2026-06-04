import React, { useState, useEffect, useMemo } from 'react';
import { Key, ArrowRight, Fingerprint, RotateCcw } from 'lucide-react';
import { sha256BlockStates, strBytes } from '../engine/index.js';
import Figure from '../components/Figure.jsx';

function StateWords({ words, prev, dim }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 6,
        fontFamily: 'var(--mono)',
      }}
    >
      {words.map((w, i) => {
        const hex = (w >>> 0).toString(16).padStart(8, '0');
        const chg = prev && prev[i] !== w;
        return (
          <div
            key={i}
            style={{
              fontSize: 11.5,
              padding: '6px 4px',
              textAlign: 'center',
              borderRadius: 6,
              border: '1px solid ' + (chg ? 'var(--copper)' : 'var(--line)'),
              background: chg ? 'var(--copper-glow)' : 'var(--void-2)',
              color: dim ? 'var(--bone-faint)' : chg ? 'var(--copper-bright)' : 'var(--bone-dim)',
              transition: 'all .35s ease',
              letterSpacing: '.02em',
            }}
          >
            {hex}
          </div>
        );
      })}
    </div>
  );
}

export default function AssemblyLineLab() {
  const [msg, setMsg] = useState('attack at dawn, and again at dusk for good measure');
  const data = useMemo(() => sha256BlockStates(strBytes(msg)), [msg]);
  const [step, setStep] = useState(0); // 0 = IV, k = after block k-1
  const maxStep = data.nBlocks;
  useEffect(() => {
    setStep(0);
  }, [msg]);

  const cur = data.states[Math.min(step, maxStep)];
  const prev = step > 0 ? data.states[step - 1] : null;
  const done = step >= maxStep;

  return (
    <Figure
      label="Fig. 3 · Merkle–Damgård"
      title="A workpiece, threaded down the line"
      foot={
        <>
          The chaining state is the workpiece. It starts as a fixed value (the IV, drawn from the
          square roots of the first eight primes, a "nothing-up-my-sleeve" number proving no
          backdoor was planted). Each 512-bit block is stamped into it by the compression function.
          The final workpiece <em>is</em> the digest. Note that last block: it carries the padding,
          a single <code className="ic">1</code> bit, zeros, then the message length, so two inputs
          of different lengths can never align.
        </>
      }
    >
      <label className="field-label">message</label>
      <input
        className="field"
        aria-label="Message to hash"
        value={msg}
        maxLength={120}
        spellCheck={false}
        onChange={(e) => setMsg(e.target.value)}
      />
      <div
        style={{
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          marginTop: 10,
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: 'var(--bone-faint)',
        }}
      >
        <span>{data.msgLen} bytes</span>
        <span>→ {data.paddedLen} padded</span>
        <span>
          →{' '}
          <span style={{ color: 'var(--copper)' }}>
            {data.nBlocks} block{data.nBlocks > 1 ? 's' : ''}
          </span>{' '}
          of 512 bits
        </span>
      </div>

      {/* the line */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, flexWrap: 'wrap' }}
      >
        <div className="chip ste">
          <Key size={11} /> IV
        </div>
        {Array.from({ length: maxStep }).map((_, i) => {
          const active = step === i + 1;
          const passed = step >= i + 1;
          const isPad = i === maxStep - 1;
          return (
            <React.Fragment key={i}>
              <ArrowRight
                size={13}
                style={{ color: passed ? 'var(--copper)' : 'var(--line-bright)', flexShrink: 0 }}
              />
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  padding: '6px 9px',
                  borderRadius: 7,
                  border:
                    '1px solid ' +
                    (active ? 'var(--copper)' : passed ? 'var(--line-bright)' : 'var(--line)'),
                  background: active ? 'var(--copper-glow)' : 'var(--void-2)',
                  color: active
                    ? 'var(--copper-bright)'
                    : passed
                      ? 'var(--bone-dim)'
                      : 'var(--bone-faint-fn)',
                  transition: 'all .3s',
                  whiteSpace: 'nowrap',
                }}
              >
                B{i}
                {isPad ? '·pad' : ''}
              </div>
            </React.Fragment>
          );
        })}
        <ArrowRight
          size={13}
          style={{ color: done ? 'var(--copper)' : 'var(--line-bright)', flexShrink: 0 }}
        />
        <div
          className="chip"
          style={{
            color: done ? 'var(--jade)' : 'var(--bone-faint)',
            borderColor: done ? 'var(--jade)' : 'var(--line)',
          }}
        >
          <Fingerprint size={11} /> digest
        </div>
      </div>

      {/* current state */}
      <div style={{ marginTop: 16 }}>
        <div className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {step === 0
              ? 'initial state (IV)'
              : done
                ? 'final state = the digest'
                : `state after block ${step - 1}`}
          </span>
          <span style={{ color: done ? 'var(--jade)' : 'var(--copper)' }}>
            {done ? '✓ complete' : `${step}/${maxStep}`}
          </span>
        </div>
        <StateWords words={cur} prev={prev} dim={false} />
      </div>

      <div className="btn-row" style={{ marginTop: 15 }}>
        <button
          className="btn primary"
          disabled={done}
          onClick={() => setStep((s) => Math.min(s + 1, maxStep))}
        >
          <ArrowRight size={14} /> Stamp next block
        </button>
        <button className="btn" onClick={() => setStep(0)}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </Figure>
  );
}
