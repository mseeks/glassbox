// Concurrency lesson engine — the store-buffer memory-model machine behind the
// Simulator lab, lifted out of React so the reordering behaviour can be unit
// tested. Pure: every transition takes a state and returns a new one.
//
// The classic demo: two threads each store one flag then read the other's.
//   T1: X.store(true); r1 = Y.load()
//   T2: Y.store(true); r2 = X.load()
// Under a relaxed model each store parks in a per-thread store buffer, so both
// loads can read main memory before either buffer drains — yielding r1 = r2 =
// false, an outcome impossible under sequential consistency.

export const T1_INSTRS = ['X.store(true)', 'r1 = Y.load()'];
export const T2_INSTRS = ['Y.store(true)', 'r2 = X.load()'];

// A fresh machine. `mode` is 'relaxed' or 'seqcst'.
export function createMachine(mode = 'relaxed') {
  return {
    mode,
    t1Pc: 0,
    t2Pc: 0,
    t1Buffer: {},
    t2Buffer: {},
    memX: false,
    memY: false,
    r1: null,
    r2: null,
  };
}

// Advance thread 1 one instruction: store X (buffered when relaxed, direct
// when seqcst), then load Y.
export function stepThread1(s) {
  if (s.t1Pc === 0) {
    return s.mode === 'relaxed'
      ? { ...s, t1Buffer: { x: true }, t1Pc: 1 }
      : { ...s, memX: true, t1Pc: 1 };
  }
  if (s.t1Pc === 1) return { ...s, r1: s.memY, t1Pc: 2 };
  return s;
}

export function stepThread2(s) {
  if (s.t2Pc === 0) {
    return s.mode === 'relaxed'
      ? { ...s, t2Buffer: { y: true }, t2Pc: 1 }
      : { ...s, memY: true, t2Pc: 1 };
  }
  if (s.t2Pc === 1) return { ...s, r2: s.memX, t2Pc: 2 };
  return s;
}

// Drain a thread's store buffer into main memory. No-op when empty.
export function flushThread1(s) {
  return s.t1Buffer.x !== undefined ? { ...s, memX: true, t1Buffer: {} } : s;
}

export function flushThread2(s) {
  return s.t2Buffer.y !== undefined ? { ...s, memY: true, t2Buffer: {} } : s;
}

export const isThread1Done = (s) => s.t1Pc >= 2 && Object.keys(s.t1Buffer).length === 0;
export const isThread2Done = (s) => s.t2Pc >= 2 && Object.keys(s.t2Buffer).length === 0;
export const isComplete = (s) =>
  isThread1Done(s) && isThread2Done(s) && s.r1 !== null && s.r2 !== null;

// The "both writes happened but neither was visible" outcome — the bug.
export const isBothFalse = (s) => s.r1 === false && s.r2 === false;
