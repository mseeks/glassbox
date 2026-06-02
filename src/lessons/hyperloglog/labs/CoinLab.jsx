import { useMemo, useState } from 'react';
import Panel from '../components/Panel.jsx';
import Readout from '../components/Readout.jsx';
import Slider from '../components/Slider.jsx';
import { useCanvas } from '../components/useCanvas.js';
import { fmt } from '../components/format.js';
import { leadingZeros } from '../engine/index.js';

/* LAB 2 · THE COIN ORACLE
   Max run of leading zeros ↔ crowd size. With the re-roll, its variance. */

// Non-deterministic (uses Math.random) — kept in the lab, not the engine.
function sampleMaxRun(n) {
  let mx = 0;
  for (let i = 0; i < n; i++) {
    const r = Math.clz32((Math.random() * 4294967296) >>> 0); // leading zeros of a random 32-bit word
    if (r > mx) mx = r;
  }
  return mx;
}

export default function CoinLab() {
  const [logN, setLogN] = useState(12); // n = 2^logN, up to ~131k (live-sampled)
  const n = 1 << logN;
  const [seed, setSeed] = useState(0);
  const seqs = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      let s = '';
      for (let b = 0; b < 16; b++) s += Math.random() < 0.5 ? '0' : '1';
      out.push(s);
    }
    return out;
    // re-flip (seed) must force a fresh sample even though the body reads only Math.random
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  // re-flip (seed) must re-sample, even though sampleMaxRun closes over only n
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const maxRun = useMemo(() => sampleMaxRun(n), [n, seed]);
  const estimate = 2 ** maxRun;

  // variance scatter: 24 independent runs at this n
  const [scatterSeed, setScatterSeed] = useState(0);
  const scatter = useMemo(() => {
    const out = [];
    for (let i = 0; i < 24; i++) out.push(2 ** sampleMaxRun(n));
    return out;
    // scatterSeed forces a fresh 24-run sample on demand (button), not from n alone
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, scatterSeed]);
  const drawScatter = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const lo = Math.log2(Math.max(2, n / 64)),
      hi = Math.log2(n * 64);
    const X = (v) => ((Math.log2(Math.max(1, v)) - lo) / (hi - lo)) * (w - 24) + 12;
    // truth line
    const tx = X(n);
    ctx.strokeStyle = '#fbf6ea';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx, 6);
    ctx.lineTo(tx, h - 18);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fbf6ea';
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText('truth ' + fmt(n), tx, h - 5);
    // dots
    for (const v of scatter) {
      const x = X(v);
      const jitter = (Math.random() - 0.5) * (h - 40);
      ctx.fillStyle = 'rgba(52,221,203,.85)';
      ctx.beginPath();
      ctx.arc(x, h / 2 - 6 + jitter, 4, 0, 7);
      ctx.fill();
    }
  };
  const scRef = useCanvas(drawScatter, [scatter, n]);

  return (
    <Panel label="COIN ORACLE" sub="one register, raw">
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <div className="cap" style={{ textAlign: 'left', marginTop: 0, marginBottom: 8 }}>
            Seven items, hashed to coin-flips. Leading zeros before the first{' '}
            <span style={{ color: 'var(--magenta)' }}>1</span> are a run:
          </div>
          <div className="bitstr">
            {seqs.map((s, i) => {
              const lz = leadingZeros(s);
              return (
                <div key={i}>
                  {s.split('').map((c, j) => (
                    <span key={j} className={j < lz ? 'z' : j === lz ? 'one' : 'rest'}>
                      {c}
                    </span>
                  ))}
                  <span className="rest" style={{ marginLeft: 10, fontSize: '.82em' }}>
                    run {lz}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            className="btn cyan"
            style={{ marginTop: 10 }}
            onClick={() => setSeed((s) => s + 1)}
          >
            ↻ Re-flip the seven
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <Slider
            label="Crowd size  n  (2ⁿ)"
            display={fmt(n)}
            min={3}
            max={17}
            value={logN}
            onChange={setLogN}
          />
          <div className="readgrid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: 14 }}>
            <Readout label="Longest run seen" value={maxRun} tone="br" unit="leading zeros" />
            <Readout label="Estimate = 2^run" value={fmt(estimate)} tone="cy" />
            <Readout label="True crowd" value={fmt(n)} tone="iv" />
          </div>
          <div className="cap" style={{ textAlign: 'left' }}>
            The rarest run is a fingerprint of how many tries happened. A run of {maxRun} appears
            about once per {fmt(estimate)} draws, so seeing one whispers "about {fmt(estimate)}{' '}
            distinct items."
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div className="cap" style={{ textAlign: 'left', margin: 0, maxWidth: '40ch' }}>
              One register is a <span style={{ color: 'var(--magenta)' }}>liar</span>: 24
              independent estimates at the same true n, each snapping to a power of two.
            </div>
            <button className="btn" onClick={() => setScatterSeed((s) => s + 1)}>
              ↻ Run 24 trials
            </button>
          </div>
          <div className="cv-frame" style={{ marginTop: 12 }}>
            <canvas ref={scRef} data-aspect={0.34} />
          </div>
          <div className="cap">
            The cloud is enormous and quantised. A single coin-run is the right idea carried out
            with hopeless precision, and that is the whole reason for everything that follows. Watch
            it scatter.
          </div>
        </div>
      </div>
    </Panel>
  );
}
