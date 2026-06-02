import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Check, X as XIcon, Shuffle, Repeat, Play, RotateCcw } from 'lucide-react';
import { Label, SectionHeading } from '../components/atoms.jsx';

/* ───────────────────────────────────────────────────────────────────────
   §5 — THE SEND LAB
   Interactive: configure loss/dup/reorder rates, send a batch of
   datagrams, watch what arrives.
   ─────────────────────────────────────────────────────────────────────── */

const Stat = ({ label, value, color }) => (
  <div>
    <div
      className="udp-mono"
      style={{
        fontSize: 10.5,
        color: 'var(--ink-faint)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div className="udp-display" style={{ fontSize: 30, color, lineHeight: 1, fontWeight: 500 }}>
      {value}
    </div>
  </div>
);

export const SectionFive = () => {
  // Deterministic scenario showing all four UDP behaviors in one play.
  // Each packet has a known fate; the user sees them all clearly.
  const SCENARIO = [
    { n: 1, fate: 'delivered' },
    { n: 2, fate: 'delivered' },
    { n: 3, fate: 'lost' },
    { n: 4, fate: 'delivered' },
    { n: 5, fate: 'duplicate' },
    { n: 6, fate: 'delivered' },
    { n: 7, fate: 'delivered' },
    { n: 8, fate: 'reorder' },
    { n: 9, fate: 'delivered' },
    { n: 10, fate: 'lost' },
    { n: 11, fate: 'delivered' },
    { n: 12, fate: 'delivered' },
  ];

  const [packets, setPackets] = useState(SCENARIO.map((p) => ({ ...p, id: `p-${p.n}` })));
  const [phase, setPhase] = useState('idle');
  const [received, setReceived] = useState([]);
  const timersRef = useRef([]);

  const cleanup = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setReceived([]);
  }, [cleanup]);

  const shuffle = useCallback(() => {
    cleanup();
    setReceived([]);
    setPhase('idle');
    // Same distribution (2 lost, 1 dup, 1 reorder, rest delivered) but reshuffled positions
    const fates = ['lost', 'lost', 'duplicate', 'reorder', ...Array(8).fill('delivered')];
    for (let i = fates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fates[i], fates[j]] = [fates[j], fates[i]];
    }
    const newPackets = fates.map((fate, i) => ({ id: `p-${i + 1}-${Date.now()}`, n: i + 1, fate }));
    setPackets(newPackets);
  }, [cleanup]);

  const run = useCallback(() => {
    cleanup();
    setReceived([]);
    setPhase('sending');
    const stepDelay = 220;

    packets.forEach((p, i) => {
      const t = setTimeout(
        () => {
          if (p.fate === 'lost') {
            // never arrives
          } else if (p.fate === 'duplicate') {
            setReceived((prev) => [
              ...prev,
              { id: `${p.id}-r1`, n: p.n, dup: false, fate: 'duplicate' },
            ]);
            const t2 = setTimeout(() => {
              setReceived((prev) => [
                ...prev,
                { id: `${p.id}-r2`, n: p.n, dup: true, fate: 'duplicate' },
              ]);
            }, 380);
            timersRef.current.push(t2);
          } else if (p.fate === 'reorder') {
            // Arrives much later
            const t2 = setTimeout(
              () => {
                setReceived((prev) => [
                  ...prev,
                  { id: `${p.id}-r`, n: p.n, dup: false, fate: 'reorder' },
                ]);
              },
              stepDelay * 4 + 200,
            );
            timersRef.current.push(t2);
          } else {
            setReceived((prev) => [
              ...prev,
              { id: `${p.id}-r`, n: p.n, dup: false, fate: 'delivered' },
            ]);
          }
        },
        (i + 1) * stepDelay,
      );
      timersRef.current.push(t);
    });

    const endT = setTimeout(() => setPhase('done'), packets.length * stepDelay + stepDelay * 5);
    timersRef.current.push(endT);
  }, [cleanup, packets]);

  useEffect(() => () => cleanup(), [cleanup]);

  const stats = useMemo(() => {
    const losses = packets.filter((p) => p.fate === 'lost').length;
    const dups = packets.filter((p) => p.fate === 'duplicate').length;
    const reorders = packets.filter((p) => p.fate === 'reorder').length;
    return { losses, dups, reorders, total: packets.length };
  }, [packets]);

  // Fate metadata for legend & per-packet styling
  const FATE_META = {
    delivered: { color: 'var(--ok)', label: 'delivered', icon: Check },
    lost: { color: 'var(--lost)', label: 'lost', icon: XIcon },
    duplicate: { color: 'var(--warn)', label: 'duplicated', icon: Repeat },
    reorder: { color: 'var(--signal)', label: 'reordered', icon: Shuffle },
  };

  return (
    <section className="udp-section">
      <div className="udp-page">
        <SectionHeading
          tag="§ 05  ·  Lab · The Send"
          title="Fire and forget."
          lede={
            <>
              A canonical scenario. Twelve datagrams go out in order, and the network does what
              networks do: it delivers most of them, loses two, duplicates one, and reorders one.
              Watch <em>what UDP does about it.</em>
            </>
          }
        />

        <div className="udp-panel" style={{ padding: 26 }}>
          {/* Legend explaining the color code BEFORE the user plays */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              paddingBottom: 18,
              marginBottom: 18,
              borderBottom: '1px solid var(--line)',
            }}
          >
            <Label style={{ marginBottom: 0, alignSelf: 'center' }}>
              Each packet's fate is preset:
            </Label>
            {Object.entries(FATE_META).map(([k, m]) => {
              const Icon = m.icon;
              return (
                <span
                  key={k}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    border: `1px solid ${m.color}`,
                    background: 'transparent',
                    color: m.color,
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                    letterSpacing: '0.04em',
                    borderRadius: 3,
                  }}
                >
                  <Icon size={11} strokeWidth={2.5} />
                  {m.label}
                </span>
              );
            })}
          </div>

          {/* Run controls */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 24,
              flexWrap: 'wrap',
            }}
          >
            <button
              className="udp-btn udp-btn-primary"
              onClick={run}
              disabled={phase === 'sending'}
            >
              <Play size={14} />
              {phase === 'sending' ? 'Sending…' : phase === 'done' ? 'Replay' : 'Play scenario'}
            </button>
            <button
              className="udp-btn udp-btn-ghost"
              onClick={shuffle}
              disabled={phase === 'sending'}
            >
              <Shuffle size={14} />
              Shuffle fates
            </button>
            <button
              className="udp-btn udp-btn-ghost"
              onClick={reset}
              disabled={phase === 'sending'}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          {/* Sender / Receiver */}
          <div
            className="udp-lab-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 22,
            }}
          >
            {/* Sender */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 10,
                }}
              >
                <Label>Sender</Label>
                <span className="udp-mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>
                  send() × {packets.length}
                </span>
              </div>
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  padding: 14,
                  minHeight: 200,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 7,
                  alignContent: 'flex-start',
                }}
              >
                {packets.map((p) => {
                  const m = FATE_META[p.fate];
                  const FIcon = m.icon;
                  return (
                    <div
                      key={p.id}
                      style={{
                        width: 38,
                        height: 46,
                        borderRadius: 3,
                        background: 'var(--surface-2)',
                        border: `1px solid ${m.color}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        fontFamily: 'JetBrains Mono',
                        fontSize: 13,
                        fontWeight: 600,
                        color: m.color,
                        position: 'relative',
                      }}
                      title={m.label}
                    >
                      <div>{p.n}</div>
                      <FIcon size={9} strokeWidth={2.5} />
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: 'var(--ink-faint)',
                  fontFamily: 'JetBrains Mono',
                  letterSpacing: '0.02em',
                }}
              >
                All {packets.length} sent. UDP has now forgotten about them.
              </div>
            </div>

            {/* Receiver */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 10,
                }}
              >
                <Label>Receiver</Label>
                <span className="udp-mono" style={{ fontSize: 11, color: 'var(--ok)' }}>
                  recv() × {received.length}
                </span>
              </div>
              <div
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  padding: 14,
                  minHeight: 200,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 7,
                  alignContent: 'flex-start',
                }}
              >
                {received.map((r) => {
                  return (
                    <div
                      key={r.id}
                      style={{
                        width: 38,
                        height: 46,
                        borderRadius: 3,
                        background: r.dup
                          ? 'var(--warn-soft)'
                          : r.fate === 'reorder'
                            ? 'var(--signal-soft)'
                            : 'var(--ok-soft)',
                        border: `1px solid ${
                          r.dup
                            ? 'var(--warn)'
                            : r.fate === 'reorder'
                              ? 'var(--signal)'
                              : 'var(--ok)'
                        }`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        fontFamily: 'JetBrains Mono',
                        fontSize: 13,
                        fontWeight: 600,
                        color: r.dup
                          ? 'var(--warn)'
                          : r.fate === 'reorder'
                            ? 'var(--signal)'
                            : 'var(--ok)',
                        animation: 'udp-fade-in 0.35s ease both',
                        position: 'relative',
                      }}
                      title={r.dup ? 'duplicate copy' : r.fate}
                    >
                      <div>{r.n}</div>
                      {r.dup && (
                        <span
                          style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            fontSize: 8,
                            background: 'var(--warn)',
                            color: '#1a1108',
                            padding: '1px 3px',
                            borderRadius: 2,
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                          }}
                        >
                          2×
                        </span>
                      )}
                      {r.fate === 'reorder' && <Shuffle size={9} strokeWidth={2.5} />}
                    </div>
                  );
                })}
                {received.length === 0 && (
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      color: 'var(--ink-faint)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 11,
                      padding: '34px 0',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {phase === 'idle' ? 'AWAITING TRAFFIC' : 'LISTENING…'}
                  </div>
                )}
              </div>
              {received.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: 'var(--ink-faint)',
                    fontFamily: 'JetBrains Mono',
                    letterSpacing: '0.02em',
                  }}
                >
                  Application sees them in arrival order, not send order.
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {phase === 'done' && (
            <div
              className="udp-rise"
              style={{
                marginTop: 26,
                padding: '18px 22px',
                background: 'var(--surface-2)',
                borderRadius: 4,
                borderLeft: '2px solid var(--signal)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 18,
              }}
            >
              <Stat label="Sent" value={stats.total} color="var(--signal)" />
              <Stat label="Delivered" value={received.length} color="var(--ok)" />
              <Stat label="Lost" value={stats.losses} color="var(--lost)" />
              <Stat label="Duplicated" value={stats.dups} color="var(--warn)" />
              <Stat label="Reordered" value={stats.reorders} color="var(--ink)" />
            </div>
          )}
        </div>

        <p className="udp-prose" style={{ marginTop: 26 }}>
          Notice what UDP does about the losses, the duplicates, the reorders:
          <strong> nothing.</strong> That's the contract. If your application can't tolerate that
          behavior, or can't sequence the packets itself, then UDP is simply not the right tool for
          the job.
        </p>
      </div>
    </section>
  );
};
