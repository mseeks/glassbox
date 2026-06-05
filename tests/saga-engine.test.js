import { describe, expect, it } from 'vitest';
import {
  SAGA_STEPS,
  SAGA_OUTCOMES,
  buildSagaFrames,
  markClass,
  TPC_PARTICIPANTS,
  build2pc,
  luEvents,
  buildLU,
  SPLIT_MONOLITH,
  SPLIT_SERVICES,
  CVR_ROLLBACK,
  CVR_COMPENSATION,
  STEP_KINDS,
  COUNTERMEASURES,
  CHOREO_SERVICES,
  CHOREO_STATES,
  ORCH_STATES,
  TRADEOFFS,
  TOC,
  NEXT,
} from '../src/lessons/saga/engine/index.js';

describe('saga-engine · the checkout saga model', () => {
  it('has four steps in the canonical order, each fully specified', () => {
    expect(SAGA_STEPS.map((s) => s.key)).toEqual(['order', 'payment', 'inventory', 'shipping']);
    for (const s of SAGA_STEPS) {
      for (const field of ['svc', 'fwd', 'comp', 'fwdLog', 'compLog', 'done', 'undone', 'reason']) {
        expect(typeof s[field]).toBe('string');
        expect(s[field].length).toBeGreaterThan(0);
      }
      // every compensation is rubricated with the undo glyph
      expect(s.comp.startsWith('↩')).toBe(true);
    }
  });

  it('offers a clean run plus a failure at each non-first step', () => {
    expect(SAGA_OUTCOMES).toEqual([
      ['succeeds', null],
      ['✗ payment', 1],
      ['✗ inventory', 2],
      ['✗ shipping', 3],
    ]);
  });
});

describe('saga-engine · markClass', () => {
  it('prefixes a single bare mark with the lesson prefix', () => {
    expect(markClass('st-done')).toBe('sg-st-done');
    expect(markClass('st-idle')).toBe('sg-st-idle');
  });

  it('prefixes every token of a multi-class mark', () => {
    expect(markClass('st-fail is-blocked')).toBe('sg-st-fail sg-is-blocked');
  });

  it('returns an empty string for an empty or nullish mark', () => {
    expect(markClass('')).toBe('');
    expect(markClass(undefined)).toBe('');
    expect(markClass(null)).toBe('');
    // collapses stray whitespace rather than emitting empty tokens
    expect(markClass('  st-active  ')).toBe('sg-st-active');
  });
});

describe('saga-engine · buildSagaFrames · a clean run', () => {
  const frames = buildSagaFrames(null);

  it('opens on a ready frame and closes on a committed one', () => {
    expect(frames[0].status).toBe('run');
    expect(frames[0].statusText).toContain('ready');
    const last = frames.at(-1);
    expect(last.status).toBe('ok');
    expect(last.statusText).toContain('COMMITTED');
  });

  it('marks every step done and fills every ledger word with its `done` value', () => {
    const last = frames.at(-1);
    for (let i = 0; i < SAGA_STEPS.length; i++) {
      expect(last.marks[i]).toBe('st-done');
    }
    for (const s of SAGA_STEPS) {
      expect(last.states[s.key]).toBe(s.done);
    }
  });

  it('writes one forward log line per step plus the closing system line, no comps', () => {
    const log = frames.at(-1).log;
    const fwd = log.filter((l) => l.cls === 'fwd');
    expect(fwd).toHaveLength(4);
    expect(fwd[0].text).toContain('Order');
    expect(log.filter((l) => l.cls === 'comp')).toHaveLength(0);
    expect(log.filter((l) => l.cls === 'fail')).toHaveLength(0);
    expect(log.at(-1).cls).toBe('sys');
    expect(log.at(-1).text).toContain('committed');
  });

  it('produces an active then a done frame for each of the four steps (+ ready + final)', () => {
    // ready(1) + 2 per step (active, done) * 4 + committed(1) = 10
    expect(frames).toHaveLength(10);
  });

  it('snapshots are independent — mutating one frame does not bleed into the next', () => {
    frames[1].marks[0] = 'tampered';
    expect(buildSagaFrames(null)[1].marks[0]).not.toBe('tampered');
  });
});

