export function makeRng(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomChoice(items, rng = Math.random) {
  if (items.length === 0) return null;
  return items[Math.floor(rng() * items.length)];
}

function liveMemberEntries(nodeStates) {
  return [...nodeStates.entries()].filter(([, state]) => state.state !== 'dead');
}

export function chooseProbeTarget(nodeStates, proberId, rng = Math.random) {
  const candidates = liveMemberEntries(nodeStates)
    .map(([id]) => id)
    .filter((id) => id !== proberId);
  return randomChoice(candidates, rng);
}

export function createProbeRound({ nodeStates, rng = Math.random, now = 0 }) {
  const messages = [];
  const probes = new Map();

  for (const [proberId] of liveMemberEntries(nodeStates)) {
    const targetId = chooseProbeTarget(nodeStates, proberId, rng);
    if (targetId === null) continue;

    const suffix = Math.floor(rng() * 0x100000)
      .toString(36)
      .padStart(4, '0');
    const probeId = `${proberId}->${targetId}-${suffix}`;
    messages.push({
      id: probeId,
      fromId: proberId,
      toId: targetId,
      kind: 'probe',
      progress: 0,
      duration: 700,
    });
    probes.set(probeId, {
      proberId,
      targetId,
      startedAt: now,
      indirectSent: false,
      satisfied: false,
    });
  }

  return { messages, probes };
}

export function selectIndirectHelpers({
  nodeStates,
  proberId,
  targetId,
  count = 2,
  rng = Math.random,
}) {
  const candidates = liveMemberEntries(nodeStates)
    .map(([id]) => id)
    .filter((id) => id !== proberId && id !== targetId);
  const helpers = [];

  while (helpers.length < count && candidates.length > 0) {
    const idx = Math.floor(rng() * candidates.length);
    helpers.push(candidates.splice(idx, 1)[0]);
  }

  return helpers;
}

export function createIndirectProbeMessages({ probeId, proberId, targetId, helpers }) {
  return helpers.map((helperId) => ({
    id: `ip-${probeId}-${helperId}`,
    fromId: proberId,
    toId: helperId,
    kind: 'indirect-probe',
    progress: 0,
    duration: 600,
    originalProbeId: probeId,
    finalTarget: targetId,
  }));
}

export function createIndirectTargetProbeMessages({ probeId, targetId, helpers }) {
  return helpers.map((helperId) => ({
    id: `ip2-${probeId}-${helperId}`,
    fromId: helperId,
    toId: targetId,
    kind: 'indirect-probe',
    progress: 0,
    duration: 700,
    originalProbeId: probeId,
  }));
}

export function createSuspectGossipMessages({
  nodeStates,
  probeId,
  proberId,
  targetId,
  incarnation,
  limit = 4,
}) {
  const broadcastTargets = [...nodeStates.keys()].filter((id) => id !== targetId).slice(0, limit);
  return broadcastTargets.map((receiverId) => ({
    id: `gs-${probeId}-${receiverId}`,
    fromId: proberId,
    toId: receiverId,
    kind: 'gossip-suspect',
    progress: 0,
    duration: 800,
    payload: { targetId, incarnation },
  }));
}

export function applySuspectGossip(nodeStates, { targetId, incarnation }) {
  const next = new Map(nodeStates);
  const current = next.get(targetId);

  if (current && current.state === 'alive' && current.incarnation <= incarnation) {
    next.set(targetId, { state: 'suspect', incarnation });
  }

  return next;
}

export function resolveSuspicion(nodeStates, { targetId, incarnation, targetAlive }) {
  const next = new Map(nodeStates);
  const current = next.get(targetId);

  if (current && current.state === 'suspect' && current.incarnation === incarnation) {
    next.set(
      targetId,
      targetAlive
        ? { state: 'alive', incarnation: current.incarnation + 1 }
        : { state: 'dead', incarnation: current.incarnation },
    );
  }

  return next;
}

export function toggleTruthAlive(truthAlive, id) {
  const next = new Map(truthAlive);
  next.set(id, !next.get(id));
  return next;
}

export function reviveDeadMemberIfTruthWasFalse(nodeStates, truthAlive, id) {
  const next = new Map(nodeStates);
  const current = next.get(id);

  if (current && current.state === 'dead' && truthAlive.get(id) === false) {
    next.set(id, { state: 'alive', incarnation: current.incarnation + 1 });
  }

  return next;
}

export function countMembershipStates(nodeStates) {
  const counts = { alive: 0, suspect: 0, dead: 0 };
  for (const state of nodeStates.values()) {
    if (state.state in counts) counts[state.state] += 1;
  }
  return counts;
}

export function advanceEpidemicRound({ infected, nodeCount, fanout, rng = Math.random }) {
  const next = new Set(infected);
  for (const _id of infected) {
    for (let k = 0; k < fanout; k++) {
      next.add(Math.floor(rng() * nodeCount));
    }
  }
  return next;
}

export function estimateEpidemicConvergenceRounds(nodeCount, fanout) {
  return Math.max(1, Math.ceil(Math.log(nodeCount) / Math.log(1 + fanout)));
}
