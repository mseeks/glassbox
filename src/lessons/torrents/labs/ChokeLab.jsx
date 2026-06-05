import { useMemo, useState } from 'react';
import { Play, Pause, StepForward, Share2, Sparkles } from 'lucide-react';
import { GIVE_LABEL, NEIGHBORS, chokeState } from '../engine/index.js';
import { useInterval } from '../components/useInterval.js';
import { Stat } from '../components/widgets.jsx';

const COL = { reciprocal: 'var(--gold-2)', optimistic: 'var(--violet-2)', choked: 'var(--faint)' };

// §07 — tit-for-tat. Four upload slots: keep feeding the three peers who feed
// you fastest, choke the rest, and hand one rotating optimistic slot to a random
// choked peer. The whole decision is the engine's chokeState; the round timer is
// started by the reader (the "Rounds" button), so it stays ungated.
export default function ChokeLab() {
  const [give, setGive] = useState([2, 1, 0, 2, 1, 0]);
  const [round, setRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  useInterval(() => setRound((r) => r + 1), 1500, playing);
  const { unchoked, received, statusOf } = useMemo(() => chokeState(give, round), [give, round]);
  return (
    <div>
      <div className="tor-between" style={{ marginBottom: 14 }}>
        <div className="tor-row" style={{ gap: 18 }}>
          <Stat v={received.toFixed(0)} l="you receive · MB/s" color="var(--signal-2)" />
          <div
            style={{
              fontSize: 12.5,
              color: 'var(--mist)',
              lineHeight: 1.5,
              fontFamily: 'var(--font-mono)',
            }}
          >
            4 upload slots
            <br />
            <span style={{ color: 'var(--gold-2)' }}>3 reciprocal</span> +{' '}
            <span style={{ color: 'var(--violet-2)' }}>1 optimistic</span>
          </div>
        </div>
        <div className="tor-row" style={{ gap: 9 }}>
          <button className="tor-btn tor-primary" onClick={() => setPlaying((p) => !p)}>
            {playing ? (
              <>
                <Pause size={14} aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play size={14} aria-hidden="true" />
                Rounds
              </>
            )}
          </button>
          <button className="tor-btn" onClick={() => setRound((r) => r + 1)} disabled={playing}>
            <StepForward size={14} aria-hidden="true" />
            Next round
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 9 }}>
        {NEIGHBORS.map((nm, i) => {
          const st = statusOf(i);
          const on = unchoked.has(i);
          return (
            <div
              key={i}
              className="tor-panel"
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                borderColor: on
                  ? st === 'reciprocal'
                    ? 'rgba(236,185,95,0.4)'
                    : 'rgba(157,140,242,0.4)'
                  : 'var(--line)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  minWidth: 128,
                  flex: '1 1 128px',
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: on ? COL[st] : 'var(--faint-2)',
                    boxShadow: on ? `0 0 8px ${COL[st]}` : 'none',
                  }}
                />
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--star)' }}
                >
                  {nm}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10.5,
                    color: 'var(--faint)',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  gives you
                </span>
                <div className="tor-seg" style={{ padding: 2 }}>
                  {GIVE_LABEL.map((lb, gi) => (
                    <button
                      key={gi}
                      onClick={() => setGive((g) => g.map((v, k) => (k === i ? gi : v)))}
                      className={give[i] === gi ? 'tor-on' : ''}
                      aria-pressed={give[i] === gi}
                      aria-label={`${nm} gives you ${lb}`}
                      style={{
                        padding: '5px 11px',
                        fontSize: 12,
                        ...(give[i] === gi && gi > 0
                          ? {
                              color: 'var(--gold-2)',
                              boxShadow: 'inset 0 0 0 1px rgba(236,185,95,0.35)',
                            }
                          : {}),
                        ...(give[i] === gi && gi === 0 ? { color: 'var(--coral-2)' } : {}),
                      }}
                    >
                      {lb}
                    </button>
                  ))}
                </div>
              </div>
              <span
                className="tor-badge"
                style={{
                  marginLeft: 'auto',
                  fontSize: 11.5,
                  padding: '5px 11px',
                  ...(st === 'reciprocal'
                    ? {
                        background: 'var(--gold-dim)',
                        color: 'var(--gold-2)',
                        border: '1px solid rgba(236,185,95,0.4)',
                      }
                    : st === 'optimistic'
                      ? {
                          background: 'var(--violet-dim)',
                          color: 'var(--violet-2)',
                          border: '1px solid rgba(157,140,242,0.4)',
                        }
                      : {
                          background: 'rgba(244,113,93,0.10)',
                          color: 'var(--coral-2)',
                          border: '1px solid rgba(244,113,93,0.28)',
                        }),
                }}
              >
                {st === 'reciprocal' ? (
                  <>
                    <Share2 size={12} aria-hidden="true" />
                    unchoked · earns it
                  </>
                ) : st === 'optimistic' ? (
                  <>
                    <Sparkles size={12} aria-hidden="true" />
                    optimistic try
                  </>
                ) : (
                  <>
                    <Pause size={12} aria-hidden="true" />
                    choked
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <div className="tor-figcap" style={{ marginTop: 14 }}>
        Tap a neighbor's generosity. The rule each peer runs alone: keep uploading to the{' '}
        <span style={{ color: 'var(--gold-2)' }}>three who feed you fastest</span>, choke the rest —
        re-judged every few seconds. A freeloader giving <i>none</i> gets dropped. The twist is the
        fourth slot: one <span style={{ color: 'var(--violet-2)' }}>optimistic</span> upload to a
        random choked peer, rotating each round. It lets you discover faster partners, and gives a
        newcomer with nothing yet its first taste so it can enter the economy at all.
      </div>
    </div>
  );
}