describe('saga-engine · buildSagaFrames · a failure unwinds in reverse', () => {
  it('fails at inventory (index 2): payment + order are compensated, in reverse', () => {
    const frames = buildSagaFrames(2);
    const last = frames.at(-1);
    expect(last.status).toBe('bad');
    expect(last.statusText).toContain('ABORTED');
    // the failing step is marked failed; it committed nothing
    expect(last.marks[2]).toBe('st-fail');
    expect(last.states.inventory).toBe('—');
    // shipping was never reached
    expect(last.marks[3]).toBe('st-idle');
    expect(last.states.shipping).toBe('—');
    // the two earlier steps are compensated to their `undone` words
    expect(last.marks[0]).toBe('st-comp');
    expect(last.marks[1]).toBe('st-comp');
    expect(last.states.order).toBe('cancelled');
    expect(last.states.payment).toBe('refunded');
  });

  it('compensates in reverse order: refund payment before cancelling order', () => {
    const log = buildSagaFrames(2).at(-1).log;
    const comps = log.filter((l) => l.cls === 'comp').map((l) => l.text);
    expect(comps).toHaveLength(2);
    expect(comps[0]).toContain('Payment'); // committed last → compensated first
    expect(comps[1]).toContain('Order');
    // there is exactly one fail line, and an aborting system line at the end
    expect(log.filter((l) => l.cls === 'fail')).toHaveLength(1);
    expect(log.at(-1).cls).toBe('sys');
    expect(log.at(-1).text).toContain('aborted');
  });

  it('records the failing step’s reason in its fail log line', () => {
    const log = buildSagaFrames(1).at(-1).log;
    const fail = log.find((l) => l.cls === 'fail');
    expect(fail.text).toContain('Payment');
    expect(fail.text).toContain('card declined');
  });

  it('failing at the first step leaves nothing to compensate', () => {
    const frames = buildSagaFrames(0);
    const last = frames.at(-1);
    expect(last.status).toBe('bad');
    expect(last.marks[0]).toBe('st-fail');
    // no step ever committed → no comp marks, no comp log lines
    expect(Object.values(last.marks).filter((m) => m === 'st-comp')).toHaveLength(0);
    expect(last.log.filter((l) => l.cls === 'comp')).toHaveLength(0);
    expect(last.log.filter((l) => l.cls === 'fwd')).toHaveLength(0);
  });

  it('failing at shipping (index 3) compensates all three earlier steps', () => {
    const last = buildSagaFrames(3).at(-1);
    expect(last.marks[3]).toBe('st-fail');
    for (const i of [0, 1, 2]) expect(last.marks[i]).toBe('st-comp');
    expect(last.log.filter((l) => l.cls === 'comp')).toHaveLength(3);
    expect(last.states.order).toBe('cancelled');
    expect(last.states.payment).toBe('refunded');
    expect(last.states.inventory).toBe('released');
  });
});

describe('saga-engine · build2pc', () => {
  it('lists the three participants', () => {
    expect(TPC_PARTICIPANTS).toEqual(['Order', 'Payment', 'Inventory']);
  });

  it('the survive path runs idle → prepare → vote → commit', () => {
    const f = build2pc(false);
    expect(f).toHaveLength(4);
    expect(f.map((fr) => fr.coord.m)).toEqual(['idle', 'PREPARE?', 'collecting votes', 'COMMIT →']);
    const last = f.at(-1);
    expect(last.coord.d).toBe(false);
    for (const p of last.parts) {
      expect(p.s).toBe('committed');
      expect(p.c).toBe('st-done');
    }
  });

  it('the crash path ends with a dead coordinator and blocked participants', () => {
    const f = build2pc(true);
    expect(f).toHaveLength(4);
    const last = f.at(-1);
    expect(last.coord.m).toBe('✗ CRASHED');
    expect(last.coord.d).toBe(true);
    for (const p of last.parts) {
      expect(p.s).toBe('BLOCKED');
      // carries the pulsing-block animation marker for markClass to prefix
      expect(p.c).toBe('st-fail is-blocked');
    }
    expect(last.cap).toContain('dies before sending the verdict');
  });

  it('the two paths share their first three frames and diverge only at the verdict', () => {
    const survive = build2pc(false);
    const crash = build2pc(true);
    for (let i = 0; i < 3; i++) {
      expect(survive[i].coord.m).toBe(crash[i].coord.m);
    }
    expect(survive[3].coord.m).not.toBe(crash[3].coord.m);
    // the vote frame locks every participant
    expect(survive[2].parts.every((p) => p.s === 'YES · locked')).toBe(true);
  });
});

describe('saga-engine · luEvents', () => {
  it('annotates the read with a version when the version check is on', () => {
    expect(luEvents(false)).toEqual(['read: seats = 1', 'commit — book the seat']);
    expect(luEvents(true)).toEqual(['read: seats = 1 (v0)', 'commit — book the seat']);
  });
});

