import { describe, expect, it } from 'vitest';
import {
  alphaM,
  bits32,
  bucketAndRank,
  buildReg,
  hllEstimate,
  leadingZeros,
  murmur3_32,
} from '../src/lessons/hyperloglog/engine/index.js';

describe('hyperloglog-engine · murmur3_32', () => {
  // Canonical MurmurHash3 x86_32 test vectors (empty input).
  it('matches the known empty-string vectors', () => {
    expect(murmur3_32('', 0)).toBe(0);
    expect(murmur3_32('', 1)).toBe(0x514e28b7); // 1364076727
    expect(murmur3_32('', 1)).toBe(1364076727);
  });

  it('defaults the seed to 0', () => {
    expect(murmur3_32('hello')).toBe(murmur3_32('hello', 0));
  });

  it('returns an unsigned 32-bit integer for any input', () => {
    for (const s of ['', 'a', 'ab', 'abc', 'abcd', 'abcde', 'the quick brown fox', '🦊emoji']) {
      const h = murmur3_32(s);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffffffff);
      expect(h >>> 0).toBe(h); // already unsigned
    }
  });

  it('is deterministic — same input, same hash', () => {
    expect(murmur3_32('alice')).toBe(murmur3_32('alice'));
    expect(murmur3_32('a longer key with spaces', 99)).toBe(
      murmur3_32('a longer key with spaces', 99),
    );
  });

  it('avalanches — a one-character change flips many output bits', () => {
    const a = murmur3_32('avalanche');
    const b = murmur3_32('avalanchf'); // single trailing-letter change
    expect(a).not.toBe(b);
    const popcount = (x) => {
      let n = 0;
      x >>>= 0;
      while (x) {
        n += x & 1;
        x >>>= 1;
      }
      return n;
    };
    const diff = popcount((a ^ b) >>> 0);
    // A good avalanche flips roughly half of the 32 bits; demand a healthy fraction.
    expect(diff).toBeGreaterThanOrEqual(8);
    expect(diff).toBeLessThanOrEqual(24);
  });

  it('responds to the seed', () => {
    expect(murmur3_32('seeded', 0)).not.toBe(murmur3_32('seeded', 7));
  });

  it('exercises every tail length (len & 3 = 0,1,2,3)', () => {
    // 4-byte blocks plus 0..3 trailing bytes hit each switch case.
    expect(murmur3_32('abcd')).not.toBe(murmur3_32('abcde')); // tail 1
    expect(murmur3_32('abcdef')).not.toBe(murmur3_32('abcdefg')); // tail 2 vs 3
    // produce distinct hashes across the residue classes
    const hs = ['wxyz', 'wxyz1', 'wxyz12', 'wxyz123'].map((s) => murmur3_32(s));
    expect(new Set(hs).size).toBe(4);
  });
});

describe('hyperloglog-engine · bits32 / leadingZeros', () => {
  it('renders a 32-character zero-padded binary string', () => {
    expect(bits32(0)).toBe('0'.repeat(32));
    expect(bits32(1)).toBe('0'.repeat(31) + '1');
    expect(bits32(0xffffffff)).toBe('1'.repeat(32));
    for (const h of [0, 1, 255, 4096, 0x80000000, 0xdeadbeef]) {
      expect(bits32(h)).toHaveLength(32);
    }
  });

  it('counts leading zeros of a bit string', () => {
    expect(leadingZeros('1' + '0'.repeat(31))).toBe(0);
    expect(leadingZeros('0001xxxx')).toBe(3);
    expect(leadingZeros('0'.repeat(32))).toBe(32); // no 1 anywhere
    expect(leadingZeros('')).toBe(0);
  });

  it('agrees with Math.clz32 over the 32-bit string', () => {
    for (const h of [1, 2, 8, 1024, 0x40000000, 0x00010000]) {
      expect(leadingZeros(bits32(h))).toBe(Math.clz32(h));
    }
  });
});

describe('hyperloglog-engine · bucketAndRank', () => {
  it('splits a hash into [index in 0..2^p-1, rank>=1]', () => {
    for (const p of [4, 6, 10, 14]) {
      const m = 1 << p;
      for (const h of [0, 1, 0x80000000, 0xdeadbeef, 0xffffffff, 12345678]) {
        const [idx, rank] = bucketAndRank(h, p);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(m);
        expect(Number.isInteger(idx)).toBe(true);
        expect(rank).toBeGreaterThanOrEqual(1);
        expect(rank).toBeLessThanOrEqual(32 - p + 1);
      }
    }
  });

  it('takes the index from the top p bits', () => {
    // p = 8: the index is the top byte.
    const h = 0xab123456;
    const [idx] = bucketAndRank(h, 8);
    expect(idx).toBe(0xab);
  });

  it('ranks the leading zeros of the remaining bits, +1', () => {
    const p = 4;
    // top 4 bits = 1010, then a 1 immediately -> rank 1.
    const [, r1] = bucketAndRank(0xa0000000 | (1 << 27), p);
    expect(r1).toBe(1);
    // top 4 bits set, the rest all zero -> the all-zero-window case: 32 - p + 1.
    const [, rzero] = bucketAndRank(0xf0000000, p);
    expect(rzero).toBe(32 - p + 1);
  });

  it('hits the all-zero window edge case for several p', () => {
    for (const p of [4, 8, 14]) {
      // index bits set, payload bits all zero
      const h = (((1 << p) - 1) << (32 - p)) >>> 0;
      const [, rank] = bucketAndRank(h, p);
      expect(rank).toBe(32 - p + 1);
    }
  });
});

