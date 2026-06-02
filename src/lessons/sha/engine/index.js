/**
 * SHA-256 — pure functions, no React, no DOM.
 *
 * Extracted from ShaLesson.jsx so the engine can be unit tested (against the
 * NIST FIPS 180-4 vectors) and reused (the lesson imports these to keep its
 * render code thin). The implementation exposes intermediate state so the
 * visualizations can show genuine cryptographic values, not mock-ups.
 *
 *   rotr                 — 32-bit right-rotate.
 *   strBytes             — UTF-8 encode a string to bytes.
 *   padFor               — SHA-256 message padding (0x80, zeros, 64-bit length).
 *   sha256Words          — full digest as 8 uint32 words; accepts a custom IV
 *                          and prior bit-count (for length extension).
 *   wordsToHex/sha256Hex — hex rendering of a digest.
 *   sha256BlockStates    — chaining state after each compressed block.
 *   sha256RoundStates    — working state after each of the 64 rounds (block 1).
 *   bitsToBoolArray      — words -> big-endian bit array (avalanche views).
 *   popcountWords        — set-bit count across a word array.
 *   glueBytes/forgeExtension — Merkle–Damgård length-extension forgery.
 */

const K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
const IV256 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

export const rotr = (x, n) => ((x >>> n) | (x << (32 - n))) >>> 0;

export function strBytes(s) {
  return new TextEncoder().encode(s);
}

export function padFor(byteLen, totalBitsHi, totalBitsLo) {
  const withOne = byteLen + 1;
  const zeros = (56 - (withOne % 64) + 64) % 64;
  const padLen = 1 + zeros + 8;
  const p = new Uint8Array(padLen);
  p[0] = 0x80;
  const dv = new DataView(p.buffer);
  dv.setUint32(padLen - 8, totalBitsHi >>> 0, false);
  dv.setUint32(padLen - 4, totalBitsLo >>> 0, false);
  return p;
}

// Full digest. Returns 8 uint32 words.
export function sha256Words(bytes, H0 = IV256, startBits = 0) {
  let H = H0.slice();
  const totalBits = startBits + bytes.length * 8;
  const pad = padFor(bytes.length, Math.floor(totalBits / 0x100000000), totalBits >>> 0);
  const full = new Uint8Array(bytes.length + pad.length);
  full.set(bytes, 0);
  full.set(pad, bytes.length);
  const dv = new DataView(full.buffer);
  for (let off = 0; off < full.length; off += 64) {
    const w = new Array(64);
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    H = [
      (H[0] + a) >>> 0,
      (H[1] + b) >>> 0,
      (H[2] + c) >>> 0,
      (H[3] + d) >>> 0,
      (H[4] + e) >>> 0,
      (H[5] + f) >>> 0,
      (H[6] + g) >>> 0,
      (H[7] + h) >>> 0,
    ];
  }
  return H;
}

export const wordsToHex = (H) => H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');

export function sha256Hex(input) {
  const bytes = typeof input === 'string' ? strBytes(input) : input;
  return wordsToHex(sha256Words(bytes));
}

// Capture chaining state after each block (for the assembly-line figure).
export function sha256BlockStates(bytes) {
  let H = IV256.slice();
  const totalBits = bytes.length * 8;
  const pad = padFor(bytes.length, Math.floor(totalBits / 0x100000000), totalBits >>> 0);
  const full = new Uint8Array(bytes.length + pad.length);
  full.set(bytes, 0);
  full.set(pad, bytes.length);
  const dv = new DataView(full.buffer);
  const states = [H.slice()];
  for (let off = 0; off < full.length; off += 64) {
    const w = new Array(64);
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    H = [
      (H[0] + a) >>> 0,
      (H[1] + b) >>> 0,
      (H[2] + c) >>> 0,
      (H[3] + d) >>> 0,
      (H[4] + e) >>> 0,
      (H[5] + f) >>> 0,
      (H[6] + g) >>> 0,
      (H[7] + h) >>> 0,
    ];
    states.push(H.slice());
  }
  return { states, nBlocks: full.length / 64, paddedLen: full.length, msgLen: bytes.length };
}

// Capture the 256-bit working state after each of the 64 rounds of the FIRST block.
// Used to show avalanche/diffusion. Caller should pass <= 55 bytes (single block).
export function sha256RoundStates(bytes) {
  const totalBits = bytes.length * 8;
  const pad = padFor(bytes.length, Math.floor(totalBits / 0x100000000), totalBits >>> 0);
  const full = new Uint8Array(bytes.length + pad.length);
  full.set(bytes, 0);
  full.set(pad, bytes.length);
  const dv = new DataView(full.buffer);
  const w = new Array(64);
  for (let i = 0; i < 16; i++) w[i] = dv.getUint32(i * 4, false);
  for (let i = 16; i < 64; i++) {
    const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
    const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
    w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
  }
  let [a, b, c, d, e, f, g, h] = IV256;
  const rounds = [[a, b, c, d, e, f, g, h]];
  for (let i = 0; i < 64; i++) {
    const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
    const ch = (e & f) ^ (~e & g);
    const t1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
    const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const t2 = (S0 + maj) >>> 0;
    h = g;
    g = f;
    f = e;
    e = (d + t1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (t1 + t2) >>> 0;
    rounds.push([a, b, c, d, e, f, g, h]);
  }
  return rounds; // 65 snapshots (round 0..64), each 8 words = 256 bits
}

// Count differing bits between two equal-length word arrays.
export function bitsToBoolArray(words) {
  const bits = [];
  for (const wd of words) for (let b = 31; b >= 0; b--) bits.push((wd >>> b) & 1);
  return bits;
}

export function popcountWords(words) {
  let c = 0;
  for (let w of words) {
    w = w >>> 0;
    while (w) {
      c += w & 1;
      w >>>= 1;
    }
  }
  return c;
}

/* Length-extension forgery, using the real SHA-256 above. Returns the forged
   digest plus the bytes appended after the original message. */
export function glueBytes(knownLen) {
  const bits = knownLen * 8;
  return padFor(knownLen, Math.floor(bits / 0x100000000), bits >>> 0);
}

export function forgeExtension(macWords, secretLen, msgBytes, extBytes) {
  const smLen = secretLen + msgBytes.length;
  const glue = glueBytes(smLen);
  const priorBytes = smLen + glue.length; // multiple of 64
  const forged = sha256Words(extBytes, macWords, priorBytes * 8);
  return { forgedHex: wordsToHex(forged), glue, priorBytes };
}
