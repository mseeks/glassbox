/**
 * HyperLogLog — the real, numerically-verified MurmurHash3 + HyperLogLog math.
 *
 * Pure functions only: no React, no DOM, no JSX. Everything here is
 * deterministic given its inputs (buildReg seeds itself from murmur3 of
 * "h" + i, so it is reproducible), which lets the labs and the test suite share
 * exactly the same arithmetic that drives every on-screen reading.
 *
 *   murmur3_32     — MurmurHash3 x86_32 over a UTF-8 string with an optional seed.
 *   alphaM         — the HyperLogLog bias-correction constant for m registers.
 *   bucketAndRank  — split a 32-bit hash into [register index, rank = lz+1].
 *   hllEstimate    — the full estimator (raw / linear / large-range modes).
 *   bits32         — a 32-bit hash as a zero-padded binary string.
 *   leadingZeros   — count leading "0" characters of a bit string.
 *   buildReg       — deterministically fill p-precision registers with n items.
 *
 * Note: Math.random()-based helpers (e.g. sampleMaxRun) are NOT here — they are
 * non-deterministic and live inside the lab that uses them.
 */

export function murmur3_32(key, seed = 0) {
  let h = seed >>> 0;
  const data = new TextEncoder().encode(key);
  const len = data.length;
  const nblocks = len >> 2;
  let i = 0,
    k1;
  for (let b = 0; b < nblocks; b++) {
    k1 = (data[i] | (data[i + 1] << 8) | (data[i + 2] << 16) | (data[i + 3] << 24)) >>> 0;
    i += 4;
    k1 = Math.imul(k1, 0xcc9e2d51) >>> 0;
    k1 = ((k1 << 15) | (k1 >>> 17)) >>> 0;
    k1 = Math.imul(k1, 0x1b873593) >>> 0;
    h ^= k1;
    h = ((h << 13) | (h >>> 19)) >>> 0;
    h = (Math.imul(h, 5) + 0xe6546b64) >>> 0;
  }
  k1 = 0;
  switch (len & 3) {
    case 3:
      k1 ^= data[i + 2] << 16;
    // falls through
    case 2:
      k1 ^= data[i + 1] << 8;
    // falls through
    case 1:
      k1 ^= data[i];
      k1 = Math.imul(k1, 0xcc9e2d51) >>> 0;
      k1 = ((k1 << 15) | (k1 >>> 17)) >>> 0;
      k1 = Math.imul(k1, 0x1b873593) >>> 0;
      h ^= k1;
  }
  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

export function alphaM(m) {
  if (m === 16) return 0.673;
  if (m === 32) return 0.697;
  if (m === 64) return 0.709;
  return 0.7213 / (1 + 1.079 / m);
}

// index (top p bits) and rank (leading zeros of the rest, +1) for a 32-bit hash
export function bucketAndRank(h, p) {
  const idx = h >>> (32 - p);
  const w = (h << p) >>> 0;
  const rank = w === 0 ? 32 - p + 1 : Math.clz32(w) + 1;
  return [idx, rank];
}

export function hllEstimate(reg, p) {
  const m = 1 << p;
  let sum = 0,
    zeros = 0;
  for (let j = 0; j < m; j++) {
    sum += 2 ** -reg[j];
    if (reg[j] === 0) zeros++;
  }
  let E = (alphaM(m) * m * m) / sum;
  let mode = 'raw';
  if (E <= 2.5 * m && zeros > 0) {
    E = m * Math.log(m / zeros);
    mode = 'linear';
  }
  const TWO32 = 4294967296;
  if (E > TWO32 / 30) {
    E = -TWO32 * Math.log(1 - E / TWO32);
    mode = 'large';
  }
  return { E, mode, zeros };
}

// 32-bit binary string
export const bits32 = (h) => h.toString(2).padStart(32, '0');
export const leadingZeros = (str) => {
  let n = 0;
  for (const c of str) {
    if (c === '0') n++;
    else break;
  }
  return n;
};

// Deterministically fill p-precision registers with n items keyed "h" + i.
export function buildReg(p, n) {
  const reg = new Uint8Array(1 << p);
  for (let i = 0; i < n; i++) {
    const h = murmur3_32('h' + i);
    const idx = h >>> (32 - p);
    const w = (h << p) >>> 0;
    const rank = w === 0 ? 32 - p + 1 : Math.clz32(w) + 1;
    if (rank > reg[idx]) reg[idx] = rank;
  }
  return reg;
}
