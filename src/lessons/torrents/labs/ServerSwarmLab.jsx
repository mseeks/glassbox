import { useState } from 'react';
import {
  DOWNLINK,
  SERVER_CAP,
  PEER_UP,
  serverPP,
  swarmPerPeer,
  serverTotal,
  swarmTotal,
} from '../engine/index.js';
import { Stat } from '../components/widgets.jsx';

// §01 — the inversion. One server splits a fixed pipe ever thinner toward zero;
// a swarm's supply grows with the crowd, so its per-peer rate holds steady and
// its total climbs past the server's ceiling. The model lives in the engine.
export default function ServerSwarmLab() {
  const [n, setN] = useState(40);
  const [mode, setMode] = useState('swarm');
  const W = 720,
    H = 240,
    PL = 46,
    PR = 18,
    PT = 16,
    PB = 34;
  const maxN = 120;
  const xs = (v) => PL + ((v - 1) / (maxN - 1)) * (W - PL - PR);
  const ys = (v) => H - PB - (v / DOWNLINK) * (H - PT - PB);
  const line = (fn) => {
    let d = '';
    for (let v = 1; v <= maxN; v++)
      d += (v === 1 ? 'M' : 'L') + xs(v).toFixed(1) + ' ' + ys(fn(v)).toFixed(1) + ' ';
    return d;
  };
  const sPP = serverPP(n),
    wPP = swarmPerPeer(n);
  const pct = ((n - 1) / (maxN - 1)) * 100;
  return (
    <div>
      <div className="tor-between" style={{ marginBottom: 16 }}>
        <div className="tor-seg">
          <button className={mode === 'server' ? 'tor-on' : ''} onClick={() => setMode('server')}>
            Single server
          </button>
          <button
            className={mode === 'swarm' ? 'tor-on tor-sig' : ''}
            onClick={() => setMode('swarm')}
          >
            Swarm
          </button>
        </div>
        <div className="tor-row" style={{ gap: 18 }}>
          <Stat
            v={(mode === 'server' ? sPP : wPP).toFixed(1)}
            l="your speed · MB/s"
            color={mode === 'server' ? 'var(--coral-2)' : 'var(--signal-2)'}
          />
          <Stat
            v={(mode === 'server' ? serverTotal(n) : swarmTotal(n)).toFixed(0)}
            l="swarm total · MB/s"
            color="var(--mist)"
          />
        </div>
      </div>

      <div className="tor-svgwrap" style={{ marginBottom: 6 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="per-peer download speed vs number of downloaders"
        >
          {[0, 5, 10, 15, 20, 25].map((g) => (
            <g key={g}>
              <line x1={PL} x2={W - PR} y1={ys(g)} y2={ys(g)} stroke="var(--line)" />
              <text x={PL - 8} y={ys(g) + 3} textAnchor="end" fontSize="9" fill="var(--faint)">
                {g}
              </text>
            </g>
          ))}
          <text
            x={PL - 30}
            y={PT + 6}
            fontSize="9"
            fill="var(--faint)"
            transform={`rotate(-90 ${PL - 30} ${H / 2})`}
            textAnchor="middle"
          >
            MB/s each
          </text>
          <path
            d={line(serverPP)}
            fill="none"
            stroke="var(--coral)"
            strokeWidth={mode === 'server' ? 2.4 : 1.2}
            opacity={mode === 'server' ? 1 : 0.32}
          />
          <path
            d={line(swarmPerPeer)}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={mode === 'swarm' ? 2.4 : 1.2}
            opacity={mode === 'swarm' ? 1 : 0.32}
          />
          <line
            x1={xs(n)}
            x2={xs(n)}
            y1={PT}
            y2={H - PB}
            stroke="var(--gold)"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.7"
          />
          <circle
            cx={xs(n)}
            cy={ys(serverPP(n))}
            r="3.5"
            fill="var(--coral)"
            opacity={mode === 'server' ? 1 : 0.4}
          />
          <circle
            cx={xs(n)}
            cy={ys(swarmPerPeer(n))}
            r="3.5"
            fill="var(--signal)"
            opacity={mode === 'swarm' ? 1 : 0.4}
          />
          <text x={xs(n)} y={H - PB + 15} fontSize="9.5" fill="var(--gold)" textAnchor="middle">
            {n} downloaders
          </text>
        </svg>
      </div>

      <div style={{ padding: '2px 2px 0' }}>
        <input
          type="range"
          min={1}
          max={maxN}
          value={n}
          onChange={(e) => setN(+e.target.value)}
          aria-label="Number of downloaders in the crowd"
          style={{ '--pct': pct + '%' }}
        />
        <div
          className="tor-between"
          style={{
            marginTop: 8,
            fontSize: 11.5,
            color: 'var(--faint)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>1 peer</span>
          <span>more demand →</span>
          <span>{maxN}</span>
        </div>
      </div>
      <div className="tor-figcap" style={{ marginTop: 14 }}>
        Model: each peer's own link tops out at <b>{DOWNLINK} MB/s</b>; the lone server can serve{' '}
        <b>{SERVER_CAP} MB/s</b> total. In the swarm, every peer also <i>uploads</i> ~{PEER_UP}{' '}
        MB/s, so the pool of capacity grows with the crowd. Drag the crowd larger: the{' '}
        <span style={{ color: 'var(--coral-2)' }}>server</span> splits one fixed pipe ever thinner
        toward zero, while the <span style={{ color: 'var(--signal-2)' }}>swarm</span> holds steady
        — and its <i>total</i> throughput climbs right past the server's ceiling.
      </div>
    </div>
  );
}
