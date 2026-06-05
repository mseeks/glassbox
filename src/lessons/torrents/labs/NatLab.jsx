import { useState } from 'react';
import { Share2, AlertTriangle, Wifi, Radio, X } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

// §06 — reaching through the wall. Most peers sit behind a NAT that drops
// unannounced inbound connections, so a direct dial fails. The fix: both peers
// fire outward to a shared rendezvous, each router records an outbound mapping,
// and a direct path opens. The hole-punch SMIL is gated under reduced motion.
export default function NatLab() {
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState('direct'); // 'direct' | 'punch'
  const W = 520,
    H = 300;
  const A = { x: 54, y: 236 },
    RA = { x: 120, y: 150 },
    B = { x: 466, y: 236 },
    RB = { x: 400, y: 150 },
    CO = { x: 260, y: 46 };
  const punched = mode === 'punch';
  const Router = ({ c, label }) => (
    <g>
      <rect
        x={c.x - 26}
        y={c.y - 18}
        width="52"
        height="36"
        rx="7"
        fill="var(--panel-2)"
        stroke="var(--line-2)"
        strokeWidth="1.2"
      />
      <g transform={`translate(${c.x - 8} ${c.y - 8})`} style={{ color: 'var(--mist)' }}>
        <Wifi size={16} aria-hidden="true" />
      </g>
      <text x={c.x} y={c.y + 32} textAnchor="middle" fontSize="9" fill="var(--faint)">
        {label}
      </text>
    </g>
  );
  return (
    <div>
      <div className="tor-between" style={{ marginBottom: 14 }}>
        <div className="tor-seg">
          <button
            className={mode === 'direct' ? 'tor-on' : ''}
            style={
              mode === 'direct'
                ? { color: 'var(--coral-2)', boxShadow: 'inset 0 0 0 1px rgba(244,113,93,0.4)' }
                : {}
            }
            onClick={() => setMode('direct')}
          >
            Direct attempt
          </button>
          <button className={punched ? 'tor-on tor-sig' : ''} onClick={() => setMode('punch')}>
            Hole-punched
          </button>
        </div>
        {punched ? (
          <span className="tor-badge tor-ok">
            <Share2 size={14} aria-hidden="true" />
            direct path open
          </span>
        ) : (
          <span className="tor-badge tor-bad">
            <AlertTriangle size={14} aria-hidden="true" />
            dropped — no inbound mapping
          </span>
        )}
      </div>
      <div className="tor-svgwrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="two peers behind routers attempting to connect"
        >
          <circle
            cx={CO.x}
            cy={CO.y}
            r="13"
            fill="var(--violet-dim)"
            stroke="var(--violet)"
            strokeWidth="1.4"
          />
          <g transform={`translate(${CO.x - 8} ${CO.y - 8})`} style={{ color: 'var(--violet-2)' }}>
            <Radio size={16} aria-hidden="true" />
          </g>
          <text x={CO.x} y={CO.y - 20} textAnchor="middle" fontSize="9" fill="var(--violet-2)">
            rendezvous
          </text>

          <line
            x1={A.x}
            y1={A.y}
            x2={RA.x}
            y2={RA.y + 16}
            stroke="var(--line-2)"
            strokeWidth="1.4"
          />
          <line
            x1={B.x}
            y1={B.y}
            x2={RB.x}
            y2={RB.y + 16}
            stroke="var(--line-2)"
            strokeWidth="1.4"
          />

          {!punched && (
            <>
              <line
                x1={RA.x + 26}
                y1={RA.y}
                x2={356}
                y2={RA.y}
                stroke="var(--coral)"
                strokeWidth="1.8"
                strokeDasharray="5 4"
              />
              <g transform={`translate(${362} ${RA.y - 8})`} style={{ color: 'var(--coral-2)' }}>
                <X size={16} aria-hidden="true" />
              </g>
              <text x={372} y={RA.y + 20} fontSize="9.5" fill="var(--coral-2)">
                no inbound mapping → dropped
              </text>
              <text x={A.x} y={A.y + 22} textAnchor="middle" fontSize="9.5" fill="var(--mist)">
                peer A
              </text>
              <text x={B.x} y={B.y + 22} textAnchor="middle" fontSize="9.5" fill="var(--mist)">
                peer B
              </text>
            </>
          )}

          {punched && (
            <>
              <line
                x1={RA.x}
                y1={RA.y - 18}
                x2={CO.x - 10}
                y2={CO.y + 10}
                stroke="var(--signal)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              >
                {!reduced && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="8"
                    to="0"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
              <line
                x1={RB.x}
                y1={RB.y - 18}
                x2={CO.x + 10}
                y2={CO.y + 10}
                stroke="var(--signal)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.8"
              >
                {!reduced && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="8"
                    to="0"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
              <line
                x1={RA.x + 26}
                y1={RA.y}
                x2={RB.x - 26}
                y2={RB.y}
                stroke="var(--signal-2)"
                strokeWidth="2.2"
              >
                {!reduced && (
                  <animate
                    attributeName="stroke-dasharray"
                    from="0 300"
                    to="300 0"
                    dur="0.8s"
                    fill="freeze"
                  />
                )}
              </line>
              <text x={260} y={RA.y - 12} textAnchor="middle" fontSize="9.5" fill="var(--signal-2)">
                direct µTP/UDP path
              </text>
              <text x={A.x} y={A.y + 22} textAnchor="middle" fontSize="9.5" fill="var(--signal-2)">
                peer A
              </text>
              <text x={B.x} y={B.y + 22} textAnchor="middle" fontSize="9.5" fill="var(--signal-2)">
                peer B
              </text>
            </>
          )}

          <Router c={RA} label="router A" />
          <Router c={RB} label="router B" />
          {[A, B].map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="9"
                fill={punched ? 'var(--signal)' : 'var(--coral)'}
                opacity="0.92"
                style={{
                  filter: `drop-shadow(0 0 6px ${punched ? 'var(--signal)' : 'var(--coral)'})`,
                  transition: 'fill .3s',
                }}
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="tor-figcap" style={{ marginTop: 12 }}>
        Most peers sit behind a home router doing <b>network address translation</b> — it forwards
        replies to connections you started, but silently drops connections that arrive unannounced.
        So a direct dial fails. The fix: both peers fire packets <i>outward</i> to a shared
        rendezvous, so each router records an outbound mapping. Once both holes are open, packets
        flow <span style={{ color: 'var(--signal-2)' }}>directly</span> between them — no relay in
        the path. Torrents run this over UDP with a custom transport that also backs off politely
        when it senses it's congesting your link.
      </div>
    </div>
  );
}
