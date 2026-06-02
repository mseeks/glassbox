import { useState, useEffect } from 'react';
import { Node } from '../components/Node.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

export function PartitionLab() {
  const reduced = usePrefersReducedMotion();
  const [partitioned, setPartitioned] = useState(false);
  const [tick, setTick] = useState(0);
  // values: each system has 3 nodes; default value = 0
  const [cpVals, setCpVals] = useState([0, 0, 0]);
  const [apVals, setApVals] = useState([0, 0, 0]);
  const [logCP, setLogCP] = useState([
    { t: '00:00', kind: 'info', text: 'cluster online: N1 leader' },
  ]);
  const [logAP, setLogAP] = useState([
    { t: '00:00', kind: 'info', text: 'cluster online: leaderless' },
  ]);

  useEffect(() => {
    if (reduced) return; // reduced motion: hold a static frame, no live re-render tick
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, [reduced]);

  // CP cluster: 3 nodes, partition splits N1 (minority) | N2,N3 (majority)
  // N1 is the original leader; during partition, N2/N3 elect new leader.
  // CP rule: minority side becomes unavailable; majority continues.

  // AP cluster: 3 nodes, no leader. Each accepts writes locally and
  // gossips. During partition, both sides keep serving but diverge.

  const stamp = () => {
    const s = Math.floor((tick * 60) / 1000);
    return `00:${String(s).padStart(2, '0')}`;
  };

  const writeCP = (side) => {
    const newVal = Math.floor(Math.random() * 89) + 10; // 10..99
    if (!partitioned) {
      setCpVals([newVal, newVal, newVal]);
      setLogCP((l) => [
        ...l.slice(-4),
        { t: stamp(), kind: 'ok', text: `write x=${newVal} → leader → all replicated` },
      ]);
    } else {
      if (side === 'minority') {
        setLogCP((l) => [
          ...l.slice(-4),
          { t: stamp(), kind: 'fail', text: `write x=${newVal} on N1 → ERROR no quorum` },
        ]);
      } else {
        setCpVals((v) => [v[0], newVal, newVal]); // N1 stranded with old value
        setLogCP((l) => [
          ...l.slice(-4),
          { t: stamp(), kind: 'ok', text: `write x=${newVal} → new leader N2 → N3 ack` },
        ]);
      }
    }
  };

  const readCP = (side) => {
    if (!partitioned) {
      setLogCP((l) => [
        ...l.slice(-4),
        { t: stamp(), kind: 'ok', text: `read x → ${cpVals[0]} (linearizable)` },
      ]);
    } else {
      if (side === 'minority') {
        setLogCP((l) => [
          ...l.slice(-4),
          { t: stamp(), kind: 'fail', text: 'read x on N1 → ERROR no quorum' },
        ]);
      } else {
        setLogCP((l) => [
          ...l.slice(-4),
          { t: stamp(), kind: 'ok', text: `read x on N2 → ${cpVals[1]} (linearizable)` },
        ]);
      }
    }
  };

  const writeAP = (side) => {
    const newVal = Math.floor(Math.random() * 89) + 10;
    if (!partitioned) {
      setApVals([newVal, newVal, newVal]);
      setLogAP((l) => [
        ...l.slice(-4),
        { t: stamp(), kind: 'ok', text: `write x=${newVal} → all nodes (gossip)` },
      ]);
    } else {
      if (side === 'minority') {
        setApVals((v) => [newVal, v[1], v[2]]);
        setLogAP((l) => [
          ...l.slice(-4),
          { t: stamp(), kind: 'warn', text: `write x=${newVal} on N1 → ACCEPTED (diverges)` },
        ]);
      } else {
        setApVals((v) => [v[0], newVal, newVal]);
        setLogAP((l) => [
          ...l.slice(-4),
          { t: stamp(), kind: 'warn', text: `write x=${newVal} on N2,N3 → ACCEPTED (diverges)` },
        ]);
      }
    }
  };

  const readAP = (side) => {
    if (!partitioned) {
      setLogAP((l) => [
        ...l.slice(-4),
        { t: stamp(), kind: 'ok', text: `read x → ${apVals[0]} (converged)` },
      ]);
    } else {
      if (side === 'minority') {
        setLogAP((l) => [
          ...l.slice(-4),
          { t: stamp(), kind: 'warn', text: `read x on N1 → ${apVals[0]} (may be stale)` },
        ]);
      } else {
        setLogAP((l) => [
          ...l.slice(-4),
          { t: stamp(), kind: 'warn', text: `read x on N2 → ${apVals[1]} (may be stale)` },
        ]);
      }
    }
  };

  const togglePartition = () => {
    if (!partitioned) {
      setPartitioned(true);
      setLogCP((l) => [
        ...l.slice(-4),
        { t: stamp(), kind: 'fail', text: '✕ partition: N1 isolated' },
      ]);
      setLogAP((l) => [
        ...l.slice(-4),
        { t: stamp(), kind: 'fail', text: '✕ partition: N1 isolated' },
      ]);
    } else {
      // heal
      setPartitioned(false);
      // CP heals: leader's value propagates back
      const cpFinal = cpVals[1];
      setCpVals([cpFinal, cpFinal, cpFinal]);
      setLogCP((l) => [
        ...l.slice(-4),
        { t: stamp(), kind: 'ok', text: `↺ heal: N1 catches up to x=${cpFinal}` },
      ]);
      // AP heals: pick one (LWW), or surface conflict
      const apFinal = Math.max(apVals[0], apVals[1]);
      setApVals([apFinal, apFinal, apFinal]);
      setLogAP((l) => [
        ...l.slice(-4),
        { t: stamp(), kind: 'warn', text: `↺ heal: conflict resolved (LWW: x=${apFinal})` },
      ]);
    }
  };

  const reset = () => {
    setPartitioned(false);
    setCpVals([0, 0, 0]);
    setApVals([0, 0, 0]);
    setLogCP([{ t: '00:00', kind: 'info', text: 'cluster online: N1 leader' }]);
    setLogAP([{ t: '00:00', kind: 'info', text: 'cluster online: leaderless' }]);
  };

  return (
    <div className="panel" style={{ padding: 0, background: 'var(--bg-deep)' }}>
      {/* Master controls — sticky within the lab so the heal button
          stays visible as the user scrolls through both clusters */}
      <div
        style={{
          position: 'sticky',
          top: 46, // sits just below the page-level top nav
          zIndex: 10,
          padding: '14px 18px',
          background: 'rgba(5, 8, 15, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'var(--ink-faint)',
            textTransform: 'uppercase',
            marginRight: 4,
          }}
        >
          Network
        </div>
        <button
          className={partitioned ? 'btn' : 'btn primary'}
          onClick={togglePartition}
          style={{ fontSize: 11, padding: '7px 12px' }}
        >
          {partitioned ? '↺ Heal partition' : '✕ Trigger partition'}
        </button>
        <button className="btn" onClick={reset} style={{ fontSize: 11, padding: '7px 12px' }}>
          Reset
        </button>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontFamily: 'Spectral, serif',
            fontStyle: 'italic',
            fontSize: 12,
            color: partitioned ? 'var(--coral)' : 'var(--emerald)',
          }}
        >
          {partitioned ? 'divided · N1 | N2 N3' : 'all reachable'}
        </div>
      </div>

      {/* Two panels: side-by-side on desktop, stacked on mobile */}
      <div className="stack-on-mobile-wide">
        <ClusterPanel
          title="CP cluster"
          subtitle="Raft-style, prefers consistency"
          nodes={[
            {
              label: 'N1',
              value: cpVals[0],
              state: partitioned ? 'unavail' : 'consistent',
              side: 'minority',
            },
            { label: 'N2', value: cpVals[1], state: 'consistent', side: 'majority' },
            { label: 'N3', value: cpVals[2], state: 'consistent', side: 'majority' },
          ]}
          partitioned={partitioned}
          onWriteMinority={() => writeCP('minority')}
          onReadMinority={() => readCP('minority')}
          onWriteMajority={() => writeCP('majority')}
          onReadMajority={() => readCP('majority')}
          log={logCP}
          accent="var(--emerald)"
        />
        <ClusterPanel
          title="AP cluster"
          subtitle="Dynamo-style, prefers availability"
          nodes={[
            {
              label: 'N1',
              value: apVals[0],
              state: partitioned ? 'available' : 'alive',
              side: 'minority',
            },
            { label: 'N2', value: apVals[1], state: 'alive', side: 'majority' },
            { label: 'N3', value: apVals[2], state: 'alive', side: 'majority' },
          ]}
          partitioned={partitioned}
          onWriteMinority={() => writeAP('minority')}
          onReadMinority={() => readAP('minority')}
          onWriteMajority={() => writeAP('majority')}
          onReadMajority={() => readAP('majority')}
          log={logAP}
          accent="var(--cyan)"
        />
      </div>
    </div>
  );
}

