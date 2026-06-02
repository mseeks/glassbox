import { describe, expect, it } from 'vitest';
import {
  evalExpr,
  formatValue,
  simulateAtomicity,
  simulateIsolation,
  transactionView,
} from '../src/lessons/acid-lab/engine/index.js';

const levels = [
  {
    id: 'read_uncommitted',
    rules: {
      seesUncommitted: true,
      consistentReads: false,
      snapshotOnBegin: false,
      conflictDetection: 'none',
    },
  },
  {
    id: 'read_committed',
    rules: {
      seesUncommitted: false,
      consistentReads: false,
      snapshotOnBegin: false,
      conflictDetection: 'none',
    },
  },
  {
    id: 'snapshot',
    rules: {
      seesUncommitted: false,
      consistentReads: true,
      snapshotOnBegin: true,
      conflictDetection: 'ww',
    },
  },
  {
    id: 'serializable',
    rules: {
      seesUncommitted: false,
      consistentReads: true,
      snapshotOnBegin: true,
      conflictDetection: 'ssi',
    },
  },
];

const dirtyReadScenario = {
  initial: { X: 100 },
  keys: ['X', 'Y'],
  timeline: [
    { txn: 'T1', type: 'begin' },
    { txn: 'T2', type: 'begin' },
    { txn: 'T1', type: 'write', key: 'X', expr: '500' },
    { txn: 'T2', type: 'read', key: 'X' },
    { txn: 'T2', type: 'write', key: 'Y', expr: '$X * 2' },
    { txn: 'T2', type: 'commit' },
    { txn: 'T1', type: 'abort' },
  ],
  anomalyOnRead: { stepIdx: 3, atLevels: ['read_uncommitted'], note: 'dirty read' },
  anomalyAtEnd: { atLevels: ['read_uncommitted'], note: 'poisoned commit' },
};

const lostUpdateScenario = {
  initial: { counter: 5 },
  keys: ['counter'],
  timeline: [
    { txn: 'T1', type: 'begin' },
    { txn: 'T2', type: 'begin' },
    { txn: 'T1', type: 'read', key: 'counter' },
    { txn: 'T2', type: 'read', key: 'counter' },
    { txn: 'T1', type: 'write', key: 'counter', expr: '$counter + 1' },
    { txn: 'T2', type: 'write', key: 'counter', expr: '$counter + 1' },
    { txn: 'T1', type: 'commit' },
    { txn: 'T2', type: 'commit' },
  ],
  anomalyAtEnd: { atLevels: ['read_committed'], note: 'lost update' },
};

const writeSkewScenario = {
  initial: { alice_oncall: 1, bob_oncall: 1 },
  keys: ['alice_oncall', 'bob_oncall'],
  timeline: [
    { txn: 'T1', type: 'begin' },
    { txn: 'T2', type: 'begin' },
    { txn: 'T1', type: 'read', key: 'alice_oncall' },
    { txn: 'T1', type: 'read', key: 'bob_oncall' },
    { txn: 'T2', type: 'read', key: 'alice_oncall' },
    { txn: 'T2', type: 'read', key: 'bob_oncall' },
    { txn: 'T1', type: 'write', key: 'alice_oncall', expr: '0' },
    { txn: 'T2', type: 'write', key: 'bob_oncall', expr: '0' },
    { txn: 'T1', type: 'commit' },
    { txn: 'T2', type: 'commit', specialAbortAt: ['serializable'] },
  ],
  anomalyAtEnd: { atLevels: ['snapshot'], note: 'write skew' },
};

const atomicCrashBeforeCommit = {
  initial: { A: 0, B: 0 },
  timeline: [
    { type: 'begin' },
    { type: 'write', key: 'A', expr: '10' },
    { type: 'write', key: 'B', expr: '$A + 10' },
    { type: 'crash' },
    { type: 'recover' },
  ],
};