describe('hyperloglog-engine · alphaM', () => {
  it('returns the tabulated constants for m = 16/32/64', () => {
    expect(alphaM(16)).toBe(0.673);
    expect(alphaM(32)).toBe(0.697);
    expect(alphaM(64)).toBe(0.709);
  });

  it('uses the general formula for larger m', () => {
    for (const m of [128, 1024, 16384]) {
      expect(alphaM(m)).toBeCloseTo(0.7213 / (1 + 1.079 / m), 12);
    }
    // The asymptotic constant is ~0.7213; large m approaches it from below.
    expect(alphaM(16384)).toBeGreaterThan(0.72);
    expect(alphaM(16384)).toBeLessThan(0.7213);
  });
});

describe('hyperloglog-engine · buildReg', () => {
  it('produces 2^p registers, each in the valid rank range', () => {
    for (const p of [4, 8, 10]) {
      const reg = buildReg(p, 5000);
      expect(reg).toBeInstanceOf(Uint8Array);
      expect(reg.length).toBe(1 << p);
      for (const v of reg) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(32 - p + 1);
      }
    }
  });

  it('is deterministic (seeded by murmur3 of "h" + i)', () => {
    const a = buildReg(8, 3000);
    const b = buildReg(8, 3000);
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it('only ever raises a register (monotone in n) — prefix property', () => {
    // The first n items of buildReg(p, N) match buildReg(p, n) cell-wise being
    // <= the larger run; specifically the larger build dominates each register.
    const small = buildReg(8, 1000);
    const large = buildReg(8, 4000);
    for (let i = 0; i < small.length; i++) {
      expect(large[i]).toBeGreaterThanOrEqual(small[i]);
    }
  });

  it('leaves all registers at zero for n = 0', () => {
    const reg = buildReg(8, 0);
    expect(Array.from(reg).every((v) => v === 0)).toBe(true);
  });

  it('handles the all-zero payload window (rank = 32 - p + 1) inside the build loop', () => {
    // At p = 14, the item "h24557" hashes to 0x5f840000; its top 14 bits are the
    // register index and the remaining 18 payload bits are all zero, so the build
    // loop must fall back to the maximum possible rank 32 - p + 1 = 19 rather than
    // calling Math.clz32 on an all-zero window. Cross-check with the same edge
    // logic in bucketAndRank, then confirm the register actually carries that rank.
    const p = 14;
    const h = murmur3_32('h24557');
    const w = (h << p) >>> 0;
    expect(w).toBe(0); // the payload window really is all zero
    const [idx, rank] = bucketAndRank(h, p);
    expect(rank).toBe(32 - p + 1); // 19 — the all-zero-window fallback
    const reg = buildReg(p, 24558); // includes i = 24557
    expect(reg[idx]).toBe(32 - p + 1);
  });
});

describe('hyperloglog-engine · hllEstimate', () => {
  it('estimates near the true count across sizes (mid-range)', () => {
    const p = 12; // m = 4096, theoretical error ~1.62%
    for (const n of [3000, 8000, 20000, 50000]) {
      const reg = buildReg(p, n);
      const { E } = hllEstimate(reg, p);
      expect(E).toBeGreaterThan(0);
      const relErr = Math.abs(E - n) / n;
      // generous bound (a few standard errors) so the assertion is robust
      expect(relErr).toBeLessThan(0.1);
    }
  });

  it('uses the linear-counting mode at low cardinality', () => {
    const p = 12;
    const reg = buildReg(p, 50); // far below 2.5m, many empty registers
    const { E, mode, zeros } = hllEstimate(reg, p);
    expect(mode).toBe('linear');
    expect(zeros).toBeGreaterThan(0);
    expect(E).toBeGreaterThan(0);
    expect(Math.abs(E - 50) / 50).toBeLessThan(0.2);
  });

  it('returns raw mode in the mid-range where no correction applies', () => {
    const p = 10; // m = 1024; 2.5m = 2560
    const reg = buildReg(p, 8000); // above the linear threshold, well below the large one
    const { mode } = hllEstimate(reg, p);
    expect(mode).toBe('raw');
  });

  it('applies the large-range correction past 2^32 / 30', () => {
    // Force the raw estimate above the large-range threshold by saturating the
    // registers with huge runs (no empty registers -> linear mode skipped).
    const p = 4;
    const m = 1 << p;
    const reg = new Uint8Array(m).fill(28); // 2^-28 sum is tiny -> E explodes
    const { E, mode, zeros } = hllEstimate(reg, p);
    expect(zeros).toBe(0);
    expect(mode).toBe('large');
    expect(E).toBeGreaterThan(0);
    expect(Number.isFinite(E)).toBe(true);
  });

  it('counts the empty registers it reports', () => {
    const p = 6;
    const reg = new Uint8Array(1 << p);
    reg[0] = 3;
    reg[5] = 1;
    const { zeros } = hllEstimate(reg, p);
    expect(zeros).toBe((1 << p) - 2);
  });

  it('is deterministic for a fixed register bank', () => {
    const reg = buildReg(10, 5000);
    expect(hllEstimate(reg, 10)).toEqual(hllEstimate(reg, 10));
  });

  it('grows monotonically with the true count', () => {
    const p = 12;
    const e1 = hllEstimate(buildReg(p, 2000), p).E;
    const e2 = hllEstimate(buildReg(p, 8000), p).E;
    const e3 = hllEstimate(buildReg(p, 30000), p).E;
    expect(e2).toBeGreaterThan(e1);
    expect(e3).toBeGreaterThan(e2);
  });
});
