import { useMemo, useRef, useState } from 'react';
import {
  applySuspectGossip,
  countMembershipStates,
  createIndirectProbeMessages,
  createIndirectTargetProbeMessages,
  createProbeRound,
  createSuspectGossipMessages,
  makeRng,
  resolveSuspicion,
  reviveDeadMemberIfTruthWasFalse,
  selectIndirectHelpers,
  toggleTruthAlive,
} from '../engine/index.js';
import { ClusterNode } from '../components/ClusterNode.jsx';
import { useRaf } from '../components/useRaf.js';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

export function FullClusterSim() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const W = 900,
    H = 520;
  const N = 24;
  const PERIOD_MS = 1400; // protocol period T

  const rng = useMemo(() => makeRng(101), []);
  const initialNodes = useMemo(() => {
    return Array.from({ length: N }, (_, i) => {
      const cols = 6,
        rows = 4;
      const c = i % cols,
        r = Math.floor(i / cols);
      const baseX = 100 + (c / (cols - 1)) * (W - 200);
      const baseY = 90 + (r / (rows - 1)) * (H - 200);
      return {
        id: i,
        x: baseX + (rng() - 0.5) * 50,
        y: baseY + (rng() - 0.5) * 36,
        // local state: the *truth* about this node
        truthAlive: true,
      };
    });
  }, [rng]);

  // protocol state per node (their VIEW of the cluster) — to keep this compact we keep one shared view
  // tracking each node's *globally reported* state
  const [nodeStates, setNodeStates] = useState(
    () => new Map(initialNodes.map((n) => [n.id, { state: 'alive', incarnation: 1 }])),
  );
  const [truthAlive, setTruthAlive] = useState(
    () => new Map(initialNodes.map((n) => [n.id, true])),
  );

  // active messages (probes, acks, gossip rides)
  const [messages, setMessages] = useState([]); // {id, fromId, toId, kind, progress, duration, success}
  const [round, setRound] = useState(0);
  const [running, setRunning] = useState(!reduced);

  const tickRef = useRef(0);
  const probesInFlight = useRef(new Map()); // probeId → { proberId, targetId, startedAt, indirectSent }

  // round timer
  useRaf((dt) => {
    if (!running) return;
    tickRef.current += dt;

    // each probe round: every node picks a target
    if (tickRef.current >= PERIOD_MS) {
      tickRef.current = 0;
      setRound((r) => r + 1);
      setNodeStates((curStates) => {
        setMessages((curMsgs) => {
          const { messages: probeMessages, probes } = createProbeRound({
            nodeStates: curStates,
            now: performance.now(),
          });
          for (const [probeId, probe] of probes.entries()) {
            probesInFlight.current.set(probeId, probe);
          }
          return [...curMsgs, ...probeMessages];
        });
        return curStates;
      });
    }

    // advance messages
    setMessages((prev) =>
      prev
        .map((m) => ({ ...m, progress: m.progress + dt / m.duration }))
        .filter((m) => {
          if (m.progress < 1) return true;
          // message arrived
          if (m.kind === 'probe') {
            // if target is alive in truth, schedule ack
            const targetAlive = truthAlive.get(m.toId);
            if (targetAlive) {
              setTimeout(() => {
                setMessages((cur) => [
                  ...cur,
                  {
                    id: `ack-${m.id}`,
                    fromId: m.toId,
                    toId: m.fromId,
                    kind: 'ack',
                    progress: 0,
                    duration: 700,
                    probeId: m.id,
                  },
                ]);
              }, 0);
            }
            // else: nothing happens — probe will time out via timer
          } else if (m.kind === 'ack') {
            // arrived back at prober — mark probe satisfied
            const probe = probesInFlight.current.get(m.probeId);
            if (probe) probe.satisfied = true;
          } else if (m.kind === 'indirect-probe') {
            const targetAlive = truthAlive.get(m.toId);
            if (targetAlive) {
              setTimeout(() => {
                setMessages((cur) => [
                  ...cur,
                  {
                    id: `iack-${m.id}`,
                    fromId: m.toId,
                    toId: m.fromId,
                    kind: 'indirect-ack',
                    progress: 0,
                    duration: 700,
                    originalProbeId: m.originalProbeId,
                  },
                ]);
              }, 0);
            }
          } else if (m.kind === 'indirect-ack') {
            // route back to the original prober
            const probe = probesInFlight.current.get(m.originalProbeId);
            if (probe) {
              setTimeout(() => {
                setMessages((cur) => [
                  ...cur,
                  {
                    id: `ifb-${m.id}`,
                    fromId: m.fromId,
                    toId: probe.proberId,
                    kind: 'indirect-feedback',
                    progress: 0,
                    duration: 600,
                    originalProbeId: m.originalProbeId,
                  },
                ]);
              }, 0);
            }
          } else if (m.kind === 'indirect-feedback') {
            const probe = probesInFlight.current.get(m.originalProbeId);
            if (probe) probe.satisfied = true;
          } else if (m.kind === 'gossip-suspect') {
            // apply suspect to receiver's view (we use shared world view as proxy)
            setNodeStates((curStates) => {
              const next = applySuspectGossip(curStates, m.payload);
              const cur = curStates.get(m.payload.targetId);
              if (cur?.state === 'alive' && cur.incarnation <= m.payload.incarnation) {
                // schedule suspicion timeout to confirm dead
                setTimeout(() => {
                  setNodeStates((cur2) => {
                    const targetAlive = truthAlive.get(m.payload.targetId);
                    return resolveSuspicion(cur2, { ...m.payload, targetAlive });
                  });
                }, 2400);
              }
              return next;
            });
          }
          return false;
        }),
    );

    // sweep for probe timeouts
    const now = performance.now();
    for (const [probeId, p] of probesInFlight.current.entries()) {
      if (p.satisfied) {
        probesInFlight.current.delete(probeId);
        continue;
      }
      if (!p.indirectSent && now - p.startedAt > 1100) {
        p.indirectSent = true;
        // send indirect probes via 2 helpers
        const helpers = selectIndirectHelpers({
          nodeStates,
          proberId: p.proberId,
          targetId: p.targetId,
          count: 2,
        });
        setMessages((cur) => [
          ...cur,
          ...createIndirectProbeMessages({
            probeId,
            proberId: p.proberId,
            targetId: p.targetId,
            helpers,
          }),
        ]);
        // also send the second leg after a small delay
        setTimeout(() => {
          setMessages((cur) => [
            ...cur,
            ...createIndirectTargetProbeMessages({ probeId, targetId: p.targetId, helpers }),
          ]);
        }, 650);
      }
      if (now - p.startedAt > 2800) {
        // full probe round failed → gossip suspect
        probesInFlight.current.delete(probeId);
        const targetState = nodeStates.get(p.targetId);
        if (targetState && targetState.state === 'alive') {
          // simulate gossip-suspect — broadcast to a few random nodes (as if piggybacked)
          setMessages((cur) => [
            ...cur,
            ...createSuspectGossipMessages({
              nodeStates,
              probeId,
              proberId: p.proberId,
              targetId: p.targetId,
              incarnation: targetState.incarnation,
            }),
          ]);
        }
      }
    }
  }, running && inView);

  // kill / revive a node
  const toggleNodeAlive = (id) => {
    setTruthAlive((prev) => toggleTruthAlive(prev, id));
    // if reviving, ensure we re-mark as alive with incarnation bump on next probe
    setNodeStates((prev) => {
      return reviveDeadMemberIfTruthWasFalse(prev, truthAlive, id);
    });
  };

  // stats
  const { alive, suspect, dead } = countMembershipStates(nodeStates);
  const inFlight = messages.length;

  return (
    <div ref={vpRef} className="swim-card" style={{ padding: 0, overflow: 'hidden' }}>
      <span className="swim-corner-ornament tl" />
      <span className="swim-corner-ornament tr" />
      <span className="swim-corner-ornament bl" />
      <span className="swim-corner-ornament br" />

      <div
        style={{
          padding: '18px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 18,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div className="swim-label" style={{ color: 'var(--ink-dim)' }}>
          Live cluster <span style={{ color: 'var(--brass)' }}>·</span> click any node to kill or
          revive
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            fontFamily: 'JetBrains Mono',
            fontSize: 11,
          }}
        >
          <span style={{ color: 'var(--ink-faint)' }}>
            R<span style={{ color: 'var(--brass)' }}>{round}</span>
          </span>
          <span className="swim-chip" data-tone="alive">
            <span className="swim-chip-dot" />
            {alive}
          </span>
          <span className="swim-chip" data-tone="suspect">
            <span className="swim-chip-dot" />
            {suspect}
          </span>
          <span className="swim-chip" data-tone="dead">
            <span className="swim-chip-dot" />
            {dead}
          </span>
          <button className="swim-btn" data-active={running} onClick={() => setRunning((r) => !r)}>
            {running ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', background: 'var(--bg-deeper)' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          className="dot-grid-bg"
          style={{ display: 'block' }}
        >
          {/* in-flight messages */}
          {messages.map((m) => {
            const from = initialNodes[m.fromId];
            const to = initialNodes[m.toId];
            if (!from || !to) return null;
            const t = Math.min(1, m.progress);
            const cx = from.x + (to.x - from.x) * t;
            const cy = from.y + (to.y - from.y) * t;
            const color =
              m.kind === 'probe' || m.kind === 'indirect-probe'
                ? 'var(--probe)'
                : m.kind === 'ack' || m.kind === 'indirect-ack' || m.kind === 'indirect-feedback'
                  ? 'var(--alive)'
                  : m.kind === 'gossip-suspect'
                    ? 'var(--suspect)'
                    : 'var(--gossip)';
            return (
              <g key={m.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={cx}
                  y2={cy}
                  stroke={color}
                  strokeOpacity={0.6}
                  strokeWidth={0.9}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={2.2}
                  fill={color}
                  style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                />
              </g>
            );
          })}
          {/* nodes */}
          {initialNodes.map((n) => {
            const ns = nodeStates.get(n.id);
            const state = ns?.state || 'alive';
            const realAlive = truthAlive.get(n.id);
            // node "ghost" frame if truth says dead but view says alive (lag)
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-label={`Toggle node ${n.id}`}
                onClick={() => toggleNodeAlive(n.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleNodeAlive(n.id);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* hit target */}
                <circle cx={n.x} cy={n.y} r="18" fill="transparent" />
                {/* "truth" tiny indicator: small mark if truth differs from view */}
                {!realAlive && state !== 'dead' && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="14"
                    fill="none"
                    stroke="var(--dead)"
                    strokeWidth="0.7"
                    strokeDasharray="2 3"
                    opacity="0.6"
                  />
                )}
                <ClusterNode
                  x={n.x}
                  y={n.y}
                  state={state}
                  size={7}
                  label={`n${n.id}`}
                  incarnation={ns?.incarnation}
                  pulse={state === 'suspect'}
                />
              </g>
            );
          })}
        </svg>
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            fontFamily: 'JetBrains Mono',
            fontSize: 10,
            color: 'var(--ink-faint)',
            letterSpacing: '0.1em',
          }}
        >
          {inFlight} packets in flight <span style={{ color: 'var(--brass)' }}>·</span> period T ={' '}
          {PERIOD_MS}ms
        </div>
      </div>

      <div
        style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
        }}
      >
        <div
          className="swim-mono"
          style={{ fontSize: 11, color: 'var(--ink-dim)', lineHeight: 1.6 }}
        >
          Click any green node to simulate it crashing. A dashed red ring appears immediately —
          that's the ground truth. The cluster doesn't know yet. Watch the probes find it: amber for
          suspect, red for confirmed dead. Click again to revive it; it rejoins with a bumped
          incarnation.
        </div>
      </div>
    </div>
  );
}
