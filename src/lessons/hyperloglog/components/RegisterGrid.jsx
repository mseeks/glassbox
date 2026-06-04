import { useMemo } from 'react';
import { useCanvas } from './useCanvas.js';
import { regColor } from './colors.js';

// Renders the m = 2^p registers as a packed grid of warm-brass cells, brighter
// for higher rank values, with an optional cyan-glow highlight on one cell.
export default function RegisterGrid({ reg, p, highlight = -1, aspect = 0.46 }) {
  const m = 1 << p;
  const maxRank = useMemo(() => {
    let mx = 1;
    for (let i = 0; i < m; i++) if (reg[i] > mx) mx = reg[i];
    return mx;
  }, [reg, m]);
  const draw = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // pull the theme-aware palette off the canvas's resolved CSS so the bank
    // repaints light-mode bronze (or dark-mode brass) instead of a fixed ramp
    const cs = getComputedStyle(ctx.canvas);
    const tok = (name) => cs.getPropertyValue(name).trim();
    const ramp = {
      off: tok('--hll-reg-off'),
      lo: tok('--hll-reg-lo'),
      hi: tok('--hll-reg-hi'),
      top: tok('--hll-reg-top'),
    };
    const phosphor = tok('--hll-cv-phosphor');
    const phosphorGlow = tok('--hll-cv-phosphor-glow');
    const cols = Math.max(1, Math.round(Math.sqrt(m * (w / h))));
    const rows = Math.ceil(m / cols);
    const gap = m > 600 ? 1 : 2;
    const cw = (w - gap * (cols - 1)) / cols;
    const ch = (h - gap * (rows - 1)) / rows;
    for (let i = 0; i < m; i++) {
      const cx = (i % cols) * (cw + gap);
      const cy = Math.floor(i / cols) * (ch + gap);
      ctx.fillStyle = regColor(reg[i], maxRank, ramp);
      const r = Math.min(2, cw / 4, ch / 4);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx, cy, Math.max(cw, 0.5), Math.max(ch, 0.5), r);
      else ctx.rect(cx, cy, Math.max(cw, 0.5), Math.max(ch, 0.5));
      ctx.fill();
      if (i === highlight) {
        ctx.strokeStyle = phosphor;
        ctx.lineWidth = 2;
        ctx.shadowColor = phosphorGlow;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  };
  const ref = useCanvas(draw, [reg, p, highlight, maxRank]);
  return (
    <div className="cv-frame">
      <canvas ref={ref} data-aspect={aspect} />
    </div>
  );
}
