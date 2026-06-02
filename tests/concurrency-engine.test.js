import { describe, expect, it } from 'vitest';
import {
  createMachine,
  flushThread1,
  flushThread2,
  isBothFalse,
  isComplete,
  isThread1Done,
  isThread2Done,
  stepThread1,
  stepThread2,
} from '../src/lessons/concurrency-foundations/engine/index.js';

describe('concurrency-engine · machine setup', () => {
  it('starts empty in the requested mode', () => {
    const s = createMachine('relaxed');
    expect(s).toMatchObject({
      mode: 'relaxed',
      t1Pc: 0,
      t2Pc: 0,
      t1Buffer: {},
      t2Buffer: {},
      memX: false,
      memY: false,
      r1: null,
      r2: null,
    });
    expect(createMachine('seqcst').mode).toBe('seqcst');
  });

  it('transitions are pure — the input state is never mutated', () => {
    const s = createMachine('relaxed');
    const frozen = JSON.stringify(s);
    stepThread1(s);
    flushThread1(s);
    expect(JSON.stringify(s)).toBe(frozen);
  });
});

describe('concurrency-engine · relaxed reordering (the bug)', () => {
  it('both stores buffered, both loads read stale memory → r1 = r2 = false', () => {
    let s = createMachine('relaxed');
    s = stepThread1(s); // X.store → buffer
    expect(s.memX).toBe(false);
    expect(s.t1Buffer).toEqual({ x: true });
    s = stepThread2(s); // Y.store → buffer
    s = stepThread1(s); // r1 = Y.load() → main memory still false
    s = stepThread2(s); // r2 = X.load() → main memory still false
    expect(s.r1).toBe(false);
    expect(s.r2).toBe(false);
    expect(isBothFalse(s)).toBe(true);

    // Buffers still pending → not yet "complete" until drained.
    expect(isComplete(s)).toBe(false);
    s = flushThread1(s);
    s = flushThread2(s);
    expect(s.memX).toBe(true);
    expect(s.memY).toBe(true);
    expect(isComplete(s)).toBe(true);
  });

  it('flushing a store before the sibling loads avoids the bug', () => {
    let s = createMachine('relaxed');
    s = stepThread1(s); // X buffered
    s = flushThread1(s); // X drained to memory
    s = stepThread2(s); // Y buffered
    s = stepThread2(s); // r2 = X.load() → sees the drained true
    expect(s.r2).toBe(true);
    expect(isBothFalse(s)).toBe(false);
  });

  it('flushing an empty buffer is a no-op', () => {
    const s = createMachine('relaxed');
    expect(flushThread1(s)).toBe(s);
    expect(flushThread2(s)).toBe(s);
  });
});

describe('concurrency-engine · sequential consistency forbids the bug', () => {
  it('seqcst stores write straight to memory, so a load always sees a prior store', () => {
    let s = createMachine('seqcst');
    s = stepThread1(s); // X.store → memory directly
    expect(s.memX).toBe(true);
    expect(s.t1Buffer).toEqual({});
    s = stepThread2(s); // Y.store → memory directly
    s = stepThread1(s); // r1 = Y.load() → true
    s = stepThread2(s); // r2 = X.load() → true
    expect(s.r1).toBe(true);
    expect(s.r2).toBe(true);
    expect(isBothFalse(s)).toBe(false);
    expect(isComplete(s)).toBe(true);
  });
});

describe('concurrency-engine · done/complete selectors', () => {
  it('a thread is done only once stepped past its load with an empty buffer', () => {
    let s = createMachine('relaxed');
    expect(isThread1Done(s)).toBe(false);
    s = stepThread1(s); // store buffered (pc 1, buffer non-empty)
    s = stepThread1(s); // load (pc 2) but buffer still holds X
    expect(isThread1Done(s)).toBe(false);
    s = flushThread1(s);
    expect(isThread1Done(s)).toBe(true);
    expect(isThread2Done(s)).toBe(false);
  });

  it('extra steps past completion are inert', () => {
    let s = createMachine('seqcst');
    s = stepThread1(s);
    s = stepThread1(s);
    const done = stepThread1(s);
    expect(done).toEqual(s);
  });
});
