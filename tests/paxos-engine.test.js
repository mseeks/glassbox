import { describe, expect, it } from 'vitest';
import {
  PID,
  cmp,
  gt,
  gte,
  Sim,
  fmt,
  statusFor,
  scClear,
  scForced,
  scLeader,
  scLivelock,
  DECREES,
} from '../src/lessons/paxos/engine/index.js';

describe('paxos-engine · ballot order', () => {
  it('orders by round, then breaks ties by proposer id', () => {
    expect(cmp({ round: 1, pid: 1 }, { round: 2, pid: 1 })).toBeLessThan(0);
    expect(cmp({ round: 2, pid: 1 }, { round: 1, pid: 2 })).toBeGreaterThan(0);
    expect(cmp({ round: 1, pid: 1 }, { round: 1, pid: 2 })).toBeLessThan(0);
    expect(cmp({ round: 1, pid: 2 }, { round: 1, pid: 2 })).toBe(0);
  });

  it('treats a null ballot as lower than any real ballot', () => {
    expect(cmp(null, null)).toBe(0);
    expect(cmp(null, { round: 1, pid: 1 })).toBeLessThan(0);
    expect(cmp({ round: 1, pid: 1 }, null)).toBeGreaterThan(0);
  });

  it('gt / gte derive from cmp', () => {
    expect(gt({ round: 2, pid: 1 }, { round: 1, pid: 1 })).toBe(true);
    expect(gt({ round: 1, pid: 1 }, { round: 1, pid: 1 })).toBe(false);
    expect(gte({ round: 1, pid: 1 }, { round: 1, pid: 1 })).toBe(true);
    expect(gte({ round: 1, pid: 1 }, { round: 2, pid: 1 })).toBe(false);
    expect(gt(null, null)).toBe(false);
    expect(gte(null, null)).toBe(true);
  });
});

describe('paxos-engine · Sim quorum arithmetic', () => {
  it('computes a strict majority for the chamber size', () => {
    expect(new Sim(5).majority).toBe(3);
    expect(new Sim(3).majority).toBe(2);
    expect(new Sim(4).majority).toBe(3);
    expect(new Sim(1).majority).toBe(1);
  });

  it('starts every acceptor empty', () => {
    const s = new Sim(3);
    expect(s.acc).toHaveLength(3);
    for (const a of s.acc) {
      expect(a).toMatchObject({ promised: null, acceptedN: null, acceptedV: null });
    }
    expect(s.chosen).toBeNull();
    expect(s.steps).toEqual([]);
  });

  it('snap returns an independent copy of the acceptors', () => {
    const s = new Sim(2);
    const snap = s.snap();
    snap[0].promised = { round: 9, pid: 1 };
    expect(s.acc[0].promised).toBeNull();
  });
});

describe('paxos-engine · a clean run carves a decree', () => {
  it('records prepare → decide → accept and chooses the value', () => {
    const s = new Sim(5);
    const chose = s.run(1, 1, 'BUILD HARBOR', [0, 1, 2, 3, 4]);
    expect(chose).toBe(true);
    expect(s.chosen).toBe('BUILD HARBOR');
    expect(s.steps.map((x) => x.kind)).toEqual([
      'prepare-send',
      'prepare-reply',
      'decide',
      'accept-send',
      'accept-reply',
    ]);
    const decide = s.steps.find((x) => x.kind === 'decide');
    expect(decide.forced).toBe(false);
    expect(decide.value).toBe('BUILD HARBOR');
    const reply = s.steps.at(-1);
    expect(reply.chose).toBe(true);
    expect(reply.acceptedFrom).toEqual([0, 1, 2, 3, 4]);
  });

  it('stalls when fewer than a majority promise (no decide/accept)', () => {
    const s = new Sim(5);
    const chose = s.run(1, 1, 'BUILD HARBOR', [0, 1]); // only two of five
    expect(chose).toBe(false);
    expect(s.chosen).toBeNull();
    expect(s.steps.map((x) => x.kind)).toEqual(['prepare-send', 'prepare-reply']);
    expect(s.steps.at(-1).haveMajority).toBe(false);
  });
});