const atomicCrashAfterCommit = {
  initial: { A: 0, B: 0 },
  timeline: [
    { type: 'begin' },
    { type: 'write', key: 'A', expr: '10' },
    { type: 'write', key: 'B', expr: '$A + 10' },
    { type: 'commit_log' },
    { type: 'crash' },
    { type: 'recover' },
  ],
};

describe('acid-engine · expression and view helpers', () => {
  it('evaluates transaction expressions with $key references', () => {
    expect(evalExpr('$X * 2 + $Y', { X: 5, Y: 3 })).toBe(13);
  });

  it('returns null for invalid expressions rather than throwing', () => {
    expect(evalExpr('$missing + nope(', {})).toBeNull();
  });

  it('formats missing values and overlays transaction writes onto reads', () => {
    expect(formatValue(null)).toBe('∅');
    expect(transactionView({ status: 'active', view: { X: 1 }, writes: { X: 2, Y: 3 } })).toEqual({
      X: 2,
      Y: 3,
    });
  });
});

describe('acid-engine · isolation simulator', () => {
  it('allows dirty reads at read uncommitted and propagates them into committed writes', () => {
    const steps = simulateIsolation(dirtyReadScenario, 'read_uncommitted', levels);
    const final = steps.at(-1);

    expect(steps[4]).toMatchObject({ readValue: 500, flag: 'anomaly' });
    expect(final.committed).toMatchObject({ X: 100, Y: 1000 });
    expect(final).toMatchObject({ hadAnomaly: true, annotation: 'poisoned commit' });
  });

  it('hides uncommitted writes at read committed', () => {
    const steps = simulateIsolation(dirtyReadScenario, 'read_committed', levels);
    const final = steps.at(-1);

    expect(steps[4]).toMatchObject({ readValue: 100, flag: null });
    expect(final.committed).toMatchObject({ X: 100, Y: 200 });
    expect(final.hadAnomaly).toBe(false);
  });

  it('aborts snapshot transactions that would overwrite a concurrent committed write', () => {
    const final = simulateIsolation(lostUpdateScenario, 'snapshot', levels).at(-1);

    expect(final).toMatchObject({ flag: 'abort', anySystemAborted: true });
    expect(final.committed.counter).toBe(6);
  });

  it('lets snapshot write skew through but aborts it under serializable SSI', () => {
    const snapshotFinal = simulateIsolation(writeSkewScenario, 'snapshot', levels).at(-1);
    const serializableFinal = simulateIsolation(writeSkewScenario, 'serializable', levels).at(-1);

    expect(snapshotFinal).toMatchObject({ hadAnomaly: true, flag: 'anomaly' });
    expect(snapshotFinal.committed).toMatchObject({ alice_oncall: 0, bob_oncall: 0 });
    expect(serializableFinal).toMatchObject({ flag: 'abort', anySystemAborted: true });
    expect(serializableFinal.committed).toMatchObject({ alice_oncall: 0, bob_oncall: 1 });
  });
});

describe('acid-engine · atomicity simulator', () => {
  it('discards WAL writes when recovery finds no COMMIT marker', () => {
    const final = simulateAtomicity(atomicCrashBeforeCommit).at(-1);

    expect(final).toMatchObject({ recovered: true, db: { A: 0, B: 0 } });
    expect(final.message).toContain('no COMMIT marker');
  });

  it('redoes committed WAL writes after a crash before database apply', () => {
    const final = simulateAtomicity(atomicCrashAfterCommit).at(-1);

    expect(final).toMatchObject({ recovered: true, db: { A: 10, B: 20 } });
    expect(final.message).toContain('found COMMIT');
  });

  it('snapshots WAL and volatile active state for every display step', () => {
    const steps = simulateAtomicity(atomicCrashAfterCommit);

    expect(steps[2].active.writes).toEqual({ A: 10 });
    expect(steps[3].active.writes).toEqual({ A: 10, B: 20 });
    expect(steps[4].wal.at(-1)).toMatchObject({ type: 'COMMIT', txn: 'T1' });
  });
});