describe('saga-engine · buildLU', () => {
  it('without a version check, B overwrites A — a lost update', () => {
    const f = buildLU(false);
    expect(f).toHaveLength(5);
    const last = f.at(-1);
    expect(last.vc).toBe('bad');
    expect(last.verdict).toContain('lost update');
    // both sagas believe they won
    expect(last.aMark).toEqual(['on', 'on win']);
    expect(last.bMark).toEqual(['on', 'on win']);
    expect(last.seats).toBe(0);
    expect(last.version).toBe(1);
  });

  it('with the version check, B sees v0→v1 and aborts — isolation rebuilt', () => {
    const f = buildLU(true);
    const last = f.at(-1);
    expect(last.vc).toBe('ok');
    expect(last.verdict).toContain('aborted');
    expect(last.aMark).toEqual(['on', 'on win']);
    expect(last.bMark).toEqual(['on', 'on lose']);
    expect(last.seats).toBe(0);
  });

  it('both variants share the interleave: A reads, B reads, A commits (seat → 0), then B', () => {
    for (const useV of [false, true]) {
      const f = buildLU(useV);
      expect(f[0]).toMatchObject({ aShow: 0, bShow: 0, seats: 1, version: 0 });
      expect(f[1]).toMatchObject({ aShow: 1, bShow: 0 }); // A has read
      expect(f[2]).toMatchObject({ aShow: 1, bShow: 1 }); // B has read the same value
      expect(f[3]).toMatchObject({ aShow: 2, bShow: 1, seats: 0, version: 1 }); // A commits
      // no verdict until the final frame
      expect(f[3].verdict).toBe('');
    }
  });
});

describe('saga-engine · figure & table datasets', () => {
  it('the split: a named monolith and four own-log services', () => {
    expect(SPLIT_MONOLITH.name).toBe('Checkout');
    expect(SPLIT_MONOLITH.log).toContain('write-ahead log');
    expect(SPLIT_SERVICES).toHaveLength(4);
    expect(SPLIT_SERVICES.map((s) => s[0])).toEqual(['Order', 'Payment', 'Inventory', 'Shipping']);
    for (const [, label] of SPLIT_SERVICES) expect(label).toBe('own db · own log');
  });

  it('compensation vs rollback timelines', () => {
    expect(CVR_ROLLBACK).toEqual(['v3', 'v2', 'v1']);
    expect(CVR_COMPENSATION).toEqual(['charge $129', 'refund $129']);
  });

  it('three kinds of step, in order, each with a colour and an example', () => {
    expect(STEP_KINDS.map((r) => r.t)).toEqual(['compensatable', 'pivot', 'retriable']);
    for (const r of STEP_KINDS) {
      expect(r.c).toMatch(/^var\(--/);
      expect(r.d.length).toBeGreaterThan(0);
      expect(r.e.length).toBeGreaterThan(0);
    }
  });

  it('four countermeasures, each fully specified', () => {
    expect(COUNTERMEASURES).toHaveLength(4);
    expect(COUNTERMEASURES.map((c) => c.h)).toEqual([
      'Semantic lock',
      'Commutative updates',
      'Reread / version',
      'Pessimistic ordering',
    ]);
    for (const c of COUNTERMEASURES) {
      for (const k of ['h', 's', 'p', 'e']) expect(c[k].length).toBeGreaterThan(0);
    }
  });

  it('choreography & orchestration service rows line up four-wide', () => {
    expect(CHOREO_SERVICES).toEqual(['Order', 'Payment', 'Inventory', 'Shipping']);
    expect(CHOREO_STATES).toHaveLength(4);
    expect(ORCH_STATES).toHaveLength(4);
    expect(CHOREO_STATES[0]).toBe('emits OrderPlaced');
    expect(ORCH_STATES.filter((s) => s === 'done ✓')).toHaveLength(2);
  });

  it('the tradeoff ledger pairs every property with a 2PC and a saga cell', () => {
    expect(TRADEOFFS).toHaveLength(6);
    expect(TRADEOFFS.map((r) => r[0])).toEqual([
      'Consistency',
      'Availability',
      'Isolation',
      'Coupling',
      'Latency',
      'Reach for it',
    ]);
    for (const r of TRADEOFFS) expect(r).toHaveLength(3);
  });
});

describe('saga-engine · contents & reading list', () => {
  it('the TOC has eight cantos with roman numerals and canto-N ids', () => {
    expect(TOC).toHaveLength(8);
    expect(TOC[0]).toEqual(['I', 'The Broken Promise', 'canto-1']);
    expect(TOC.map((t) => t[2])).toEqual([
      'canto-1',
      'canto-2',
      'canto-3',
      'canto-4',
      'canto-5',
      'canto-6',
      'canto-7',
      'canto-8',
    ]);
  });

  it('the reading list offers six [title, gloss] entries', () => {
    expect(NEXT).toHaveLength(6);
    for (const [title, gloss] of NEXT) {
      expect(title.length).toBeGreaterThan(0);
      expect(gloss.length).toBeGreaterThan(0);
    }
    expect(NEXT[0][0]).toBe('Event sourcing & CQRS');
  });
});
