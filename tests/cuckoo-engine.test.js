import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  altIndex,
  deleteByLookup,
  filterLoad,
  fingerprintOf,
  fnv1a32,
  fpHex,
  indexOf,
  insertItem,
  isPowerOfTwo,
  lookupItem,
  makeFilter,
  mix32,
} from '../src/lessons/cuckoo-filter/engine/index.js';

describe('cuckoo-engine · hashing & fingerprints', () => {
  it('fnv1a32 empty string is the offset basis, and stays 32-bit unsigned', () => {
    expect(fnv1a32('')).toBe(0x811c9dc5);
    const h = fnv1a32('cuckoo');
    expect(h).toBe(fnv1a32('cuckoo'));
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('mix32 is deterministic and 32-bit unsigned', () => {
    const x = mix32(123456);
    expect(x).toBe(mix32(123456));
    expect(x >>> 0).toBe(x);
  });

  it('fingerprintOf is non-zero, deterministic, and fits in the bit width', () => {
    for (const item of ['a', 'b', 'zo', 'alice', 'bob', 'carol']) {
      const fp = fingerprintOf(item, 8);
      expect(fp).toBe(fingerprintOf(item, 8));
      expect(fp).toBeGreaterThanOrEqual(1); // 0 is the empty-slot sentinel
      expect(fp).toBeLessThanOrEqual(0xff);
    }
    expect(fingerprintOf('x', 4)).toBeLessThanOrEqual(0xf);
  });

  it('fpHex pads to the bit width in uppercase', () => {
    expect(fpHex(255, 8)).toBe('FF');
    expect(fpHex(1, 8)).toBe('01');
    expect(fpHex(10, 8)).toBe('0A');
    expect(fpHex(5, 4)).toBe('5');
  });
});

describe('cuckoo-engine · the partial-key trick', () => {
  it('altIndex is its own inverse when numBuckets is a power of two', () => {
    const N = 32;
    for (let i = 0; i < N; i++) {
      for (const fp of [1, 7, 42, 128, 200, 255]) {
        expect(altIndex(altIndex(i, fp, N), fp, N)).toBe(i);
      }
    }
  });

  it('both candidate buckets are within range', () => {
    const N = 32;
    const i1 = indexOf('alice', N);
    const i2 = altIndex(i1, fingerprintOf('alice'), N);
    expect(i1).toBeGreaterThanOrEqual(0);
    expect(i1).toBeLessThan(N);
    expect(i2).toBeGreaterThanOrEqual(0);
    expect(i2).toBeLessThan(N);
  });
});

describe('cuckoo-engine · makeFilter', () => {
  it('allocates the right shape, all empty', () => {
    const f = makeFilter({ numBuckets: 8, slotsPerBucket: 2 });
    expect(f.buckets).toHaveLength(8);
    expect(f.buckets.every((b) => b.length === 2 && b.every((s) => s === 0))).toBe(true);
    expect(f.items).toBe(0);
  });

  it('defaults to 32 × 4 with 8-bit fingerprints', () => {
    const f = makeFilter();
    expect(f.numBuckets).toBe(32);
    expect(f.slotsPerBucket).toBe(4);
    expect(f.fpBits).toBe(8);
  });
});

describe('cuckoo-engine · insert / lookup / delete', () => {
  it('inserts into an empty filter without kicking and finds it', () => {
    const f = makeFilter();
    const r = insertItem(f, 'alice');
    expect(r.success).toBe(true);
    expect(r.kicks).toBe(0);
    expect(r.trace[0].kind).toBe('compute');
    expect(r.trace.at(-1).kind).toBe('placed');
    expect(f.items).toBe(1);
    expect(lookupItem(f, 'alice').found).toBe(true);
  });

  it('an empty filter reports no membership', () => {
    expect(lookupItem(makeFilter(), 'ghost').found).toBe(false);
  });

  it('keeps every item findable at low load', () => {
    const f = makeFilter();
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
    for (const it of items) expect(insertItem(f, it).success).toBe(true);
    for (const it of items) expect(lookupItem(f, it).found).toBe(true);
    expect(filterLoad(f)).toBeCloseTo(items.length / (f.numBuckets * f.slotsPerBucket));
  });

  it('deletes a present item and reports a missing one', () => {
    const f = makeFilter();
    insertItem(f, 'alice');
    expect(deleteByLookup(f, 'alice').success).toBe(true);
    expect(lookupItem(f, 'alice').found).toBe(false);
    expect(f.items).toBe(0);
    expect(deleteByLookup(f, 'never-inserted').success).toBe(false);
  });
});

describe('cuckoo-engine · power-of-two bucket invariant', () => {
  afterEach(() => vi.restoreAllMocks());

  it('isPowerOfTwo recognizes powers of two and rejects everything else', () => {
    for (const n of [1, 2, 4, 8, 16, 32, 64, 1024]) expect(isPowerOfTwo(n)).toBe(true);
    for (const n of [0, 3, 6, 12, 24, 100, -16, 2.5, NaN]) expect(isPowerOfTwo(n)).toBe(false);
  });

  it('altIndex is an exact involution for the bucket counts the labs use (16, 32)', () => {
    // The partial-key trick only round-trips when numBuckets is a power of two.
    // CliffLab (32) and TwinLab (16) — exhaustively, every bucket × every fp.
    for (const N of [16, 32]) {
      for (let i = 0; i < N; i++) {
        for (let fp = 1; fp < 256; fp++) {
          expect(altIndex(altIndex(i, fp, N), fp, N)).toBe(i);
        }
      }
    }
  });

  it('altIndex breaks as an involution for non-power-of-two counts (why 24/12 were bugs)', () => {
    // Pins the contract: 24 and 12 — the values CliffLab/TwinLab used to pass —
    // genuinely violate the round-trip, which is the defect this guards against.
    for (const N of [12, 24]) {
      let violations = 0;
      for (let i = 0; i < N; i++) {
        for (let fp = 1; fp < 32; fp++) {
          if (altIndex(altIndex(i, fp, N), fp, N) !== i) violations++;
        }
      }
      expect(violations).toBeGreaterThan(0);
    }
  });

  it('makeFilter warns on a non-power-of-two bucket count and stays silent otherwise', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    makeFilter({ numBuckets: 32 });
    makeFilter({ numBuckets: 16 });
    expect(warn).not.toHaveBeenCalled();
    makeFilter({ numBuckets: 24 });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/power of two/);
  });
});

