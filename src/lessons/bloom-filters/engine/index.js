/**
 * Bloom filter mathematics — pure functions, no React, no DOM.
 *
 * Extracted from BloomFiltersLesson.jsx so the engine can be unit tested
 * and reused (the lesson re-exports these to keep its render code thin).
 *
 *   fnv1a / djb2          — 32-bit non-cryptographic string hashes.
 *   bloomPositions        — Kirsch-Mitzenmacher double hashing: simulates
 *                           k independent hashes from two real ones.
 *   falsePositiveRate     — Classic closed form: (1 - e^(-kn/m))^k.
 *   optimalK              — (m/n) * ln 2, rounded, clamped at 1.
 *   bitsPerElement        — -log2(p) / ln 2, target FPR -> m/n.
 */

/**
 * 32-bit FNV-1a hash.
 * @param {string} str
 * @returns {number} 32-bit unsigned integer
 */
export function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Bernstein djb2 hash.
 * @param {string} str
 * @returns {number} 32-bit unsigned integer
 */
export function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h >>> 0;
}

/**
 * Kirsch-Mitzenmacher double hashing: produce k bit positions in [0, m)
 * from two real hashes h1, h2. h2 is forced odd so successive offsets do
 * not collapse to a single residue class mod even m.
 * @param {string} str
 * @param {number} k  number of bits to set / probe
 * @param {number} m  filter width in bits
 * @returns {number[]}
 */
export function bloomPositions(str, k, m) {
  const h1 = fnv1a(str);
  const h2 = djb2(str) | 1;
  const positions = [];
  for (let i = 0; i < k; i++) {
    const p = (h1 + i * h2) >>> 0;
    positions.push(p % m);
  }
  return positions;
}

/**
 * Theoretical false-positive rate for a Bloom filter holding n items in
 * m bits with k hashes.
 */
export function falsePositiveRate(m, n, k) {
  if (n === 0) return 0;
  return Math.pow(1 - Math.exp((-k * n) / m), k);
}

/** Optimal hash count for given m, n: round((m/n) * ln 2), at least 1. */
export function optimalK(m, n) {
  if (n === 0) return 1;
  return Math.max(1, Math.round((m / n) * Math.LN2));
}

/** Bits-per-element to achieve a target FPR p in [0, 1). */
export function bitsPerElement(targetFPR) {
  return -Math.log2(targetFPR) / Math.LN2;
}
