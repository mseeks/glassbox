import { describe, expect, it } from 'vitest';
import {
  advanceEpidemicRound,
  applySuspectGossip,
  chooseProbeTarget,
  countMembershipStates,
  createIndirectProbeMessages,
  createIndirectTargetProbeMessages,
  createProbeRound,
  createSuspectGossipMessages,
  estimateEpidemicConvergenceRounds,
  makeRng,
  resolveSuspicion,
  reviveDeadMemberIfTruthWasFalse,
  selectIndirectHelpers,
  toggleTruthAlive,
} from '../src/lessons/swim/engine/index.js';

const states = (entries) =>
  new Map(entries.map(([id, state, incarnation = 1]) => [id, { state, incarnation }]));

describe('swim-engine · deterministic randomness', () => {
  it('makeRng produces repeatable sequences for seeded simulations', () => {
    const a = makeRng(42);
    const b = makeRng(42);

    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('swim-engine · probe selection', () => {
  it('chooseProbeTarget excludes self and confirmed-dead members', () => {
    const nodeStates = states([
      [0, 'alive'],
      [1, 'dead'],
      [2, 'alive'],
    ]);

    expect(chooseProbeTarget(nodeStates, 0, () => 0)).toBe(2);
  });

  it('createProbeRound creates one probe per non-dead member with tracked in-flight metadata', () => {
    const nodeStates = states([
      [0, 'alive'],
      [1, 'suspect'],
      [2, 'dead'],
      [3, 'alive'],
    ]);
    const { messages, probes } = createProbeRound({ nodeStates, rng: makeRng(7), now: 123 });

    expect(messages).toHaveLength(3);
    expect(probes).toHaveLength(3);
    for (const message of messages) {
      expect(message.kind).toBe('probe');
      expect(message.fromId).not.toBe(message.toId);
      expect(message.toId).not.toBe(2);
      expect(probes.get(message.id)).toMatchObject({
        proberId: message.fromId,
        targetId: message.toId,
        startedAt: 123,
        indirectSent: false,
        satisfied: false,
      });
    }
  });

  it('selectIndirectHelpers excludes prober, target, and dead members without replacement', () => {
    const nodeStates = states([
      [0, 'alive'],
      [1, 'alive'],
      [2, 'alive'],
      [3, 'dead'],
      [4, 'suspect'],
    ]);

    const helpers = selectIndirectHelpers({
      nodeStates,
      proberId: 0,
      targetId: 2,
      count: 3,
      rng: makeRng(3),
    });

    expect(new Set(helpers).size).toBe(helpers.length);
    expect(helpers).not.toContain(0);
    expect(helpers).not.toContain(2);
    expect(helpers).not.toContain(3);
    expect(helpers.sort()).toEqual([1, 4]);
  });

  it('creates first-hop and second-hop indirect probe messages from the same helper set', () => {
    const firstHop = createIndirectProbeMessages({
      probeId: 'p1',
      proberId: 0,
      targetId: 3,
      helpers: [1, 2],
    });
    const secondHop = createIndirectTargetProbeMessages({
      probeId: 'p1',
      targetId: 3,
      helpers: [1, 2],
    });

    expect(firstHop.map((m) => [m.fromId, m.toId, m.kind, m.finalTarget])).toEqual([
      [0, 1, 'indirect-probe', 3],
      [0, 2, 'indirect-probe', 3],
    ]);
    expect(secondHop.map((m) => [m.fromId, m.toId, m.kind])).toEqual([
      [1, 3, 'indirect-probe'],
      [2, 3, 'indirect-probe'],
    ]);
  });
});

describe('swim-engine · suspicion lifecycle', () => {
  it('gossips suspicion to peers other than the target', () => {
    const nodeStates = states([
      [0, 'alive'],
      [1, 'alive'],
      [2, 'alive'],
      [3, 'alive'],
      [4, 'alive'],
    ]);

    const messages = createSuspectGossipMessages({
      nodeStates,
      probeId: 'p1',
      proberId: 0,
      targetId: 3,
      incarnation: 2,
    });

    expect(messages).toHaveLength(4);
    expect(messages.map((m) => m.toId)).not.toContain(3);
    expect(messages[0]).toMatchObject({
      kind: 'gossip-suspect',
      payload: { targetId: 3, incarnation: 2 },
    });
  });

  it('applies suspicion only when the incoming incarnation is current or newer', () => {
    const nodeStates = states([[3, 'alive', 4]]);

    expect(applySuspectGossip(nodeStates, { targetId: 3, incarnation: 3 }).get(3)).toEqual({
      state: 'alive',
      incarnation: 4,
    });
    expect(applySuspectGossip(nodeStates, { targetId: 3, incarnation: 4 }).get(3)).toEqual({
      state: 'suspect',
      incarnation: 4,
    });
  });

  it('resolves suspicion to dead or refuted-alive based on truth', () => {
    const nodeStates = states([[3, 'suspect', 4]]);

    expect(
      resolveSuspicion(nodeStates, { targetId: 3, incarnation: 4, targetAlive: false }).get(3),
    ).toEqual({
      state: 'dead',
      incarnation: 4,
    });
    expect(
      resolveSuspicion(nodeStates, { targetId: 3, incarnation: 4, targetAlive: true }).get(3),
    ).toEqual({
      state: 'alive',
      incarnation: 5,
    });
  });

  it('toggles truth and revives known-dead members with an incarnation bump', () => {
    const truth = new Map([[2, false]]);
    const nodeStates = states([[2, 'dead', 9]]);

    expect(toggleTruthAlive(truth, 2).get(2)).toBe(true);
    expect(reviveDeadMemberIfTruthWasFalse(nodeStates, truth, 2).get(2)).toEqual({
      state: 'alive',
      incarnation: 10,
    });
  });

  it('counts membership states for UI telemetry', () => {
    expect(
      countMembershipStates(
        states([
          [0, 'alive'],
          [1, 'suspect'],
          [2, 'dead'],
          [3, 'alive'],
        ]),
      ),
    ).toEqual({
      alive: 2,
      suspect: 1,
      dead: 1,
    });
  });
});

describe('swim-engine · epidemic dissemination', () => {
  it('advances epidemic spread without mutating the previous infected set', () => {
    const infected = new Set([0]);
    const next = advanceEpidemicRound({ infected, nodeCount: 10, fanout: 3, rng: () => 0.35 });

    expect(infected).toEqual(new Set([0]));
    expect(next).toEqual(new Set([0, 3]));
  });

  it('estimates logarithmic convergence for fanout gossip', () => {
    expect(estimateEpidemicConvergenceRounds(500, 1)).toBe(9);
    expect(estimateEpidemicConvergenceRounds(500, 3)).toBe(5);
  });
});
