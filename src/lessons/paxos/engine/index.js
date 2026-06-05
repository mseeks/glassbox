/**
 * Single-decree Paxos engine — pure logic, no React, no DOM, no JSX.
 *
 * Extracted from PaxosLesson.jsx so the protocol itself can be unit-tested and
 * reused independently of the lesson's render code. Everything here is
 * deterministic given its inputs. Every walkthrough in the lesson is driven by
 * a real run of this machine, recorded step by step.
 *
 *   PID            — proposer id → display letter (A, B).
 *   cmp/gt/gte     — total order on ballot numbers { round, pid }; null < any.
 *   Sim            — a chamber of n acceptors that records each protocol step.
 *                    prepare → decide (the binding rule) → accept → run.
 *   fmt            — render a ballot number as "round·PID" ("—" when null).
 *   statusFor      — map a recorded step + acceptor id → its visual status.
 *   scClear/scForced/scLeader/scLivelock — the four recorded scenarios.
 *   DECREES        — the example decrees the Multi-Paxos log fills its slots with.
 */

// Proposer id → the letter shown on its ballots and chips.
export const PID = { 1: 'A', 2: 'B' };

// Total order on ballot numbers { round, pid }. A null ballot is lower than any
// real one; ties on round break by proposer id, so every ballot is unique.
export const cmp = (a, b) =>
  !a && !b ? 0 : !a ? -1 : !b ? 1 : a.round !== b.round ? a.round - b.round : a.pid - b.pid;
export const gt = (a, b) => cmp(a, b) > 0;
export const gte = (a, b) => cmp(a, b) >= 0;

// A single-decree Paxos chamber. Each method records one or more steps onto
// `this.steps`; a step snapshots every acceptor so the UI can replay the run.
export class Sim {
  constructor(n) {
    this.n = n;
    this.majority = Math.floor(n / 2) + 1;
    this.acc = Array.from({ length: n }, (_, i) => ({
      id: i,
      promised: null,
      acceptedN: null,
      acceptedV: null,
    }));
    this.steps = [];
    this.chosen = null;
  }
  snap() {
    return this.acc.map((a) => ({ ...a }));
  }
  push(s) {
    this.steps.push({
      ...s,
      acceptors: this.snap(),
      chosen: this.chosen,
      majority: this.majority,
      n: this.n,
    });
  }

  // Phase 1 · Prepare — reserve a ballot and ask `contacts` to promise.
  prepare(pid, round, contacts) {
    const num = { round, pid };
    this.push({
      kind: 'prepare-send',
      pid,
      num,
      contacts: [...contacts],
      value: null,
      title: 'Phase 1 · Prepare',
      desc: `Proposer ${PID[pid]} reserves ballot ${round}·${PID[pid]} and sends a Prepare to ${contacts.length} legislators.`,
    });
    const promises = [],
      rejectedIds = [];
    for (const id of contacts) {
      const a = this.acc[id];
      if (a.promised === null || gt(num, a.promised)) {
        a.promised = num;
        promises.push({ id, acceptedN: a.acceptedN, acceptedV: a.acceptedV });
      } else rejectedIds.push(id);
    }
    const haveMajority = promises.length >= this.majority;
    this.push({
      kind: 'prepare-reply',
      pid,
      num,
      value: null,
      promises: promises.map((p) => ({ ...p })),
      rejectedIds,
      haveMajority,
      title: 'Phase 1 · Promises',
      desc: haveMajority
        ? 'A quorum promised. Each legislator reports the last decree it voted for, if any.'
        : 'Too few promises — no quorum. This attempt stalls.',
    });
    return { num, promises, haveMajority };
  }

  // The binding rule — a proposer must re-submit the highest-ballot decree it
  // heard about; it may use its own only if no acceptor had voted.
  decide(pid, num, promises, ownValue) {
    const seen = promises.filter((p) => p.acceptedN !== null);
    let value = ownValue,
      forced = false,
      fromBallot = null;
    if (seen.length) {
      let best = seen[0];
      for (const s of seen) if (gt(s.acceptedN, best.acceptedN)) best = s;
      value = best.acceptedV;
      forced = true;
      fromBallot = best.acceptedN;
    }
    this.push({
      kind: 'decide',
      pid,
      num,
      intended: ownValue,
      value,
      forced,
      fromBallot,
      title: 'The binding rule',
      desc: forced
        ? `A legislator already voted for “${value}” under ballot ${fromBallot.round}·${PID[fromBallot.pid]}. Proposer ${PID[pid]} is bound to carry it forward; its own “${ownValue}” is abandoned.`
        : `No legislator had voted yet, so proposer ${PID[pid]} is free to submit its own decree, “${value}”.`,
    });
    return { value, forced };
  }

