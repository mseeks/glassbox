import { useEffect, useRef, useState } from 'react';
import { buildLU, luEvents } from '../engine/index.js';
import Panel from '../components/Panel.jsx';

// §V — two sagas, one seat. Each booking commits its own local transaction at
// once, so a second saga can read and write the same row in between. With no
// isolation spanning them, B overwrites A — a lost update — unless an optimistic
// version check refuses the stale write. The interleave frames live in the
// engine (buildLU); this widget steps through them. Autoplay is user-initiated
// (the Interleave button), so the lab is a static frame until the reader presses it.
export default function LostUpdateLab() {
  const [useV, setUseV] = useState(false);
  const [frames, setFrames] = useState(() => buildLU(false));
  const [fi, setFi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlaying(false);
  };
  const toggle = (v) => {
    stop();
    setUseV(v);
    setFrames(buildLU(v));
    setFi(0);
  };
  const run = () => {
    stop();
    const f = buildLU(useV);
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
    }, 820);
  };
  const reset = () => {
    stop();
    setFrames(buildLU(useV));
    setFi(0);
  };
  const fr = frames[fi] || frames[0];
  const ev = luEvents(useV);
  return (
    <Panel
      title="lab · two sagas, one seat"
      note="Each booking is its own local transaction that commits at once — so a second saga can read and write the same row in between. With no isolation spanning them, the fix is to rebuild one slice of it by hand: an optimistic version check that refuses a stale write."
    >
      <div className="sg-sx-controls">
        <span className="lbl">countermeasure</span>
        <div className="sg-seg">
          <button className={!useV ? 'on vm' : ''} onClick={() => toggle(false)}>
            none
          </button>
          <button className={useV ? 'on vd' : ''} onClick={() => toggle(true)}>
            version check (OCC)
          </button>
        </div>
        <button className="sg-btn" onClick={run} disabled={playing}>
          {playing ? 'running…' : 'interleave ▸'}
        </button>
        <button className="sg-btn ghost" onClick={reset} disabled={playing}>
          reset
        </button>
      </div>
      <div className="sg-lu-stage">
        <div className="sg-lu-saga">
          <h5>
            <span style={{ color: 'var(--lapis)' }} aria-hidden="true">
              ◆
            </span>{' '}
            Saga A
          </h5>
          {ev.map((t, idx) => {
            const cls = idx < fr.aShow ? fr.aMark[idx] || 'on' : '';
            return (
              <div className={'sg-lu-evt ' + cls} key={idx}>
                {t}
              </div>
            );
          })}
        </div>
        <div className="sg-lu-saga">
          <h5>
            <span style={{ color: 'var(--gold)' }} aria-hidden="true">
              ◆
            </span>{' '}
            Saga B
          </h5>
          {ev.map((t, idx) => {
            const cls = idx < fr.bShow ? fr.bMark[idx] || 'on' : '';
            return (
              <div className={'sg-lu-evt ' + cls} key={idx}>
                {t}
              </div>
            );
          })}
        </div>
      </div>
      <div className="sg-lu-shared">
        <div className="k">shared row · seats available{useV ? ' · version' : ''}</div>
        <div className="v">
          {fr.seats}
          {useV ? (
            <span style={{ fontSize: '15px', color: 'var(--ink-3)', marginLeft: 8 }}>
              v{fr.version}
            </span>
          ) : null}
        </div>
      </div>
      <div className={'sg-lu-verdict ' + fr.vc}>
        {fr.verdict || (playing ? '…' : 'choose a countermeasure, then interleave the two sagas')}
      </div>
    </Panel>
  );
}
