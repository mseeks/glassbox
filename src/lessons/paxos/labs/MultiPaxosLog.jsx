import { useCallback, useEffect, useState } from 'react';
import { DECREES } from '../engine/index.js';

// §VI — a replicated log is one Paxos instance per slot. Plain Paxos pays both
// phases on every slot (2 round trips); a stable leader runs Phase 1 once, then
// each decree costs a single round trip. Add decrees and watch the cost.
export default function MultiPaxosLog() {
  const [leader, setLeader] = useState(true);
  const [filled, setFilled] = useState(0);
  const [rt, setRt] = useState(0);
  const reset = useCallback(() => {
    setFilled(0);
    setRt(0);
  }, []);
  useEffect(() => {
    reset();
  }, [leader, reset]);
  const addOne = () => {
    if (filled >= 6) return;
    const cost = leader ? (filled === 0 ? 2 : 1) : 2; // leader pays Phase 1 once, then 1 RT/slot
    setRt((r) => r + cost);
    setFilled((f) => f + 1);
  };
  const perCmd = leader ? '1 round trip' : '2 round trips';
  return (
    <div className="pax-lab">
      <div className="pax-lab-h">
        <span className="pax-lab-t">The Legal Code</span>
        <div className="pax-seg">
          <button className={leader ? '' : 'on'} onClick={() => setLeader(false)}>
            Plain
          </button>
          <button className={leader ? 'on' : ''} onClick={() => setLeader(true)}>
            Stable leader
          </button>
        </div>
      </div>
      <p className="pax-lab-sub">
        A log is one Paxos instance per slot. Add decrees and watch the cost.
      </p>
      <div className="pax-slots">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`pax-slot ${i < filled ? 'full' : ''}`}>
            <div className="si">slot {i}</div>
            {i < filled && <div className="sv">{DECREES[i]}</div>}
          </div>
        ))}
      </div>
      <div className="pax-ctrls">
        <button className="pax-btn" onClick={addOne} disabled={filled >= 6}>
          Propose next decree
        </button>
        <button className="pax-btn ghost" onClick={reset} disabled={filled === 0}>
          ↻ Reset
        </button>
        <span className="pax-counter">{filled} / 6 filled</span>
      </div>
      <div className="pax-readout">
        <span className="pax-rtbar">
          round trips so far: <b>{rt}</b>
        </span>
        <span>
          cost per decree: <b>{perCmd}</b>
        </span>
      </div>
      <div className={`pax-insight ${leader ? 'gold' : ''}`}>
        {leader ? (
          <>
            A stable leader runs Phase 1 <span className="pax-strong">once</span> for all future
            slots, then each decree needs only Phase 2 — one round trip. This is what makes
            consensus practical, and it's why a healthy cluster looks so calm.
          </>
        ) : (
          <>
            Plain Paxos pays both phases on every slot: two round trips each. Correct, but slow. The
            fix is to stop re-running Phase 1 — elect a leader.
          </>
        )}
      </div>
    </div>
  );
}
