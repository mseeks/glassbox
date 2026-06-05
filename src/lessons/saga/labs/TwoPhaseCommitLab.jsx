import { useEffect, useRef, useState } from 'react';
import { TPC_PARTICIPANTS, build2pc, markClass } from '../engine/index.js';
import Panel from '../components/Panel.jsx';

// §II — two-phase commit, and the freeze it hides. The coordinator either
// survives to a clean COMMIT or crashes after the votes, stranding every
// participant with its locks held. The frame model lives in the engine
// (build2pc); this widget steps through the frames. Autoplay is user-initiated
// (the Run button), so the lab is a static frame until the reader presses it.
export default function TwoPhaseCommitLab() {
  const P = TPC_PARTICIPANTS;
  const [crash, setCrash] = useState(true);
  const [frames, setFrames] = useState(() => build2pc(true));
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
  const setMode = (c) => {
    stop();
    setCrash(c);
    setFrames(build2pc(c));
    setFi(0);
  };
  const run = () => {
    stop();
    const f = build2pc(crash);
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
    }, 950);
  };
  const reset = () => {
    stop();
    setFrames(build2pc(crash));
    setFi(0);
  };
  const fr = frames[fi] || frames[0];
  return (
    <Panel
      title="lab · two-phase commit"
      note="2PC is correct whenever everyone stays alive. Its flaw is availability: a coordinator crash between the vote and the verdict freezes every participant with its locks held — a window in which the system is neither committed nor free to move."
    >
      <div className="sg-sx-controls">
        <span className="lbl">coordinator fate</span>
        <div className="sg-seg">
          <button className={!crash ? 'on vd' : ''} onClick={() => setMode(false)}>
            survives
          </button>
          <button className={crash ? 'on vm' : ''} onClick={() => setMode(true)}>
            crashes after votes
          </button>
        </div>
        <button className="sg-btn" onClick={run} disabled={playing}>
          {playing ? 'running…' : 'run ▸'}
        </button>
        <button className="sg-btn ghost" onClick={reset} disabled={playing}>
          reset
        </button>
      </div>
      <div
        className={'sg-tpc-coord sg-st ' + (fr.coord.d ? 'sg-st-fail' : '')}
        style={fr.coord.d ? {} : { borderColor: 'var(--lapis)' }}
      >
        <div className="role">Coordinator</div>
        <div className="msg" style={{ color: fr.coord.d ? 'var(--vermilion)' : 'var(--ink)' }}>
          {fr.coord.m}
        </div>
      </div>
      <div className="sg-tpc-rail">
        <span>▼&nbsp;&nbsp;prepare · vote · decide&nbsp;&nbsp;▼</span>
      </div>
      <div className="sg-tpc-parts">
        {P.map((n, idx) => (
          <div key={n} className={'sg-tpc-part sg-st ' + markClass(fr.parts[idx].c)}>
            <div className="nm">{n}</div>
            <div className="stt">{fr.parts[idx].s}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 14,
          minHeight: '4.6em',
          fontSize: '14.5px',
          lineHeight: 1.5,
          color: 'var(--ink-2)',
          fontStyle: 'italic',
        }}
      >
        {fr.cap}
      </div>
    </Panel>
  );
}
