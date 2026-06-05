import { useState } from 'react';
import { Wifi, AlertTriangle, Radio, X } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// §04 — the matchmaker. A tracker stores none of the file; it only brokers
// introductions. Kill it and a newcomer can't discover the swarm, even though
// every gold peer still holds every byte. The query-line SMIL runs on mount
// (the tracker starts online), so it's gated under reduced motion.
export default function TrackerLab() {
  const reduced = usePrefersReducedMotion();
  const [alive, setAlive] = useState(true);
  const W = 520,
    H = 300,
    cx = 260,
    cy = 140;
  const peers = [
    { x: 90, y: 70 },
    { x: 430, y: 70 },
    { x: 60, y: 175 },
    { x: 460, y: 175 },
    { x: 150, y: 50 },
    { x: 370, y: 50 },
  ];
  const nc = { x: 260, y: 268 };
  return (
    <div>
      <div className="tor-between" style={{ marginBottom: 14 }}>
        <div className="tor-seg">
          <button className={alive ? 'tor-on tor-sig' : ''} onClick={() => setAlive(true)}>
            Tracker online
          </button>
          <button
            className={!alive ? 'tor-on' : ''}
            style={
              !alive
                ? { color: 'var(--coral-2)', boxShadow: 'inset 0 0 0 1px rgba(244,113,93,0.4)' }
                : {}
            }
            onClick={() => setAlive(false)}
          >
            Tracker killed
          </button>
        </div>
        {alive ? (
          <span className="tor-badge tor-ok">
            <Wifi size={14} aria-hidden="true" />
            newcomer found 6 peers
          </span>
        ) : (
          <span className="tor-badge tor-bad">
            <AlertTriangle size={14} aria-hidden="true" />
            discovery failed
          </span>
        )}
      </div>
      <div className="tor-svgwrap">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="tracker as central matchmaker">
          {peers.map((p, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="var(--line-2)"
              strokeWidth="1"
              opacity={alive ? 0.6 : 0.18}
            />
          ))}
          <line
            x1={nc.x}
            y1={nc.y}
            x2={cx}
            y2={cy + 24}
            stroke={alive ? 'var(--signal)' : 'var(--coral)'}
            strokeWidth="1.8"
            strokeDasharray="5 4"
            opacity={alive ? 0.9 : 0.7}
          >
            {alive && !reduced && (
              <animate
                attributeName="stroke-dashoffset"
                from="9"
                to="0"
                dur="0.55s"
                repeatCount="indefinite"
              />
            )}
          </line>
          {peers.map((p, i) => (
            <g key={'p' + i}>
              <circle cx={p.x} cy={p.y} r="11" fill="none" stroke="var(--gold)" strokeWidth="2.5" />
              <circle
                cx={p.x}
                cy={p.y}
                r="5.5"
                fill="var(--gold)"
                opacity="0.9"
                style={{ filter: 'drop-shadow(0 0 5px var(--gold))' }}
              />
            </g>
          ))}
          <circle
            cx={cx}
            cy={cy}
            r="26"
            fill={alive ? 'rgba(84,210,193,0.1)' : 'rgba(244,113,93,0.08)'}
            stroke={alive ? 'var(--signal)' : 'var(--coral)'}
            strokeWidth="2"
          />
          <g
            transform={`translate(${cx - 9} ${cy - 9})`}
            style={{ color: alive ? 'var(--signal-2)' : 'var(--coral-2)' }}
          >
            {alive ? <Radio size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}
          </g>
          <text
            x={cx}
            y={cy + 44}
            textAnchor="middle"
            fontSize="10"
            fill={alive ? 'var(--signal-2)' : 'var(--coral-2)'}
          >
            {alive ? 'TRACKER' : 'TRACKER · DOWN'}
          </text>
          <circle
            cx={nc.x}
            cy={nc.y}
            r="10"
            fill="none"
            stroke={alive ? 'var(--signal)' : 'var(--coral)'}
            strokeWidth="2"
          />
          <text x={nc.x} y={nc.y + 25} textAnchor="middle" fontSize="9.5" fill="var(--mist)">
            newcomer
          </text>
          {!alive && (
            <text x={nc.x + 58} y={nc.y - 2} fontSize="11" fill="var(--coral-2)">
              ✕ can't find anyone
            </text>
          )}
        </svg>
      </div>
      <div className="tor-figcap" style={{ marginTop: 12 }}>
        The tracker stores none of the file — it only brokers introductions. Kill it and a newcomer
        can't discover the swarm, <b>even though every gold peer still holds every byte</b>. The
        introductions became the bottleneck. That's the weakness the next idea removes entirely.
      </div>
    </div>
  );
}