describe('paxos-engine · the binding rule', () => {
  it('forces a later proposer to carry the already-chosen decree forward', () => {
    const s = scForced();
    expect(s.chosen).toBe('BUILD HARBOR');
    const decides = s.steps.filter((x) => x.kind === 'decide');
    expect(decides).toHaveLength(2);
    // first proposer was free; second was bound to A's decree
    expect(decides[0].forced).toBe(false);
    expect(decides[1].forced).toBe(true);
    expect(decides[1].intended).toBe('FUND FLEET');
    expect(decides[1].value).toBe('BUILD HARBOR');
    expect(decides[1].desc).toContain('bound to carry it forward');
  });

  it('takes the highest-ballot reported decree when several were seen', () => {
    const s = new Sim(5);
    // legislator 0 voted under 1·A, legislator 1 under 2·B (higher)
    s.acc[0] = {
      id: 0,
      promised: { round: 1, pid: 1 },
      acceptedN: { round: 1, pid: 1 },
      acceptedV: 'OLD',
    };
    s.acc[1] = {
      id: 1,
      promised: { round: 2, pid: 2 },
      acceptedN: { round: 2, pid: 2 },
      acceptedV: 'NEW',
    };
    const num = { round: 3, pid: 1 };
    const promises = [
      { id: 0, acceptedN: s.acc[0].acceptedN, acceptedV: 'OLD' },
      { id: 1, acceptedN: s.acc[1].acceptedN, acceptedV: 'NEW' },
      { id: 2, acceptedN: null, acceptedV: null },
    ];
    const d = s.decide(1, num, promises, 'MINE');
    expect(d.forced).toBe(true);
    expect(d.value).toBe('NEW'); // higher ballot wins, not "most common"
  });
});

describe('paxos-engine · accept rejects stale ballots', () => {
  it('an acceptor refuses a ballot lower than what it promised', () => {
    const s = new Sim(3);
    s.acc.forEach((a) => (a.promised = { round: 5, pid: 2 }));
    const { count, chose } = s.accept(1, { round: 4, pid: 1 }, 'LATE', [0, 1, 2]);
    expect(count).toBe(0);
    expect(chose).toBe(false);
    expect(s.chosen).toBeNull();
    expect(s.steps.at(-1).rejectedIds).toEqual([0, 1, 2]);
  });
});

describe('paxos-engine · scenarios', () => {
  it('scClear: a single proposer carves a decree with all five votes', () => {
    const s = scClear();
    expect(s.chosen).toBe('BUILD HARBOR');
    expect(s.steps.at(-1).acceptedFrom).toHaveLength(5);
  });

  it('scLeader: one proposer settles in a single clean pass', () => {
    const s = scLeader();
    expect(s.chosen).toBe('BUILD HARBOR');
    expect(s.steps.filter((x) => x.kind === 'decide')).toHaveLength(1);
  });

  it('scLivelock: dueling proposers never carve anything', () => {
    const s = scLivelock();
    expect(s.chosen).toBeNull();
    expect(s.steps.at(-1).kind).toBe('stall');
    // every Accept in the duel was rejected
    for (const step of s.steps.filter((x) => x.kind === 'accept-reply')) {
      expect(step.chose).toBe(false);
    }
  });
});

describe('paxos-engine · fmt', () => {
  it('renders a ballot as round·PID', () => {
    expect(fmt({ round: 1, pid: 1 })).toBe('1·A');
    expect(fmt({ round: 4, pid: 2 })).toBe('4·B');
  });
  it('renders the empty ballot as an em dash', () => {
    expect(fmt(null)).toBe('—');
    expect(fmt(undefined)).toBe('—');
  });
});

describe('paxos-engine · statusFor', () => {
  it('returns empty for no step', () => {
    expect(statusFor(null, 0)).toBe('');
    expect(statusFor(undefined, 3)).toBe('');
  });

  it('labels prepare and accept sends as "prep" for contacted acceptors', () => {
    expect(statusFor({ kind: 'prepare-send', contacts: [0, 1] }, 0)).toBe('prep');
    expect(statusFor({ kind: 'prepare-send', contacts: [0, 1] }, 2)).toBe('');
    expect(statusFor({ kind: 'accept-send', contacts: [3] }, 3)).toBe('prep');
  });

  it('labels promise / reject from a prepare-reply', () => {
    const step = { kind: 'prepare-reply', promises: [{ id: 0 }], rejectedIds: [1] };
    expect(statusFor(step, 0)).toBe('promise');
    expect(statusFor(step, 1)).toBe('reject');
    expect(statusFor(step, 2)).toBe('');
  });

  it('labels vote / reject from an accept-reply', () => {
    const step = { kind: 'accept-reply', acceptedFrom: [0], rejectedIds: [2] };
    expect(statusFor(step, 0)).toBe('vote');
    expect(statusFor(step, 2)).toBe('reject');
    expect(statusFor(step, 1)).toBe('');
  });

  it('derives statuses for every acceptor across a recorded run', () => {
    const s = scClear();
    const reply = s.steps.find((x) => x.kind === 'accept-reply');
    for (const a of reply.acceptors) expect(statusFor(reply, a.id)).toBe('vote');
  });
});

describe('paxos-engine · constants', () => {
  it('maps proposer ids to letters', () => {
    expect(PID).toEqual({ 1: 'A', 2: 'B' });
  });
  it('exposes six example decrees for the log', () => {
    expect(DECREES).toHaveLength(6);
    expect(DECREES[0]).toBe('BUILD HARBOR');
  });
});
