import { useEffect, useMemo, useState } from 'react';
import { PID, fmt, statusFor } from '../engine/index.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import Legislator from './Legislator.jsx';

// Steps a recorded Paxos run, one step at a time. `build` returns a fresh Sim
// (re-run when `scenarioKey` changes); the reader walks Prev/Next or, when
// `autoplayable`, presses Play. Autoplay is user-initiated, so it keeps the
// timer — but the Play button itself is hidden under prefers-reduced-motion.
export default function Walkthrough({
  build,
  scenarioKey,
  witness = null,
  autoplayable = false,
  footnote,
}) {
  const reduced = usePrefersReducedMotion();
  // Each scenario is a distinct builder function, so `build` alone identifies it;
  // scenarioKey only drives the step/playing reset below.
  const sim = useMemo(() => build(), [build]);
  const steps = sim.steps;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setI(0);
    setPlaying(false);
  }, [scenarioKey]);

  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => Math.min(x + 1, steps.length - 1)), 1500);
    return () => clearTimeout(t);
  }, [playing, i, steps.length]);

  const step = steps[i];
  const last = i === steps.length - 1;
  const chosen = step.chosen;
  const showDecide = step.kind === 'decide';
  const activePid = step.pid;

  return (
    <div>
      <div className="pax-stage">
        <div className="ph">
          {step.kind.startsWith('prepare')
            ? 'Phase 1'
            : step.kind.startsWith('accept')
              ? 'Phase 2'
              : '·'}
          <span className="t">{step.title}</span>
        </div>
        <div className="d">{step.desc}</div>
      </div>

      <div className="pax-prop">
        {activePid && (
          <span className={`pax-chip ${PID[activePid].toLowerCase()}`}>
            Proposer <b>{PID[activePid]}</b>
          </span>
        )}
        {step.num && (
          <span className="pax-chip">
            ballot <b className="pax-mono">{fmt(step.num)}</b>
          </span>
        )}
        {showDecide ? (
          step.forced ? (
            <span className="pax-chip">
              wanted <span className="pax-struck">{step.intended}</span> → bound to{' '}
              <b>{step.value}</b>
            </span>
          ) : (
            <span className="pax-chip">
              free to choose <b>{step.value}</b>
            </span>
          )
        ) : step.value ? (
          <span className="pax-chip">
            decree <b>{step.value}</b>
          </span>
        ) : null}
      </div>

      <div className="pax-legs">
        {step.acceptors.map((a) => (
          <Legislator key={a.id} a={a} status={statusFor(step, a.id)} witness={witness === a.id} />
        ))}
      </div>

      <div className="pax-legend">
        <span className="lg-prep">
          <i />
          promised
        </span>
        <span className="lg-vote">
          <i />
          voted
        </span>
        <span className="lg-rej">
          <i />
          rejected
        </span>
        <span style={{ color: 'var(--ink-faint)' }}>
          quorum = {step.majority} of {step.n}
        </span>
      </div>

      {last &&
        (chosen ? (
          <div className="pax-carved">
            <span className="lb">CARVED IN MARBLE</span>
            {chosen}
          </div>
        ) : (
          <div className="pax-carved none">
            <span className="lb">NOTHING CHOSEN</span>
            The assembly never settled
          </div>
        ))}

      <div className="pax-ctrls">
        <button
          className="pax-btn ghost"
          onClick={() => setI((x) => Math.max(0, x - 1))}
          disabled={i === 0}
        >
          ← Prev
        </button>
        <button
          className="pax-btn"
          onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))}
          disabled={last}
        >
          Next →
        </button>
        {autoplayable && !reduced && (
          <button
            className="pax-btn ghost"
            onClick={() => {
              if (last) setI(0);
              setPlaying((p) => !p);
            }}
          >
            {playing ? '❚❚ Pause' : last ? '↺ Replay' : '▶ Play'}
          </button>
        )}
        <button
          className="pax-btn ghost"
          onClick={() => {
            setI(0);
            setPlaying(false);
          }}
          disabled={i === 0}
        >
          ↻ Reset
        </button>
        <span className="pax-counter">
          step {i + 1} / {steps.length}
        </span>
      </div>
      {footnote && (
        <p className="pax-prose pax-soft" style={{ fontSize: 14, marginTop: 12, marginBottom: 0 }}>
          {footnote}
        </p>
      )}
    </div>
  );
}
