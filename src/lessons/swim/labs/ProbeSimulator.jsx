import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClusterNode } from '../components/ClusterNode.jsx';
import { useRaf } from '../components/useRaf.js';

export function ProbeSimulator() {
  // 6 nodes in a small constellation
  const W = 720,
    H = 460;
  const layout = useMemo(() => {
    const cx = W / 2,
      cy = H / 2 + 8,
      r = 150;
    return Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      return { id: i, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    });
  }, []);

  // state
  const [linkFailed, setLinkFailed] = useState(false); // link between prober (0) and target (3)
  const [targetDead, setTargetDead] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | direct | wait-ack | indirect | done
  const [, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null); // 'alive' | 'suspect'

  const PROBER = 0;
  const TARGET = 3;
  const HELPERS = [1, 5]; // k=2

  // anim time
  const phaseStartedAt = useRef(0);
  const [, force] = useState(0);

  useRaf((_dt, _now) => {
    if (!running) return;
    force((x) => x + 1);
  }, running);

  const elapsed = () => performance.now() - phaseStartedAt.current;

  // step machine
  useEffect(() => {
    if (!running) return;
    let timer;
    if (phase === 'direct') {
      timer = setTimeout(() => {
        // direct ping arrives at target
        if (targetDead || linkFailed) {
          // wait for timeout
          phaseStartedAt.current = performance.now();
          setPhase('wait-ack');
        } else {
          // ack returns
          setResult('alive');
          phaseStartedAt.current = performance.now();
          setPhase('done');
        }
      }, 1200);
    } else if (phase === 'wait-ack') {
      // direct ack didn't arrive — wait the timeout
      timer = setTimeout(() => {
        phaseStartedAt.current = performance.now();
        setPhase('indirect');
      }, 900);
    } else if (phase === 'indirect') {
      timer = setTimeout(() => {
        // helpers ping target
        if (targetDead) {
          setResult('suspect');
        } else {
          setResult('alive');
        }
        phaseStartedAt.current = performance.now();
        setPhase('done');
      }, 1800);
    } else if (phase === 'done') {
      timer = setTimeout(() => {
        setRunning(false);
      }, 1600);
    }
    return () => clearTimeout(timer);
  }, [phase, running, linkFailed, targetDead]);

  const reset = useCallback(() => {
    setPhase('idle');
    setResult(null);
    setRunning(false);
    setStep(0);
  }, []);

  const start = useCallback(() => {
    setResult(null);
    setStep(0);
    phaseStartedAt.current = performance.now();
    setPhase('direct');
    setRunning(true);
  }, []);

  // compute progress 0..1 of current phase animation
  const t = (() => {
    if (phase === 'idle') return 0;
    if (phase === 'direct') return Math.min(1, elapsed() / 1200);
    if (phase === 'wait-ack') return Math.min(1, elapsed() / 900);
    if (phase === 'indirect') return Math.min(1, elapsed() / 1800);
    return 1;
  })();

  // line drawing helpers
  const lerp = (a, b, k) => a + (b - a) * k;
  const proberNode = layout[PROBER];
  const targetNode = layout[TARGET];

  // direct probe particle position
  const directProgress = phase === 'direct' ? t : phase === 'idle' ? 0 : 1;
  const directVisible = phase === 'direct' || phase === 'wait-ack';

  // indirect probes from prober → each helper, then helper → target
  const indirectT = phase === 'indirect' ? t : 0;
  const indirectVisible = phase === 'indirect' || (phase === 'done' && result !== null);

  return (
    <div className="swim-card" style={{ padding: 0, overflow: 'hidden' }}>
      <span className="swim-corner-ornament tl" />
      <span className="swim-corner-ornament tr" />
      <span className="swim-corner-ornament bl" />
      <span className="swim-corner-ornament br" />

      <div
        style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div className="swim-label" style={{ color: 'var(--ink-dim)' }}>
          One protocol round <span style={{ color: 'var(--brass)' }}>·</span> probe target node 3
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="swim-btn"
            data-active={linkFailed}
            onClick={() => {
              reset();
              setLinkFailed((v) => !v);
            }}
            disabled={running}
          >
            Link 0↔3: {linkFailed ? 'broken' : 'ok'}
          </button>
          <button
            className="swim-btn"
            data-active={targetDead}
            onClick={() => {
              reset();
              setTargetDead((v) => !v);
            }}
            disabled={running}
          >
            Node 3: {targetDead ? 'dead' : 'alive'}
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
          {/* faint base mesh */}
          {layout.map((a, i) =>
            layout.map((b, j) => {
              if (j <= i) return null;
              return (
                <line
                  key={`${i}-${j}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="var(--border)"
                  strokeOpacity="0.4"
                  strokeWidth="0.6"
                />
              );
            }),
          )}

          {/* direct probe line */}
          {directVisible && (
            <>
              <line
                x1={proberNode.x}
                y1={proberNode.y}
                x2={lerp(proberNode.x, targetNode.x, directProgress)}
                y2={lerp(proberNode.y, targetNode.y, directProgress)}
                stroke={linkFailed ? 'var(--dead)' : 'var(--probe)'}
                strokeWidth="1.4"
                strokeDasharray={linkFailed ? '4 3' : ''}
                strokeOpacity="0.9"
              />
              {directProgress < 1 && (
                <circle
                  cx={lerp(proberNode.x, targetNode.x, directProgress)}
                  cy={lerp(proberNode.y, targetNode.y, directProgress)}
                  r="3"
                  fill={linkFailed ? 'var(--dead)' : 'var(--probe)'}
                  style={{
                    filter: `drop-shadow(0 0 6px ${linkFailed ? 'var(--dead)' : 'var(--probe)'})`,
                  }}
                />
              )}
              {/* failure cross at midpoint when link broken */}
              {linkFailed && directProgress > 0.4 && (
                <g
                  transform={`translate(${(proberNode.x + targetNode.x) / 2}, ${(proberNode.y + targetNode.y) / 2})`}
                >
                  <circle r="11" fill="var(--bg-deeper)" stroke="var(--dead)" strokeWidth="1" />
                  <line x1="-4" y1="-4" x2="4" y2="4" stroke="var(--dead)" strokeWidth="1.4" />
                  <line x1="-4" y1="4" x2="4" y2="-4" stroke="var(--dead)" strokeWidth="1.4" />
                </g>
              )}
            </>
          )}

          {/* indirect probes */}
          {indirectVisible &&
            HELPERS.map((h) => {
              const hNode = layout[h];
              const tNode = layout[TARGET];
              // first half (0..0.4): prober → helper
              // second half (0.4..1): helper → target (this leg works iff target alive)
              const leg1 = Math.min(1, indirectT / 0.4);
              const leg2 = Math.max(0, Math.min(1, (indirectT - 0.4) / 0.6));
              return (
                <g key={h}>
                  {/* leg1 */}
                  <line
                    x1={proberNode.x}
                    y1={proberNode.y}
                    x2={lerp(proberNode.x, hNode.x, leg1)}
                    y2={lerp(proberNode.y, hNode.y, leg1)}
                    stroke="var(--brass)"
                    strokeOpacity="0.85"
                    strokeWidth="1.4"
                  />
                  {leg1 < 1 && (
                    <circle
                      cx={lerp(proberNode.x, hNode.x, leg1)}
                      cy={lerp(proberNode.y, hNode.y, leg1)}
                      r="2.8"
                      fill="var(--brass)"
                      style={{ filter: 'drop-shadow(0 0 5px var(--brass))' }}
                    />
                  )}
                  {/* leg2 */}
                  {leg2 > 0 && (
                    <>
                      <line
                        x1={hNode.x}
                        y1={hNode.y}
                        x2={lerp(hNode.x, tNode.x, leg2)}
                        y2={lerp(hNode.y, tNode.y, leg2)}
                        stroke={targetDead ? 'var(--dead)' : 'var(--probe)'}
                        strokeOpacity="0.9"
                        strokeWidth="1.4"
                        strokeDasharray={targetDead ? '4 3' : ''}
                      />
                      {leg2 < 1 && (
                        <circle
                          cx={lerp(hNode.x, tNode.x, leg2)}
                          cy={lerp(hNode.y, tNode.y, leg2)}
                          r="2.8"
                          fill={targetDead ? 'var(--dead)' : 'var(--probe)'}
                          style={{
                            filter: `drop-shadow(0 0 5px ${targetDead ? 'var(--dead)' : 'var(--probe)'})`,
                          }}
                        />
                      )}
                    </>
                  )}
                </g>
              );
            })}

          {/* nodes (rendered on top) */}
          {layout.map((n) => {
            let label = `n${n.id}`;
            if (n.id === PROBER) label = 'PROBER';
            if (n.id === TARGET) label = 'TARGET';
            if (HELPERS.includes(n.id) && (phase === 'indirect' || (phase === 'done' && result)))
              label = `n${n.id} · helper`;
            const state =
              n.id === TARGET && targetDead
                ? 'dead'
                : n.id === TARGET && result === 'suspect'
                  ? 'suspect'
                  : 'alive';
            return (
              <ClusterNode
                key={n.id}
                x={n.x}
                y={n.y}
                state={state}
                size={n.id === PROBER || n.id === TARGET ? 9 : 7}
                label={label}
                pulse={phase === 'indirect' && HELPERS.includes(n.id)}
              />
            );
          })}
        </svg>

        {/* phase indicator */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 20,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.16em',
            color: 'var(--ink-faint)',
            textTransform: 'uppercase',
          }}
        >
          {phase === 'idle' && 'awaiting probe'}
          {phase === 'direct' && '01 · direct ping out'}
          {phase === 'wait-ack' && '02 · ack timeout · falling back'}
          {phase === 'indirect' && '03 · indirect ping via 2 helpers'}
          {phase === 'done' && result === 'alive' && '04 · ack received · target alive'}
          {phase === 'done' && result === 'suspect' && '04 · no ack · target → SUSPECT'}
        </div>

        {/* result chip */}
        {result && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 20,
            }}
          >
            <span className="swim-chip" data-tone={result === 'alive' ? 'alive' : 'suspect'}>
              <span className="swim-chip-dot" />
              Verdict: {result.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div
          className="swim-mono"
          style={{ fontSize: 11, color: 'var(--ink-faint)', maxWidth: 460 }}
        >
          {!linkFailed && !targetDead && 'Default: direct probe succeeds, no fallback needed.'}
          {linkFailed &&
            !targetDead &&
            'Direct probe is unreachable via the broken link. Helpers route around it — target is in fact alive.'}
          {!linkFailed &&
            targetDead &&
            'Target genuinely dead. Both direct and indirect probes time out. Verdict: SUSPECT.'}
          {linkFailed &&
            targetDead &&
            'Both faults at once: link broken AND target dead. Indirect probe still cannot reach it. Verdict: SUSPECT.'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="swim-btn" onClick={reset} disabled={running && phase !== 'done'}>
            Reset
          </button>
          <button className="swim-btn" data-active onClick={start} disabled={running}>
            ▶ Run probe
          </button>
        </div>
      </div>
    </div>
  );
}
