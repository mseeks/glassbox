import { useMemo, useRef, useState } from 'react';
import Panel from '../components/Panel.jsx';
import Readout from '../components/Readout.jsx';
import Slider from '../components/Slider.jsx';
import RegisterGrid from '../components/RegisterGrid.jsx';
import { useCanvas } from '../components/useCanvas.js';
import { fmt } from '../components/format.js';
import { hllEstimate, murmur3_32 } from '../engine/index.js';

/* LAB 6 · THE WHOLE MACHINE */

export default function MachineLab() {
  const [p, setP] = useState(10);
  const [dup, setDup] = useState(40); // duplicate rate %
  const [reg, setReg] = useState(() => new Uint8Array(1 << 10));
  const [nDistinct, setNDistinct] = useState(0);
  const [hist, setHist] = useState([]); // {n, err}
  const idRef = useRef(0);

  const reset = (np) => {
    setReg(new Uint8Array(1 << np));
    setNDistinct(0);
    setHist([]);
    idRef.current = 0;
  };
  const onP = (np) => {
    setP(np);
    reset(np);
  };

  const addItems = (K) => {
    let nd = idRef.current;
    setReg((prev) => {
      const n = prev.slice();
      for (let i = 0; i < K; i++) {
        let key;
        if (nd > 0 && Math.random() * 100 < dup)
          key = 'm' + ((Math.random() * nd) | 0); // repeat
        else {
          key = 'm' + nd;
          nd++;
        }
        const h = murmur3_32(key);
        const idx = h >>> (32 - p);
        const w = (h << p) >>> 0;
        const rank = w === 0 ? 32 - p + 1 : Math.clz32(w) + 1;
        if (rank > n[idx]) n[idx] = rank;
      }
      idRef.current = nd;
      const est = hllEstimate(n, p).E;
      const err = ((est - nd) / nd) * 100;
      setHist((H) => [...H, { n: nd, err }].slice(-160));
      setNDistinct(nd);
      return n;
    });
  };

  const m = 1 << p;
  const SE = (1.04 / Math.sqrt(m)) * 100; // theoretical std error, %
  const { E } = useMemo(() => hllEstimate(reg, p), [reg, p]);
  const err = nDistinct > 0 ? ((E - nDistinct) / nDistinct) * 100 : 0;
  const memBytes = (m * 6) / 8;

  const drawErr = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // theme-aware palette off the canvas's resolved CSS, so the trace repaints
    // deep-teal-on-pale for the lit bench instead of phosphor-on-black
    const cs = getComputedStyle(ctx.canvas);
    const tok = (name) => cs.getPropertyValue(name).trim();
    const ink = tok('--hll-cv-ink');
    const phosphor = tok('--hll-cv-phosphor');
    const phosphorFaint = tok('--hll-cv-phosphor-faint');
    const phosphorLine = tok('--hll-cv-phosphor-line');
    const phosphorLabel = tok('--hll-cv-phosphor-label');
    const cap = Math.max(SE * 2.5, 6);
    const Y = (e) => h / 2 - (e / cap) * (h / 2 - 8);
    // SE band
    ctx.fillStyle = phosphorFaint;
    ctx.fillRect(0, Y(SE), w, Y(-SE) - Y(SE));
    ctx.strokeStyle = phosphorLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, Y(SE));
    ctx.lineTo(w, Y(SE));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, Y(-SE));
    ctx.lineTo(w, Y(-SE));
    ctx.stroke();
    ctx.setLineDash([]);
    // zero line — a faint ground-truth baseline (alpha keeps it a hush in both
    // themes; --hll-cv-ink supplies the hue: ivory on dark glass, graphite on
    // the pale tray)
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = ink;
    ctx.beginPath();
    ctx.moveTo(0, Y(0));
    ctx.lineTo(w, Y(0));
    ctx.stroke();
    ctx.restore();
    // error path
    if (hist.length > 1) {
      ctx.strokeStyle = phosphor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      hist.forEach((d, i) => {
        const x = (i / (hist.length - 1)) * w;
        const y = Math.max(4, Math.min(h - 4, Y(d.err)));
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    ctx.fillStyle = phosphorLabel;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'left';
    ctx.fillText('±' + SE.toFixed(2) + '%  theoretical band', 8, 12);
  };
  const errRef = useCanvas(drawErr, [hist, SE]);

  return (
    <Panel label="THE INSTRUMENT" sub="real hash · real registers · live error">
      <div className="ctrls" style={{ marginBottom: 14 }}>
        <button className="btn cyan" onClick={() => addItems(1000)}>
          Add +1,000
        </button>
        <button className="btn primary" onClick={() => addItems(100000)}>
          Add +100,000
        </button>
        <button
          className="btn"
          onClick={() => reset(p)}
          style={{ color: 'var(--magenta)', borderColor: 'var(--magenta-dim)' }}
        >
          Reset
        </button>
      </div>
      <div className="ctrls" style={{ gap: 22 }}>
        <Slider
          label="Precision p"
          display={`p=${p} · m=${m}`}
          min={8}
          max={12}
          value={p}
          onChange={onP}
        />
        <Slider
          label="Duplicate rate"
          display={dup + '%'}
          min={0}
          max={95}
          value={dup}
          onChange={setDup}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <RegisterGrid reg={reg} p={p} />
      </div>

      <div className="readgrid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', marginTop: 16 }}>
        <Readout label="True distinct" value={fmt(nDistinct)} tone="iv" />
        <Readout label="HLL estimate" value={nDistinct ? fmt(E) : '–'} tone="cy" />
        <Readout
          label="Error"
          value={nDistinct ? (err >= 0 ? '+' : '') + err.toFixed(2) + '%' : '–'}
          tone={Math.abs(err) > SE * 1.6 ? 'mg' : 'br'}
        />
        <Readout
          label="Memory"
          value={memBytes >= 1024 ? (memBytes / 1024).toFixed(1) + ' KB' : memBytes + ' B'}
          tone="br"
          unit={`±${SE.toFixed(2)}% target`}
        />
      </div>

      <div className="cv-frame" style={{ marginTop: 14 }}>
        <canvas ref={errRef} data-aspect={0.3} />
      </div>
      <div className="cap">
        Pour in more and raise the duplicate rate. The trace barely twitches. It stays pinned inside
        the <span style={{ color: 'var(--cyan)' }}>±1.04/√m</span> band, because accuracy is set by
        the register count alone, not by how much data flows through or how often any of it repeats.
      </div>
    </Panel>
  );
}
