import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, Check, Cpu, Play, RotateCcw } from 'lucide-react';
import {
  T1_INSTRS,
  T2_INSTRS,
  createMachine,
  flushThread1,
  flushThread2,
  isComplete,
  isBothFalse,
  stepThread1,
  stepThread2,
} from '../engine/index.js';

export function Simulator() {
  const [mode, setMode] = useState('relaxed');
  const [machine, setMachine] = useState(() => createMachine('relaxed'));
  const [memXFlash, setMemXFlash] = useState(0);
  const [memYFlash, setMemYFlash] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);

  const { t1Pc, t2Pc, t1Buffer, t2Buffer, memX, memY, r1, r2 } = machine;

  // Apply a next machine state, flashing a memory cell when it flips to true.
  const apply = (next) => {
    setMachine((prev) => {
      if (next.memX && !prev.memX) setMemXFlash((n) => n + 1);
      if (next.memY && !prev.memY) setMemYFlash((n) => n + 1);
      return next;
    });
  };

  const reset = () => apply(createMachine(mode));

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setMachine(createMachine(nextMode));
  };

  const stepT1 = () => apply(stepThread1(machine));
  const stepT2 = () => apply(stepThread2(machine));
  const flushT1 = () => apply(flushThread1(machine));
  const flushT2 = () => apply(flushThread2(machine));

  // Auto-run the bug demonstration: step both stores, then both loads (each
  // reading memory before the sibling's buffer drains), then flush both. The
  // relaxed engine produces r1 = r2 = false on its own — no forced values.
  const autoRunBug = async () => {
    if (mode !== 'relaxed') setMode('relaxed');
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    let s = createMachine('relaxed');
    apply(s);
    setAutoRunning(true);

    const sequence = [
      stepThread1,
      stepThread2,
      stepThread1,
      stepThread2,
      flushThread1,
      flushThread2,
    ];
    const delays = [700, 900, 900, 900, 900, 500];
    for (let i = 0; i < sequence.length; i++) {
      await wait(delays[i]);
      s = sequence[i](s);
      apply(s);
    }
    await wait(400);
    setAutoRunning(false);
  };

  const allDone = isComplete(machine);
  const bothFalse = isBothFalse(machine);

  return (
    <div className="sim">
      <div className="sim-header">
        <div className="sim-title">CPU · simulator</div>
        <div className="mode-toggle" role="group" aria-label="Memory ordering mode">
          <button
            className={`mode-btn ${mode === 'relaxed' ? 'active' : ''}`}
            aria-pressed={mode === 'relaxed'}
            onClick={() => selectMode('relaxed')}
          >
            Relaxed
          </button>
          <button
            className={`mode-btn ${mode === 'seqcst' ? 'active' : ''}`}
            aria-pressed={mode === 'seqcst'}
            onClick={() => selectMode('seqcst')}
          >
            SeqCst
          </button>
        </div>
      </div>

      <div className="sim-body">
        <div className="threads">
          {/* Thread 1 */}
          <div className="thread">
            <div className="thread-name">
              <Cpu size={11} /> Thread 1 · Core A
            </div>
            <div className="instructions">
              {T1_INSTRS.map((ins, i) => (
                <div
                  key={i}
                  className={`instr ${i === t1Pc ? 'next' : ''} ${i < t1Pc ? 'done' : ''}`}
                >
                  <ArrowRight size={11} className="instr-arrow" />
                  {ins}
                </div>
              ))}
            </div>
            <div className="buffer">
              <span className="buffer-label">store buffer</span>
              {t1Buffer.x !== undefined ? (
                <span className="chip" key={`t1-${t1Buffer.x}`}>
                  X = true
                </span>
              ) : (
                <span
                  style={{
                    color: 'var(--ink-label)',
                    fontSize: '0.78rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  empty
                </span>
              )}
            </div>
            <div className="register">
              <span style={{ color: 'var(--ink-dim)' }}>r1</span>
              <span className={`val ${r1 !== null ? 'has-value' : ''}`}>
                {r1 === null ? '–' : String(r1)}
              </span>
            </div>
          </div>

          {/* Thread 2 */}
          <div className="thread">
            <div className="thread-name">
              <Cpu size={11} /> Thread 2 · Core B
            </div>
            <div className="instructions">
              {T2_INSTRS.map((ins, i) => (
                <div
                  key={i}
                  className={`instr ${i === t2Pc ? 'next' : ''} ${i < t2Pc ? 'done' : ''}`}
                >
                  <ArrowRight size={11} className="instr-arrow" />
                  {ins}
                </div>
              ))}
            </div>
            <div className="buffer">
              <span className="buffer-label">store buffer</span>
              {t2Buffer.y !== undefined ? (
                <span className="chip" key={`t2-${t2Buffer.y}`}>
                  Y = true
                </span>
              ) : (
                <span
                  style={{
                    color: 'var(--ink-label)',
                    fontSize: '0.78rem',
                    fontFamily: 'JetBrains Mono',
                  }}
                >
                  empty
                </span>
              )}
            </div>
            <div className="register">
              <span style={{ color: 'var(--ink-dim)' }}>r2</span>
              <span className={`val ${r2 !== null ? 'has-value' : ''}`}>
                {r2 === null ? '–' : String(r2)}
              </span>
            </div>
          </div>
        </div>

        <div className="memory">
          <div className="memory-label">main memory · shared</div>
          <div className="memory-cells">
            <div className="mcell">
              <span className="mcell-name">X</span>
              <span className="mcell-eq">=</span>
              <span
                key={memXFlash}
                className={`mcell-val ${memX ? 'true' : ''} ${memXFlash > 0 ? 'changed' : ''}`}
              >
                {String(memX)}
              </span>
            </div>
            <div className="mcell">
              <span className="mcell-name">Y</span>
              <span className="mcell-eq">=</span>
              <span
                key={memYFlash}
                className={`mcell-val ${memY ? 'true' : ''} ${memYFlash > 0 ? 'changed' : ''}`}
              >
                {String(memY)}
              </span>
            </div>
          </div>
        </div>

        <div className="controls">
          <button className="btn" onClick={stepT1} disabled={t1Pc >= 2 || autoRunning}>
            <ArrowRight size={12} /> Step T1
          </button>
          <button className="btn" onClick={stepT2} disabled={t2Pc >= 2 || autoRunning}>
            <ArrowRight size={12} /> Step T2
          </button>
          {mode === 'relaxed' && (
            <React.Fragment>
              <button className="btn" onClick={flushT1} disabled={!t1Buffer.x || autoRunning}>
                Flush T1
              </button>
              <button className="btn" onClick={flushT2} disabled={!t2Buffer.y || autoRunning}>
                Flush T2
              </button>
            </React.Fragment>
          )}
          <button className="btn primary" onClick={autoRunBug} disabled={autoRunning}>
            <Play size={12} /> Demonstrate bug
          </button>
          <button
            className="btn"
            onClick={reset}
            disabled={autoRunning}
            style={{ marginLeft: 'auto' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        {allDone && (
          <div className={`result ${bothFalse ? 'bug' : 'safe'}`} role="status" aria-live="polite">
            <div className="result-headline">
              {bothFalse ? <AlertTriangle size={14} /> : <Check size={14} />}
              {bothFalse
                ? 'r1 = false, r2 = false. Both writes happened. Neither was visible.'
                : `r1 = ${String(r1)}, r2 = ${String(r2)}. At least one thread saw the other's write.`}
            </div>
            {bothFalse && (
              <div style={{ fontSize: '0.78rem', marginTop: '0.5rem', color: 'var(--ink-dim)' }}>
                Each thread parked its write in its own store buffer, then read main memory before
                its sibling's buffer flushed. The hardware reordered <code>store</code> and{' '}
                <code>load</code> from each thread's perspective.
              </div>
            )}
          </div>
        )}

        <div className="annot">
          {mode === 'relaxed'
            ? 'Tip: step both threads through their stores first, then their loads, then flush. That is the bug.'
            : "In SeqCst mode, all SeqCst atomics share one total order consistent with each thread's order. Both-false is impossible."}
        </div>
      </div>
    </div>
  );
}
