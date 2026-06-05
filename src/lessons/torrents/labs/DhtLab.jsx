import { useEffect, useMemo, useState } from 'react';
import { Binary, Pause, Crosshair, StepForward, RotateCcw, Sparkles, Compass } from 'lucide-react';
import {
  DBITS,
  dxor,
  hex6,
  bin24,
  buildNetwork,
  dhtLookup,
  mulberry32,
  keyFromSeed,
} from '../engine/index.js';

const DHT_N = 512;

// One "getting warmer" bit row: the leading `prefix` bits (shared, violet), the
// first differing bit (coral), then the rest, plus the 6-hex catalog id.
function BinaryRow({ id, prefix, label, color }) {
  const bits = bin24(id);
  return (
    <div className="tor-brow">
      <span className="tor-blab">{label}</span>
      <span className="tor-bbits">
        {bits.split('').map((b, i) => {
          const cls =
            i < prefix ? 'tor-bcell tor-m' : i === prefix ? 'tor-bcell tor-d' : 'tor-bcell';
          return (
            <span key={i} className={cls}>
              {b}
            </span>
          );
        })}
      </span>
      <span className="tor-bhex" style={{ color }}>
        {hex6(id)}
      </span>
    </div>
  );
}

// §05 — celestial navigation by XOR. From a fixed start node, the lookup asks
// the closest node it knows, which points it closer; every hop clears another
// shared bit and roughly halves the remaining distance. The whole network and
// the recorded hops come from the engine; stepping is user-driven, so the
// auto-advance timer (started by "Look it up") needs no reduced-motion gate.
export default function DhtLab() {
  const net = useMemo(() => buildNetwork(777, DHT_N, 1), []);
  const start = useMemo(() => net.ids[7], [net]);
  const [keySeed, setKeySeed] = useState(2026);
  const target = useMemo(() => keyFromSeed(keySeed), [keySeed]);
  const res = useMemo(() => dhtLookup(net, start, target, 1), [net, start, target]);
  const hops = res.hops;
  const [hi, setHi] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    setHi(0);
    setRunning(false);
  }, [target]);
  useEffect(() => {
    if (!running) return;
    if (hi >= hops.length - 1) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setHi((h) => Math.min(h + 1, hops.length - 1)), 950);
    return () => clearTimeout(t);
  }, [running, hi, hops.length]);
  const cur = hops[hi];
  const W = 720,
    H = 148,
    PL = 20,
    PR = 20,
    PT = 22,
    PB = 30,
    axisY = H - PB;
  const lg = (d) => Math.log2(d + 1) / DBITS; // 0..1
  const xpos = (d) => PL + (1 - lg(d)) * (W - PL - PR);
  const cloud = useMemo(() => {
    const r = mulberry32(keySeed * 3 + 1);
    return net.ids.map((id) => ({ id, d: dxor(id, target), jy: r() * 1 }));
  }, [net, target, keySeed]);
  const pathPts = hops.slice(0, hi + 1).map((h) => ({ x: xpos(h.bestDist), d: h.bestDist }));
  const done = hi >= hops.length - 1;
  const peerCount = 3 + (target % 5);
  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <div className="tor-figlabel" style={{ marginBottom: 10 }}>
          <Binary size={13} aria-hidden="true" />
          <b>distance = XOR</b> · shared leading bits grow as the search gets warmer
        </div>
        <BinaryRow id={cur.best} prefix={cur.prefix} label="closest node" color="var(--gold-2)" />
        <BinaryRow id={target} prefix={cur.prefix} label="the key" color="var(--violet-2)" />
        <div className="tor-row" style={{ gap: 18, marginTop: 10, paddingLeft: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--violet-2)' }}>
            shared prefix: <b>{cur.prefix}</b>/{DBITS} bits
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--mist)' }}>
            distance: <b>{cur.bestDist.toLocaleString()}</b>
          </span>
        </div>
      </div>

      <div className="tor-svgwrap" style={{ marginTop: 14 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="lookup converging across the address space toward the key"
        >
          <line x1={PL} y1={axisY} x2={W - PR} y2={axisY} stroke="var(--line-2)" />
          <text x={PL} y={axisY + 18} fontSize="9" fill="var(--faint)">
            far · whole address space
          </text>
          <text x={W - PR} y={axisY + 18} textAnchor="end" fontSize="9" fill="var(--violet-2)">
            the key
          </text>
          {cloud.map((c, i) => (
            <circle
              key={i}
              cx={xpos(c.d)}
              cy={axisY - 6 - c.jy * 64}
              r="1.4"
              fill="var(--violet)"
              opacity="0.22"
            />
          ))}
          <line
            x1={W - PR}
            y1={PT}
            x2={W - PR}
            y2={axisY}
            stroke="var(--violet)"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          <circle
            cx={W - PR}
            cy={axisY}
            r="5"
            fill="var(--violet)"
            style={{ filter: 'drop-shadow(0 0 6px var(--violet))' }}
          />
          {pathPts.map((p, i) => {
            if (i === 0) return null;
            const a = pathPts[i - 1],
              b = p;
            const my = axisY - 34 - i * 4;
            return (
              <path
                key={i}
                d={`M ${a.x} ${axisY - 6} Q ${(a.x + b.x) / 2} ${my} ${b.x} ${axisY - 6}`}
                fill="none"
                stroke="var(--signal)"
                strokeWidth="1.6"
                opacity="0.8"
              />
            );
          })}
          {cur.queried.map((q, i) => (
            <circle
              key={'q' + i}
              cx={xpos(dxor(q, target))}
              cy={axisY - 6}
              r="4"
              fill="none"
              stroke="var(--signal-2)"
              strokeWidth="1.5"
              opacity="0.9"
            />
          ))}
          <circle
            cx={xpos(cur.bestDist)}
            cy={axisY - 6}
            r="5.5"
            fill={done ? 'var(--gold)' : 'var(--signal)'}
            style={{
              filter: `drop-shadow(0 0 7px ${done ? 'var(--gold)' : 'var(--signal)'})`,
              transition: 'cx .5s ease',
            }}
          />
          <text
            x={xpos(cur.bestDist)}
            y={axisY - 16}
            textAnchor="middle"
            fontSize="9"
            fill={done ? 'var(--gold-2)' : 'var(--signal-2)'}
          >
            {done ? 'arrived' : 'you'}
          </text>
          <circle
            cx={xpos(hops[0].bestDist)}
            cy={axisY - 6}
            r="3"
            fill="var(--faint)"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="tor-between" style={{ marginTop: 6 }}>
        <div className="tor-row" style={{ gap: 9 }}>
          <button
            className="tor-btn tor-primary"
            onClick={() => {
              if (done) setHi(0);
              setRunning((r) => !r);
            }}
          >
            {running ? (
              <>
                <Pause size={14} aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Crosshair size={14} aria-hidden="true" />
                {done ? 'Replay' : 'Look it up'}
              </>
            )}
          </button>
          <button
            className="tor-btn"
            onClick={() => {
              setRunning(false);
              setHi((h) => Math.min(h + 1, hops.length - 1));
            }}
            disabled={running || done}
          >
            <StepForward size={14} aria-hidden="true" />
            Step
          </button>
          <button
            className="tor-btn"
            onClick={() => {
              setRunning(false);
              setHi(0);
            }}
            disabled={hi === 0}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
          <button className="tor-btn tor-gold" onClick={() => setKeySeed((s) => s + 7)}>
            <Sparkles size={14} aria-hidden="true" />
            New key
          </button>
        </div>
        <span className="tor-chip">
          <Compass size={11} style={{ color: 'var(--signal)' }} aria-hidden="true" />
          hop {Math.max(hi, 0)} / {hops.length - 1} · {res.contacted} nodes asked
        </span>
      </div>

      {done ? (
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'var(--gold-dim)',
            border: '1px solid rgba(236,185,95,0.3)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--gold-2)' }}>
            <b>Converged.</b> The nodes nearest the key hold its peer list — they hand back{' '}
            {peerCount} peers for this torrent.
          </div>
        </div>
      ) : (
        <div className="tor-figcap" style={{ marginTop: 14 }}>
          Each ring is a peer; the <span style={{ color: 'var(--violet-2)' }}>key</span> sits at the
          right edge (distance zero). You start far away and ask the closest node you know; it
          points you to one closer; every hop clears another shared bit and roughly halves the
          distance. Among <b>512</b> nodes it takes only a handful of hops — among millions it's
          about twenty.
        </div>
      )}
    </div>
  );
}
