import { useEffect, useRef, useState } from 'react';
import Panel from '../components/Panel.jsx';
import Readout from '../components/Readout.jsx';
import { fmt } from '../components/format.js';

/* LAB 1 · THE HOOK
   O(n) exact memory vs O(1) HyperLogLog memory, as a stream pours in. */

export default function HookLab() {
  const [n, setN] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef(0);
  // The stream loop only runs after the user presses "Open the tap" — it is
  // user-initiated motion, so it is intentionally not gated on reduced-motion.
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const tick = (t) => {
      const dt = t - last;
      last = t;
      setN((x) => x + Math.round(dt * 6.0)); // ~6k distinct/sec
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const exactBytes = n * 24; // a hash-set slot, generously ~24 B/item
  const hllBytes = (16384 * 6) / 8; // p=14 dense registers = 12,288 B (constant)
  const capBytes = 8 * 1024 * 1024; // 8 MB chart ceiling
  const exactPct = Math.min(100, (exactBytes / capBytes) * 100);
  const hllPct = Math.max(0.4, (hllBytes / capBytes) * 100);
  const human = (b) =>
    b >= 1048576
      ? (b / 1048576).toFixed(1) + ' MB'
      : b >= 1024
        ? (b / 1024).toFixed(1) + ' KB'
        : b + ' B';

  return (
    <Panel label="MEMORY METER" sub="exact count vs HyperLogLog">
      <div className="ctrls" style={{ marginBottom: 18 }}>
        <button className={`btn ${running ? '' : 'primary'}`} onClick={() => setRunning((r) => !r)}>
          {running ? '■ Pause stream' : '▶ Open the tap'}
        </button>
        <button className="btn" onClick={() => setN((x) => x + 250000)}>
          Surge +250k
        </button>
        <button
          className="btn"
          onClick={() => {
            setRunning(false);
            setN(0);
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--magenta)',
              marginBottom: 6,
            }}
          >
            <span>Exact hash-set · O(n)</span>
            <span>
              {human(exactBytes)}
              {exactBytes > capBytes ? '  ↗ off-chart' : ''}
            </span>
          </div>
          <div
            style={{
              height: 22,
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: exactPct + '%',
                background: 'linear-gradient(90deg, var(--magenta-dim), var(--magenta))',
                transition: 'width .1s linear',
              }}
            />
          </div>
        </div>
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--cyan)',
              marginBottom: 6,
            }}
          >
            <span>HyperLogLog · O(1)</span>
            <span>{human(hllBytes)} · fixed</span>
          </div>
          <div
            style={{
              height: 22,
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: hllPct + '%',
                background: 'linear-gradient(90deg, var(--cyan-dim), var(--cyan))',
                boxShadow: '0 0 12px var(--cyan-glow)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="readgrid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 18 }}>
        <Readout label="Distinct seen" value={fmt(n)} tone="iv" />
        <Readout label="Exact cost" value={human(exactBytes)} tone="mg" />
        <Readout label="HLL cost" value={human(hllBytes)} tone="cy" />
      </div>
      <div className="cap">
        The exact set must remember every key it has ever seen, so its bar never stops climbing. The
        estimator's bar cannot move. Its memory was fixed before the first item ever arrived.
      </div>
    </Panel>
  );
}
