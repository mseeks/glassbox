import { useState } from 'react';
import { ClusterNode } from '../components/ClusterNode.jsx';

export function StateMachineInteractive() {
  const [state, setState] = useState('alive'); // 'alive' | 'suspect' | 'dead'
  const [incarnation, setIncarnation] = useState(1);
  const [log, setLog] = useState([{ kind: 'init', text: 'Initial state: ALIVE, incarnation = 1' }]);

  const addLog = (text, kind) => setLog((l) => [...l.slice(-6), { kind, text }]);

  const events = [
    {
      id: 'probe-fail',
      label: 'Probe times out',
      enabledIn: ['alive'],
      apply: () => {
        setState('suspect');
        addLog(`Direct + indirect probe failed → SUSPECT(i=${incarnation})`, 'suspect');
      },
    },
    {
      id: 'refute',
      label: 'Hear alive(i+1) from self',
      enabledIn: ['suspect'],
      apply: () => {
        const ni = incarnation + 1;
        setIncarnation(ni);
        setState('alive');
        addLog(`Refutation received: alive(i=${ni}) → back to ALIVE`, 'alive');
      },
    },
    {
      id: 'suspect-timeout',
      label: 'Suspicion timer fires',
      enabledIn: ['suspect'],
      apply: () => {
        setState('dead');
        addLog(`Suspicion timeout elapsed → DEAD(i=${incarnation}) · absorbing`, 'dead');
      },
    },
    {
      id: 'reset',
      label: 'Reset (new generation)',
      enabledIn: ['alive', 'suspect', 'dead'],
      apply: () => {
        setIncarnation(1);
        setState('alive');
        setLog([{ kind: 'init', text: 'Reset: ALIVE, incarnation = 1' }]);
      },
    },
  ];

  // SVG layout for the three states
  const W = 720,
    H = 320;
  const positions = {
    alive: { x: 130, y: 160 },
    suspect: { x: 360, y: 160 },
    dead: { x: 600, y: 160 },
  };

  return (
    <div className="swim-card" style={{ padding: 0, overflow: 'hidden' }}>
      <span className="swim-corner-ornament tl" />
      <span className="swim-corner-ornament tr" />
      <span className="swim-corner-ornament bl" />
      <span className="swim-corner-ornament br" />

      <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
        <div className="swim-label" style={{ color: 'var(--ink-dim)' }}>
          One member's lifecycle, as viewed by everyone else
        </div>
      </div>

      <div style={{ position: 'relative', background: 'var(--bg-deeper)' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          className="dot-grid-bg"
          style={{ display: 'block' }}
        >
          {/* arrows */}
          <defs>
            <marker
              id="sm-arr"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--brass)" />
            </marker>
            <marker
              id="sm-arr-dim"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-faint)" />
            </marker>
          </defs>

          {/* alive → suspect */}
          <path
            d="M 175 145 Q 245 100, 315 145"
            fill="none"
            stroke="var(--brass)"
            strokeWidth="1.2"
            strokeDasharray={state === 'alive' ? '' : '3 3'}
            opacity={state === 'alive' ? 1 : 0.4}
            markerEnd="url(#sm-arr)"
          />
          <text
            x="245"
            y="92"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="10"
            fill="var(--brass)"
            letterSpacing="0.08em"
            opacity={state === 'alive' ? 1 : 0.5}
          >
            probe fails
          </text>

          {/* suspect → alive (refute) */}
          <path
            d="M 315 180 Q 245 220, 175 180"
            fill="none"
            stroke="var(--alive)"
            strokeWidth="1.2"
            strokeDasharray={state === 'suspect' ? '' : '3 3'}
            opacity={state === 'suspect' ? 1 : 0.35}
            markerEnd="url(#sm-arr-dim)"
          />
          <text
            x="245"
            y="236"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="10"
            fill="var(--alive)"
            letterSpacing="0.08em"
            opacity={state === 'suspect' ? 1 : 0.4}
          >
            refute(i+1)
          </text>

          {/* suspect → dead */}
          <path
            d="M 405 160 L 555 160"
            fill="none"
            stroke="var(--dead)"
            strokeWidth="1.2"
            strokeDasharray={state === 'suspect' ? '' : '3 3'}
            opacity={state === 'suspect' ? 1 : 0.35}
            markerEnd="url(#sm-arr)"
          />
          <text
            x="480"
            y="148"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="10"
            fill="var(--dead)"
            letterSpacing="0.08em"
            opacity={state === 'suspect' ? 1 : 0.4}
          >
            timeout
          </text>

          {/* absorbing loop on dead */}
          <text
            x="600"
            y="232"
            textAnchor="middle"
            fontFamily="Cormorant Garamond, serif"
            fontSize="11"
            fontStyle="italic"
            fill="var(--ink-label)"
          >
            (absorbing)
          </text>

          {/* the three nodes */}
          <g>
            <ClusterNode
              x={positions.alive.x}
              y={positions.alive.y}
              state="alive"
              size={state === 'alive' ? 18 : 12}
              pulse={state === 'alive'}
              dim={state !== 'alive'}
            />
            <text
              x={positions.alive.x}
              y={positions.alive.y + 44}
              textAnchor="middle"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              fill={state === 'alive' ? 'var(--alive)' : 'var(--ink-label)'}
              letterSpacing="0.12em"
            >
              ALIVE
            </text>

            <ClusterNode
              x={positions.suspect.x}
              y={positions.suspect.y}
              state="suspect"
              size={state === 'suspect' ? 18 : 12}
              pulse={state === 'suspect'}
              dim={state !== 'suspect'}
            />
            <text
              x={positions.suspect.x}
              y={positions.suspect.y + 44}
              textAnchor="middle"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              fill={state === 'suspect' ? 'var(--suspect)' : 'var(--ink-label)'}
              letterSpacing="0.12em"
            >
              SUSPECT
            </text>

            <ClusterNode
              x={positions.dead.x}
              y={positions.dead.y}
              state="dead"
              size={state === 'dead' ? 18 : 12}
              dim={state !== 'dead'}
            />
            <text
              x={positions.dead.x}
              y={positions.dead.y + 44}
              textAnchor="middle"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
              fill={state === 'dead' ? 'var(--dead)' : 'var(--ink-label)'}
              letterSpacing="0.12em"
            >
              DEAD
            </text>
          </g>

          {/* incarnation indicator */}
          <g transform="translate(40, 36)">
            <text
              fontFamily="JetBrains Mono, monospace"
              fontSize="9.5"
              letterSpacing="0.16em"
              fill="var(--ink-label)"
            >
              CURRENT
            </text>
            <text
              y="20"
              fontFamily="Cormorant Garamond, serif"
              fontSize="22"
              fill="var(--brass)"
              fontStyle="italic"
            >
              i = {incarnation}
            </text>
          </g>
        </svg>
      </div>

      <div
        style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div className="swim-label" style={{ color: 'var(--ink-label)' }}>
          Events
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {events.map((ev) => {
            const enabled = ev.enabledIn.includes(state);
            return (
              <button
                key={ev.id}
                className="swim-btn"
                onClick={() => enabled && ev.apply()}
                disabled={!enabled}
                style={{
                  flex: ev.id === 'reset' ? '0 0 auto' : '1 1 auto',
                  justifyContent: 'center',
                }}
              >
                {ev.label}
              </button>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            background: 'var(--bg-deeper)',
            border: '1px solid var(--border)',
            padding: 12,
            borderRadius: 3,
            minHeight: 110,
            maxHeight: 140,
            overflowY: 'auto',
          }}
        >
          {log.map((l, i) => (
            <div
              key={i}
              style={{
                color:
                  l.kind === 'alive'
                    ? 'var(--alive)'
                    : l.kind === 'suspect'
                      ? 'var(--suspect)'
                      : l.kind === 'dead'
                        ? 'var(--dead)'
                        : 'var(--ink-dim)',
                padding: '2px 0',
              }}
            >
              <span style={{ color: 'var(--ink-faint)' }}>›</span> {l.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
