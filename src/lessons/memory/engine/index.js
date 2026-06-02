// Memory lesson engine — small but pure: byte-unit constants, the
// byte-pretty-printer, and the bit/character helpers the WeaveByte lab uses.
// Memory never had an extracted engine before (AGENTS.md flagged it as a
// "assess whether extraction earns its keep" candidate); colocating these
// here keeps the template consistent and makes the unit math testable.

export const KB = 1024;
export const MB = KB * 1024;
export const GB = MB * 1024;
export const TB = GB * 1024;
export const PB = TB * 1024;

// Format bytes with two-significant-digit precision and the biggest unit
// that still keeps the leading digit ≥ 1.
export function fmtBytes(b) {
  if (b < KB) return `${b} B`;
  const units = [
    ['PB', PB],
    ['TB', TB],
    ['GB', GB],
    ['MB', MB],
    ['KB', KB],
  ];
  for (const [s, v] of units) {
    if (b >= v) {
      const n = b / v;
      return `${n >= 100 ? Math.round(n) : n >= 10 ? n.toFixed(1) : n.toFixed(2)} ${s}`;
    }
  }
  return `${b} B`;
}

// Binary place values for a single byte: MSB→LSB, used by the WeaveByte lab
// to weight each ring.
export const PLACE = [128, 64, 32, 16, 8, 4, 2, 1];

// ASCII renderer for a byte: spaces print as ␣, non-printables as ·,
// everything in the printable ASCII range renders as itself.
export function charOf(code) {
  if (code === 32) return '␣';
  if (code < 32 || code > 126) return '·';
  return String.fromCharCode(code);
}
