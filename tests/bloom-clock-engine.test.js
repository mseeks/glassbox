import { describe, expect, it } from 'vitest';
import {
  HASH_SEEDS,
  clockWeight,
  compareClocks,
  emptyClock,
  emptyVector,
  hashesFor,
  mergeClocks,
  mixHash,
  recordEvent,
  vCompare,
  vMerge,
  vRecord,
} from '../src/lessons/bloom-clock/engine/index.js';

describe('bloom-clock-engine · hashes', () => {
  it('mixHash is deterministic and unsigned 32-bit', () => {
    const hash = mixHash('node-a', HASH_SEEDS[0]);

    expect(hash).toBe(mixHash('node-a', HASH_SEEDS[0]));
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(hash)).toBe(true);
  });

  it('hashesFor returns k positions in [0, m)', () => {
    const positions = hashesFor('Alice', 4, 32);

    expect(positions).toHaveLength(4);
    for (const position of positions) {
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThan(32);
      expect(Number.isInteger(position)).toBe(true);
    }
  });

  it('hashesFor is deterministic for the same node id', () => {
    expect(hashesFor('Carol', 6, 64)).toEqual(hashesFor('Carol', 6, 64));
  });
});

describe('bloom-clock-engine · bloom clocks', () => {
  it('creates empty clocks and records events immutably', () => {
    const clock = emptyClock(16);
    const next = recordEvent(clock, 'A', 3);

    expect(clock).toEqual(new Array(16).fill(0));
    expect(next).not.toBe(clock);
    expect(next.reduce((sum, value) => sum + value, 0)).toBe(3);
    expect(clockWeight(next, 3)).toBe(1);
  });

  it('mergeClocks is componentwise max, commutative, and idempotent', () => {
    const a = [0, 2, 1, 0];
    const b = [1, 1, 1, 3];
    const merged = [1, 2, 1, 3];

    expect(mergeClocks(a, b)).toEqual(merged);
    expect(mergeClocks(b, a)).toEqual(merged);
    expect(mergeClocks(merged, merged)).toEqual(merged);
  });

  it('compareClocks detects equal, before, after, and concurrent', () => {
    expect(compareClocks([1, 2], [1, 2])).toBe('equal');
    expect(compareClocks([1, 2], [2, 2])).toBe('before');
    expect(compareClocks([2, 2], [1, 2])).toBe('after');
    expect(compareClocks([2, 1], [1, 2])).toBe('concurrent');
  });
});

describe('bloom-clock-engine · vector clocks', () => {
  it('creates and records vector clocks immutably', () => {
    const vector = emptyVector(3);
    const next = vRecord(vector, 1);

    expect(vector).toEqual([0, 0, 0]);
    expect(next).toEqual([0, 1, 0]);
  });

  it('merges vector clocks by componentwise max', () => {
    expect(vMerge([1, 4, 0], [2, 1, 3])).toEqual([2, 4, 3]);
  });

  it('vCompare mirrors vector-clock partial order semantics', () => {
    expect(vCompare([1, 2], [1, 2])).toBe('equal');
    expect(vCompare([1, 2], [2, 2])).toBe('before');
    expect(vCompare([2, 2], [1, 2])).toBe('after');
    expect(vCompare([2, 1], [1, 2])).toBe('concurrent');
  });
});
