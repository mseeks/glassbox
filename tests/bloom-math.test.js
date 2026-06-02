import { describe, expect, it } from 'vitest';
import {
  bitsPerElement,
  bloomPositions,
  djb2,
  falsePositiveRate,
  fnv1a,
  optimalK,
} from '../src/lessons/bloom-filters/engine/index.js';

describe('bloom-math · hashes', () => {
  it('FNV-1a is deterministic and 32-bit unsigned', () => {
    const h = fnv1a('hello');
    expect(h).toBe(fnv1a('hello'));
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(h)).toBe(true);
  });

  it('FNV-1a empty string seed equals the offset basis', () => {
    expect(fnv1a('')).toBe(2166136261);
  });

  it('djb2 is deterministic and 32-bit unsigned', () => {
    const h = djb2('hello');
    expect(h).toBe(djb2('hello'));
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('djb2 empty string seed equals 5381', () => {
    expect(djb2('')).toBe(5381);
  });

  it('FNV-1a and djb2 disagree on typical inputs (independence smoke test)', () => {
    for (const s of ['alpha', 'beta', 'gamma', 'delta', 'epsilon']) {
      expect(fnv1a(s)).not.toBe(djb2(s));
    }
  });
});

describe('bloom-math · bloomPositions', () => {
  it('returns k positions, all in [0, m)', () => {
    const k = 7;
    const m = 1024;
    const positions = bloomPositions('matthew', k, m);
    expect(positions).toHaveLength(k);
    for (const p of positions) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThan(m);
      expect(Number.isInteger(p)).toBe(true);
    }
  });

  it('is deterministic for the same input', () => {
    expect(bloomPositions('arlo', 5, 256)).toEqual(bloomPositions('arlo', 5, 256));
  });

  it('produces different position sets for different inputs', () => {
    const a = bloomPositions('one', 5, 1024);
    const b = bloomPositions('two', 5, 1024);
    expect(a).not.toEqual(b);
  });

  it('h2 forced odd: with m even, k=2 hops cannot land on the same residue class', () => {
    // Picks an input + m where successive offsets would collide if h2 were even.
    // bloomPositions ORs h2 with 1, so this should hold for any input.
    for (const s of ['x', 'yy', 'zzz', 'corpus', 'matthew']) {
      const m = 256; // even
      const [p0, p1] = bloomPositions(s, 2, m);
      expect((p1 - p0 + m) % m).not.toBe(0);
    }
  });
});

describe('bloom-math · FPR closed form', () => {
  it('returns 0 when n=0', () => {
    expect(falsePositiveRate(1024, 0, 7)).toBe(0);
  });

  it('matches the canonical (1 - e^(-kn/m))^k formula', () => {
    const m = 1000;
    const n = 100;
    const k = 7;
    const expected = (1 - Math.exp((-k * n) / m)) ** k;
    expect(falsePositiveRate(m, n, k)).toBeCloseTo(expected, 12);
  });

  it('is monotone increasing in n for fixed m, k', () => {
    const m = 1024;
    const k = 7;
    let prev = -1;
    for (const n of [1, 10, 100, 200, 400]) {
      const p = falsePositiveRate(m, n, k);
      expect(p).toBeGreaterThan(prev);
      prev = p;
    }
  });
});

describe('bloom-math · optimalK and bitsPerElement', () => {
  it('optimalK ≈ (m/n) * ln 2, rounded, at least 1', () => {
    expect(optimalK(10, 1)).toBe(Math.max(1, Math.round(10 * Math.LN2)));
    expect(optimalK(1024, 100)).toBe(Math.max(1, Math.round((1024 / 100) * Math.LN2)));
    expect(optimalK(1, 1000)).toBe(1); // floor at 1
    expect(optimalK(0, 1)).toBe(1);
    expect(optimalK(100, 0)).toBe(1);
  });

  it('bitsPerElement at 1% FPR is roughly 9.585', () => {
    expect(bitsPerElement(0.01)).toBeCloseTo(-Math.log2(0.01) / Math.LN2, 12);
    expect(bitsPerElement(0.01)).toBeGreaterThan(9.5);
    expect(bitsPerElement(0.01)).toBeLessThan(9.7);
  });
});