  // Phase 2 · Accept — ask `contacts` to vote `value` in under ballot `num`.
  accept(pid, num, value, contacts) {
    this.push({
      kind: 'accept-send',
      pid,
      num,
      value,
      contacts: [...contacts],
      title: 'Phase 2 · Accept',
      desc: `Proposer ${PID[pid]} asks ${contacts.length} legislators to vote “${value}” under ballot ${num.round}·${PID[num.pid]}.`,
    });
    let count = 0;
    const acceptedFrom = [],
      rejectedIds = [];
    for (const id of contacts) {
      const a = this.acc[id];
      if (a.promised === null || gte(num, a.promised)) {
        a.promised = num;
        a.acceptedN = num;
        a.acceptedV = value;
        count++;
        acceptedFrom.push(id);
      } else rejectedIds.push(id);
    }
    const chose = count >= this.majority;
    if (chose) this.chosen = value;
    this.push({
      kind: 'accept-reply',
      pid,
      num,
      value,
      acceptedFrom,
      rejectedIds,
      chose,
      title: chose ? 'Decree carved' : 'Attempt failed',
      desc: chose
        ? `${count} of ${this.n} voted — a quorum. “${value}” is chosen, and can never be contradicted.`
        : `Only ${count} votes — short of a quorum. Nothing is chosen; a higher ballot is needed.`,
    });
    return { count, chose };
  }

  // A full proposer round: prepare, and only if a quorum promised, decide + accept.
  run(pid, round, value, contacts) {
    const p = this.prepare(pid, round, contacts);
    if (!p.haveMajority) return false;
    const d = this.decide(pid, p.num, p.promises, value);
    return this.accept(pid, p.num, d.value, contacts).chose;
  }
}

// §III — one proposer, an empty chamber: a clean run that carves a decree.
export const scClear = () => {
  const s = new Sim(5);
  s.run(1, 1, 'BUILD HARBOR', [0, 1, 2, 3, 4]);
  return s;
};

// §IV — two proposers, overlapping quorums. The witness (legislator 3) forces
// B to carry A's already-chosen decree forward instead of its own.
export const scForced = () => {
  const s = new Sim(5);
  s.run(1, 1, 'BUILD HARBOR', [0, 1, 2]);
  s.run(2, 1, 'FUND FLEET', [2, 3, 4]);
  return s;
};

// §V — a single distinguished proposer settles in one clean pass.
export const scLeader = () => {
  const s = new Sim(5);
  s.run(1, 1, 'BUILD HARBOR', [0, 1, 2]);
  return s;
};

// §V — the duel: each Prepare poisons the other's pending Accept, forever.
export function scLivelock() {
  const s = new Sim(5);
  const C = [0, 1, 2];
  const pA = s.prepare(1, 1, C);
  const pB = s.prepare(2, 1, C);
  s.accept(1, pA.num, 'BUILD HARBOR', C);
  const pA2 = s.prepare(1, 2, C);
  s.accept(2, pB.num, 'FUND FLEET', C);
  s.prepare(2, 2, C);
  s.accept(1, pA2.num, 'BUILD HARBOR', C);
  s.push({
    kind: 'stall',
    pid: null,
    title: 'Livelock',
    desc: "Each proposer keeps out-bidding the other's ballot, so neither's Accept ever lands. No decree is carved — not from a flaw, but from the limit itself.",
    acceptors: s.snap(),
    chosen: s.chosen,
    majority: s.majority,
    n: s.n,
  });
  return s;
}

// Render a ballot number as "round·PID" (em-dash when there is none yet).
export const fmt = (num) => (num ? `${num.round}·${PID[num.pid]}` : '—');

// Map a recorded step + acceptor id to the visual status that acceptor should
// show in that step: asked (prep), promised, voted, or rejected.
export function statusFor(step, id) {
  if (!step) return '';
  const k = step.kind;
  if (k === 'prepare-send' && step.contacts?.includes(id)) return 'prep';
  if (k === 'prepare-reply') {
    if (step.promises?.some((p) => p.id === id)) return 'promise';
    if (step.rejectedIds?.includes(id)) return 'reject';
  }
  if (k === 'accept-send' && step.contacts?.includes(id)) return 'prep';
  if (k === 'accept-reply') {
    if (step.acceptedFrom?.includes(id)) return 'vote';
    if (step.rejectedIds?.includes(id)) return 'reject';
  }
  return '';
}

// §VI — the decrees the Multi-Paxos log fills its slots with, in order.
export const DECREES = [
  'BUILD HARBOR',
  'FUND FLEET',
  'PAVE AGORA',
  'HOLD GAMES',
  'MINT COIN',
  'DIG WELL',
];
