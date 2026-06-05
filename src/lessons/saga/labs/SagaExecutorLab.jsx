import { Fragment, useEffect, useRef, useState } from 'react';
import { SAGA_STEPS, SAGA_OUTCOMES, buildSagaFrames, markClass } from '../engine/index.js';
import Panel from '../components/Panel.jsx';

// §IV — the saga executor. One run of the four-step checkout saga: pick where
// the world breaks (or let it succeed) and run it. Forward steps commit left →
// right; on a failure the chain stops and the already-committed steps are
// unwound in reverse. The frame model lives in the engine (buildSagaFrames);
// this widget steps through the frames. Autoplay is user-initiated (the Run
// button), so the lab is a static frame until the reader presses it.
export default function SagaExecutorLab() {
  const [failAt, setFailAt] = useState(2);
  const [frames, setFrames] = useState(() => buildSagaFrames(2));
  const [fi, setFi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  const logRef = useRef(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [fi, frames]);
  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
  };
  const choose = (v) => {
    stop();
    setFailAt(v);
    setFrames(buildSagaFrames(v));
    setFi(0);
  };
  const run = () => {
    stop();
    const f = buildSagaFrames(failAt);
    setFrames(f);
    setFi(0);
    setPlaying(true);
    let i = 0;
    timer.current = setInterval(() => {
      i++;
      if (i >= f.length) {
        clearInterval(timer.current);
        timer.current = null;
        setPlaying(false);
        return;
      }
      setFi(i);
    }, 380);
  };
  const reset = () => {
    stop();
    setFrames(buildSagaFrames(failAt));
    setFi(0);
  };
  const fr = frames[fi] || frames[0];
  return (
    <Panel
      title="lab · the saga executor"
      note="Watch the order of events. Forward steps commit left to right; when one fails, its own local transaction simply rolls back — then only the already-committed steps are compensated, in reverse. No global rewind exists; each compensation is a fresh transaction answering an old one."
    >
      <div className="sg-sx-controls">
        <span className="lbl">outcome</span>
        <div className="sg-seg">
          {SAGA_OUTCOMES.map(([lbl, v]) => (
            <button
              key={lbl}
              className={failAt === v ? (v === null ? 'on vd' : 'on vm') : ''}
              onClick={() => choose(v)}
            >
              {lbl}
            </button>
          ))}
        </div>
        <button className="sg-btn" onClick={run} disabled={playing}>
          {playing ? 'running…' : 'run saga ▸'}
        </button>
        <button className="sg-btn ghost" onClick={reset} disabled={playing}>
          reset
        </button>
      </div>
      <div className="sg-sx-chain">
        {SAGA_STEPS.map((s, i) => (
          <Fragment key={s.key}>
            <div className={'sg-sx-step sg-st ' + markClass(fr.marks[i])}>
              <span className="badge">
                {fr.marks[i] === 'st-done'
                  ? '✓'
                  : fr.marks[i] === 'st-fail'
                    ? '✗'
                    : fr.marks[i] === 'st-comp'
                      ? '↩'
                      : i + 1}
              </span>
              <div className="svc">{s.svc}</div>
              <div className="fwd">{s.fwd}</div>
              <div className="comp">{s.comp}</div>
            </div>
            {i < SAGA_STEPS.length - 1 && (
              <div className="sg-sx-conn" aria-hidden="true">
                →
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <div className="sg-sx-ledger">
        {SAGA_STEPS.map((s) => {
          const v = fr.states[s.key];
          const col =
            v === s.done
              ? 'var(--verdigris)'
              : v === s.undone
                ? 'var(--vermilion)'
                : 'var(--ink-3)';
          return (
            <div className="sg-sx-row" key={s.key}>
              <div className="k">{s.svc}</div>
              <div className="v" style={{ color: col }}>
                {v}
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={'sg-sx-status ' + (fr.status === 'ok' ? 'ok' : fr.status === 'bad' ? 'bad' : '')}
      >
        {fr.statusText || '…'}
      </div>
      <div className="sg-sx-log" ref={logRef}>
        {fr.log.length === 0 ? (
          <div className="ln sys">the chronicle will be written here as the saga runs…</div>
        ) : (
          fr.log.map((l, k) => (
            <div className={'ln ' + l.cls} key={k}>
              {l.text}
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