describe('cuckoo-engine · the false-negative-after-delete mechanism (TwinLab)', () => {
  it('deleting a fingerprint-twin erases the original — a genuine false negative', () => {
    // Mirrors TwinLab's corrected pair search at NB=16, FP_BITS=5: a is stored
    // in its PRIMARY bucket iA, so the twin b must list iA among its candidates
    // for delete(b) to wipe a's trace. This is the failure the structure is
    // meant to prevent, reproduced deterministically to guard the lesson.
    const NB = 16;
    const FP_BITS = 5;
    const vocab = [
      'apple',
      'beech',
      'cherry',
      'dawn',
      'elm',
      'fig',
      'grove',
      'hazel',
      'ivy',
      'jade',
      'knot',
      'lake',
      'moss',
      'nest',
      'oak',
      'plum',
      'quince',
      'reed',
      'sage',
      'thorn',
      'vine',
      'wave',
      'yew',
      'zest',
    ];

    let pair = null;
    for (let i = 0; i < vocab.length && !pair; i++) {
      for (let j = i + 1; j < vocab.length; j++) {
        const a = vocab[i],
          b = vocab[j];
        if (fingerprintOf(a, FP_BITS) !== fingerprintOf(b, FP_BITS)) continue;
        const iA = indexOf(a, NB);
        const iB = indexOf(b, NB),
          iB2 = altIndex(iB, fingerprintOf(b, FP_BITS), NB);
        if (iB === iA || iB2 === iA) {
          pair = { a, b };
          break;
        }
      }
    }
    expect(pair).not.toBeNull();

    const f = makeFilter({ numBuckets: NB, slotsPerBucket: 4, fpBits: FP_BITS });
    insertItem(f, pair.a);
    expect(lookupItem(f, pair.a).found).toBe(true);
    expect(lookupItem(f, pair.b).found).toBe(true); // false positive: never inserted, yet "present"
    deleteByLookup(f, pair.b); // delete a twin that was never inserted...
    expect(lookupItem(f, pair.a).found).toBe(false); // ...and a is now a false negative
  });
});

describe('cuckoo-engine · eviction & saturation', () => {
  it('exhausts maxKicks when there is nowhere to relocate', () => {
    // One bucket, two slots: a third distinct item can never fit, so the
    // cuckoo kick loop must run out and report failure (deterministic regardless
    // of which random victim slot is chosen).
    const f = makeFilter({ numBuckets: 1, slotsPerBucket: 2, maxKicks: 5 });
    insertItem(f, 'x');
    insertItem(f, 'y');
    const r = insertItem(f, 'z');
    expect(r.success).toBe(false);
    expect(r.kicks).toBe(5);
    expect(r.trace.some((s) => s.kind === 'both-full')).toBe(true);
    expect(r.trace.some((s) => s.kind === 'evict')).toBe(true);
    expect(r.trace.at(-1).kind).toBe('failed');
  });
});
