// Presentational colour helpers — pure, but about pixels not HLL math, so they
// live here rather than in the engine. hx parses a hex triple, mix lerps two
// hex colours, and regColor maps a register value to a warm-brass intensity
// (white-hot at the very top of the range).

// Module-private helpers — only regColor (below) is consumed outside this file.
const hx = (s) => [
  parseInt(s.slice(1, 3), 16),
  parseInt(s.slice(3, 5), 16),
  parseInt(s.slice(5, 7), 16),
];

const mix = (a, b, t) => {
  const A = hx(a),
    B = hx(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
};

// register value -> warm brass intensity (white-hot at the very top)
export function regColor(v, maxv) {
  if (v <= 0) return '#1b1f29';
  const t = Math.min(1, v / Math.max(1, maxv));
  if (t < 0.8) return mix('#4a3a18', '#f0bf5e', t / 0.8);
  return mix('#f0bf5e', '#fff4d6', (t - 0.8) / 0.2);
}
