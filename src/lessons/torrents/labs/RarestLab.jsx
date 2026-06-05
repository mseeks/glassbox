import { useMemo, useState } from 'react';
import { Layers, ArrowRight, AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react';
import { RP, pieceAvailability, pickPiece, initRarestYou } from '../engine/index.js';

// §08 — rarest-first keeps the swarm alive. Each bar is how many peers hold a
// piece. With in-order you never reach piece 9 (held by a single seeder) before
// it departs and drops to zero copies — the file dies. With rarest-first you
// grab it first. Availability and the piece pick are the engine's.
export default function RarestLab() {
  const [strategy, setStrategy] = useState('rarest');
  const [you, setYou] = useState(initRarestYou);
  const [alive, setAlive] = useState([true, true, true, true, true]);
  const [departed, setDeparted] = useState(false);
  const avail = useMemo(() => pieceAvailability(you, alive), [you, alive]);
  const youCount = you.filter(Boolean).length;
  const minAvail = Math.min(...avail);
  const lost = avail.some((v) => v === 0);
  const lostPieces = avail.map((v, p) => (v === 0 ? p : -1)).filter((p) => p >= 0);
  const canGrab = youCount < RP && [...Array(RP).keys()].some((p) => !you[p] && avail[p] > 0);
  const downloadNext = () => {
    const pick = pickPiece(you, avail, strategy);
    if (pick == null) return;
    setYou((y) => y.map((v, k) => (k === pick ? true : v)));
  };
  const depart = () => {
    setAlive((a) => a.map((v, i) => (i === 0 ? false : v)));
    setDeparted(true);
  };
  const reset = () => {
    setYou(initRarestYou());
    setAlive([true, true, true, true, true]);
    setDeparted(false);
  };
  const maxA = 5;
  const complete = youCount === RP;
  return (
    <div>
      <div className="tor-between" style={{ marginBottom: 14 }}>
        <div className="tor-seg">
          <button
            className={strategy === 'order' ? 'tor-on' : ''}
            onClick={() => setStrategy('order')}
          >
            In-order
          </button>
          <button
            className={strategy === 'rarest' ? 'tor-on tor-sig' : ''}
            onClick={() => setStrategy('rarest')}
          >
            Rarest-first
          </button>
        </div>
        <div className="tor-row" style={{ gap: 8 }}>
          <span className="tor-chip">
            <Layers size={11} style={{ color: 'var(--gold)' }} aria-hidden="true" />
            you {youCount}/{RP}
          </span>
          <span
            className="tor-chip"
            style={
              minAvail === 0 ? { borderColor: 'rgba(244,113,93,0.5)', color: 'var(--coral-2)' } : {}
            }
          >
            min copies {minAvail}
          </span>
        </div>
      </div>

      <div className="tor-svgwrap">
        <svg viewBox="0 0 520 188" role="img" aria-label="piece availability across the swarm">
          {Array.from({ length: RP }).map((_, p) => {
            const bw = 30,
              gap = (520 - RP * bw) / (RP + 1),
              x = gap + p * (bw + gap),
              v = avail[p];
            const bh = (v / maxA) * 120,
              y = 150 - bh;
            const isRare = v === minAvail && v > 0,
              isLost = v === 0,
              mine = you[p];
            const col = isLost ? 'var(--coral)' : isRare ? 'var(--coral-2)' : 'var(--violet)';
            return (
              <g key={p}>
                {[1, 2, 3, 4, 5].map((t) => (
                  <line
                    key={t}
                    x1={x}
                    x2={x + bw}
                    y1={150 - (t / maxA) * 120}
                    y2={150 - (t / maxA) * 120}
                    stroke="var(--line)"
                    strokeWidth="0.5"
                  />
                ))}
                {v > 0 && (
                  <rect
                    x={x}
                    y={y}
                    width={bw}
                    height={bh}
                    rx="3"
                    fill={col}
                    opacity={isRare || isLost ? 0.95 : 0.42}
                    style={{ transition: 'height .35s ease, y .35s ease' }}
                  />
                )}
                {isLost && (
                  <text
                    x={x + bw / 2}
                    y={142}
                    textAnchor="middle"
                    fontSize="13"
                    fill="var(--coral-2)"
                  >
                    ✕
                  </text>
                )}
                <text
                  x={x + bw / 2}
                  y={166}
                  textAnchor="middle"
                  fontSize="9"
                  fill={mine ? 'var(--gold-2)' : 'var(--faint)'}
                >
                  p{p}
                </text>
                {mine && <circle cx={x + bw / 2} cy={176} r="2.4" fill="var(--gold)" />}
                <text
                  x={x + bw / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isRare || isLost ? 'var(--coral-2)' : 'var(--faint)'}
                >
                  {v}
                </text>
              </g>
            );
          })}
          <text
            x={8}
            y={150}
            fontSize="8.5"
            fill="var(--faint)"
            transform="rotate(-90 8 150)"
            textAnchor="middle"
          >
            copies in swarm
          </text>
        </svg>
      </div>

      <div className="tor-between" style={{ marginTop: 6 }}>
        <div className="tor-row" style={{ gap: 9 }}>
          <button className="tor-btn tor-primary" onClick={downloadNext} disabled={!canGrab}>
            <ArrowRight size={14} aria-hidden="true" />
            Download next piece
          </button>
          <button className="tor-btn" onClick={depart} disabled={departed}>
            <AlertTriangle size={14} aria-hidden="true" />
            Rare seeder departs
          </button>
          <button className="tor-btn" onClick={reset}>
            <RotateCcw size={14} aria-hidden="true" />
            Reset
          </button>
        </div>
        {lost ? (
          <span className="tor-badge tor-bad">
            <AlertTriangle size={14} aria-hidden="true" />
            piece {lostPieces.join(', ')} lost — swarm can't complete
          </span>
        ) : complete ? (
          <span className="tor-badge tor-ok">
            <ShieldCheck size={14} aria-hidden="true" />
            you hold the full file
          </span>
        ) : (
          <span
            className="tor-badge tor-ok"
            style={{
              background: 'transparent',
              border: '1px solid var(--line-2)',
              color: 'var(--mist)',
            }}
          >
            swarm healthy
          </span>
        )}
      </div>

      <div className="tor-figcap" style={{ marginTop: 14 }}>
        Each bar is how many peers hold that piece;{' '}
        <span style={{ color: 'var(--gold-2)' }}>gold dots</span> mark what you already have.{' '}
        <b>Piece 9 lives on a single peer.</b> Try it both ways: with <i>in-order</i> you work
        through p2, p3, p4… leaving the rare one for last — so if the lone seeder departs first,{' '}
        <span style={{ color: 'var(--coral-2)' }}>p9 drops to zero copies</span> and no one in the
        swarm can ever finish. With <i>rarest-first</i> you grab p9 first, spreading it before its
        only holder vanishes. Same effort, opposite fate — it's load-balancing with no coordinator.
        Near the very end, a torrent also enters <i>endgame</i>: it requests the last few pieces
        from everyone at once so one slow peer can't strand you at 99%.
      </div>
    </div>
  );
}