function ClusterPanel({
  title,
  subtitle,
  nodes,
  partitioned,
  onWriteMinority,
  onReadMinority,
  onWriteMajority,
  onReadMajority,
  log,
  accent,
}) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        padding: '22px 22px 24px',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: 'Spectral, serif',
            fontWeight: 400,
            fontSize: 19,
            color: accent,
            marginBottom: 2,
            letterSpacing: '-0.005em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: 'Spectral, serif',
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--ink-faint)',
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Mini cluster visualization */}
      <svg viewBox="0 0 300 140" style={{ width: '100%', height: 'auto', marginBottom: 14 }}>
        <Node
          x={50}
          y={70}
          r={24}
          label={nodes[0].label}
          state={nodes[0].state}
          value={`x=${nodes[0].value}`}
        />
        <Node
          x={170}
          y={50}
          r={24}
          label={nodes[1].label}
          state={nodes[1].state}
          value={`x=${nodes[1].value}`}
        />
        <Node
          x={250}
          y={90}
          r={24}
          label={nodes[2].label}
          state={nodes[2].state}
          value={`x=${nodes[2].value}`}
        />

        {/* Connections */}
        {!partitioned ? (
          <>
            <line
              x1="73"
              y1="68"
              x2="148"
              y2="55"
              stroke={accent}
              strokeOpacity="0.4"
              strokeWidth="0.8"
            />
            <line
              x1="190"
              y1="55"
              x2="228"
              y2="86"
              stroke={accent}
              strokeOpacity="0.4"
              strokeWidth="0.8"
            />
            <line
              x1="74"
              y1="74"
              x2="227"
              y2="92"
              stroke={accent}
              strokeOpacity="0.3"
              strokeWidth="0.8"
            />
          </>
        ) : (
          <>
            {/* N2-N3 connection alive */}
            <line
              x1="190"
              y1="55"
              x2="228"
              y2="86"
              stroke={accent}
              strokeOpacity="0.5"
              strokeWidth="0.8"
            />
            {/* N1-N2 partitioned */}
            <line
              x1="73"
              y1="66"
              x2="110"
              y2="60"
              stroke="var(--coral)"
              strokeOpacity="0.4"
              strokeDasharray="3,3"
              strokeWidth="0.8"
            />
            <line
              x1="130"
              y1="58"
              x2="148"
              y2="55"
              stroke="var(--coral)"
              strokeOpacity="0.4"
              strokeDasharray="3,3"
              strokeWidth="0.8"
            />
            {/* N1-N3 partitioned */}
            <line
              x1="74"
              y1="74"
              x2="110"
              y2="80"
              stroke="var(--coral)"
              strokeOpacity="0.4"
              strokeDasharray="3,3"
              strokeWidth="0.8"
            />
            <line
              x1="130"
              y1="84"
              x2="227"
              y2="92"
              stroke="var(--coral)"
              strokeOpacity="0.4"
              strokeDasharray="3,3"
              strokeWidth="0.8"
            />
            <g transform="translate(120, 70)">
              <line x1="-6" y1="-7" x2="6" y2="7" stroke="var(--coral)" strokeWidth="1.1" />
              <line x1="6" y1="-7" x2="-6" y2="7" stroke="var(--coral)" strokeWidth="1.1" />
            </g>
          </>
        )}

        {partitioned && (
          <>
            <text
              x="50"
              y="125"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8"
              fill="var(--coral)"
              letterSpacing="0.1em"
            >
              MINORITY
            </text>
            <text
              x="210"
              y="125"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8"
              fill={accent}
              letterSpacing="0.1em"
            >
              MAJORITY
            </text>
          </>
        )}
      </svg>

      {/* Action buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          marginBottom: 14,
          fontSize: 10,
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            letterSpacing: '0.15em',
            color: 'var(--ink-faint)',
            textTransform: 'uppercase',
          }}
        >
          N1 (minority side)
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            letterSpacing: '0.15em',
            color: 'var(--ink-faint)',
            textTransform: 'uppercase',
          }}
        >
          N2, N3 (majority side)
        </div>
        <button
          className="btn"
          style={{ fontSize: 10, padding: '7px 10px' }}
          onClick={onWriteMinority}
        >
          write
        </button>
        <button
          className="btn"
          style={{ fontSize: 10, padding: '7px 10px' }}
          onClick={onWriteMajority}
        >
          write
        </button>
        <button
          className="btn"
          style={{ fontSize: 10, padding: '7px 10px' }}
          onClick={onReadMinority}
        >
          read
        </button>
        <button
          className="btn"
          style={{ fontSize: 10, padding: '7px 10px' }}
          onClick={onReadMajority}
        >
          read
        </button>
      </div>

      {/* Log */}
      <div
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid var(--border)',
          padding: '12px 14px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          lineHeight: 1.65,
          minHeight: 130,
          maxHeight: 130,
          overflow: 'hidden',
        }}
      >
        {log.map((entry, i) => {
          const colors = {
            ok: 'var(--emerald)',
            fail: 'var(--coral)',
            warn: 'var(--amber)',
            info: 'var(--ink-dim)',
          };
          return (
            <div
              key={i}
              style={{
                color: colors[entry.kind],
                opacity: 0.5 + (i / log.length) * 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span style={{ color: 'var(--ink-faint)' }}>{entry.t}</span> {entry.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
