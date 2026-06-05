import { STEP_KINDS } from '../engine/index.js';

// §IV figure — the three kinds of step. Everything before the pivot is
// compensatable; the pivot is the point of no return; everything after it is
// retriable, built to keep trying until it succeeds.
export default function StepAnatomy() {
  return (
    <div className="sg-cm-grid">
      {STEP_KINDS.map((r) => (
        <div className="sg-cm-card" key={r.t} style={{ borderTopColor: r.c }}>
          <h5 style={{ color: r.c }}>{r.t}</h5>
          <div className="sub">step type</div>
          <p>{r.d}</p>
          <div className="ex sg-mono">e.g. {r.e}</div>
        </div>
      ))}
    </div>
  );
}
