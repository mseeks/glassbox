import React, { useState, useEffect } from 'react';
import { Node } from './Node.jsx';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

/* ════════════════════════════════════════════════════════════════════════
   HERO — a four-phase narrative animation.

   Phases:
     0 [4s] intact — messages flow, all healthy
     1 [1s] severing — wire breaks, X mark
     2 [5s] chosen — each side shows its different response
     3 [2s] healing — reconnect, brief reconciliation glow

   Layout stays stable across phases. Status text in a fixed-height row.
   ════════════════════════════════════════════════════════════════════════ */
export function Hero() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, [reduced, inView]);

  // 12-second narrative cycle. Under reduced motion, freeze on the "CHOSEN"
  // phase — the representative frame: wire severed, each side has made its
  // choice (α picks C, β picks A) with labels visible.
  const cycleMs = reduced ? 7000 : (tick * 50) % 12000;
  const phase =
    cycleMs < 4000
      ? 0 // intact
      : cycleMs < 5000
        ? 1 // severing
        : cycleMs < 10000
          ? 2 // chosen
          : 3; // healing

  // gentle node drift, applied uniformly so layout stays stable
  const drift = (seed) => Math.sin(tick * 0.012 + seed) * 1.4;

  const left = [
    { id: 'α1', x: 100, y: 80 },
    { id: 'α2', x: 60, y: 160 },
    { id: 'α3', x: 130, y: 220 },
  ];
  const right = [
    { id: 'β1', x: 410, y: 80 },
    { id: 'β2', x: 450, y: 160 },
    { id: 'β3', x: 380, y: 220 },
  ];

  // Per-phase visual state
  const wireBroken = phase >= 1 && phase <= 2;
  const leftState = phase === 2 ? 'consistent' : 'alive';
  const rightState = phase === 2 ? 'available' : 'alive';
  const showChoiceLabels = phase === 2;

  const status = [
    { txt: 'Both halves in sync. Messages flow. Everything works.', color: 'var(--emerald)' },
    { txt: 'The wire severs. The cluster splits. A choice is forced.', color: 'var(--coral)' },
    {
      txt: 'α refuses to answer. β answers but may be wrong. Both are "correct."',
      color: 'var(--ink-2)',
    },
    {
      txt: 'Connection restored. The clusters reconcile. The cycle resumes.',
      color: 'var(--violet)',
    },
  ][phase];

  return (
    <section ref={vpRef} style={{ padding: '70px 0 50px', position: 'relative' }}>
      {/* — title block — two acronyms, given visual room — */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1
          style={{
            fontFamily: 'Spectral, serif',
            fontWeight: 300,
            fontSize: 'clamp(54px, 11vw, 110px)',
            margin: 0,
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: 'var(--ink)',
          }}
        >
          CAP
        </h1>
        <div
          style={{
            margin: '14px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            maxWidth: 280,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--border-bright)' }} />
          <span
            style={{
              fontFamily: 'Spectral, serif',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 17,
              color: 'var(--coral)',
              letterSpacing: '0.04em',
            }}
          >
            and
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-bright)' }} />
        </div>
        <h1
          style={{
            fontFamily: 'Spectral, serif',
            fontWeight: 300,
            fontSize: 'clamp(48px, 9vw, 94px)',
            margin: 0,
            letterSpacing: '0.04em',
            lineHeight: 1,
            color: 'var(--ink)',
          }}
        >
          PACELC
        </h1>

        <div
          style={{
            marginTop: 32,
            fontFamily: 'Spectral, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: 'var(--ink-dim)',
            fontWeight: 300,
            lineHeight: 1.5,
            letterSpacing: '-0.005em',
            maxWidth: 600,
            margin: '32px auto 0',
          }}
        >
          Two theorems about what every distributed data system (every database, cache, coordination
          service, file store)<em style={{ color: 'var(--ink)' }}> must give up</em>, and when.
        </div>
      </div>

      {/* — animation panel — */}
      <div
        className="panel"
        style={{
          background: 'var(--bg-deep)',
          border: '1px solid var(--border)',
          padding: '28px 18px 22px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg viewBox="0 0 520 320" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <pattern
              id="hero-grid"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="var(--border)"
                strokeOpacity="0.3"
                strokeWidth="0.5"
              />
            </pattern>
            <radialGradient id="left-glow" cx="50%" cy="50%">
              <stop
                offset="0%"
                stopColor={leftState === 'consistent' ? 'var(--emerald)' : 'var(--cyan)'}
                stopOpacity="0.10"
              />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="right-glow" cx="50%" cy="50%">
              <stop
                offset="0%"
                stopColor={rightState === 'available' ? 'var(--cyan)' : 'var(--cyan)'}
                stopOpacity="0.10"
              />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="520" height="320" fill="url(#hero-grid)" opacity="0.5" />

          {/* Side glows */}
          <ellipse
            cx="100"
            cy="160"
            rx="120"
            ry="120"
            fill="url(#left-glow)"
            style={{ transition: 'all 600ms ease' }}
          />
          <ellipse
            cx="420"
            cy="160"
            rx="120"
            ry="120"
            fill="url(#right-glow)"
            style={{ transition: 'all 600ms ease' }}
          />

          {/* Inter-cluster gossip lines — left */}
          <g stroke="var(--emerald)" strokeOpacity="0.18" strokeWidth="0.5" fill="none">
            <line x1={left[0].x} y1={left[0].y} x2={left[1].x} y2={left[1].y} />
            <line x1={left[1].x} y1={left[1].y} x2={left[2].x} y2={left[2].y} />
            <line x1={left[0].x} y1={left[0].y} x2={left[2].x} y2={left[2].y} />
          </g>
          {/* Right */}
          <g stroke="var(--cyan)" strokeOpacity="0.18" strokeWidth="0.5" fill="none">
            <line x1={right[0].x} y1={right[0].y} x2={right[1].x} y2={right[1].y} />
            <line x1={right[1].x} y1={right[1].y} x2={right[2].x} y2={right[2].y} />
            <line x1={right[0].x} y1={right[0].y} x2={right[2].x} y2={right[2].y} />
          </g>

          {/* The wire between the halves */}
          {!wireBroken ? (
            <g style={{ transition: 'opacity 400ms ease' }}>
              <line
                x1="160"
                y1="160"
                x2="360"
                y2="160"
                stroke={phase === 3 ? 'var(--violet)' : 'var(--cyan)'}
                strokeOpacity="0.55"
                strokeWidth="1"
              />
              {phase === 0 && (
                <circle cx={170 + ((tick * 2) % 180)} cy="160" r="3" fill="var(--cyan)">
                  {!reduced && (
                    <animate
                      attributeName="opacity"
                      values="0.3;1;0.3"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
              )}
              {phase === 3 && (
                <>
                  <circle
                    cx={170 + ((tick * 4) % 180)}
                    cy="160"
                    r="2.5"
                    fill="var(--violet)"
                    opacity="0.9"
                  />
                  <circle
                    cx={350 - ((tick * 4) % 180)}
                    cy="160"
                    r="2.5"
                    fill="var(--violet)"
                    opacity="0.9"
                  />
                </>
              )}
            </g>
          ) : (
            <g style={{ transition: 'opacity 400ms ease' }}>
              <line
                x1="160"
                y1="160"
                x2="245"
                y2="160"
                stroke="var(--coral)"
                strokeOpacity="0.5"
                strokeWidth="1"
                strokeDasharray="3,4"
              />
              <line
                x1="275"
                y1="160"
                x2="360"
                y2="160"
                stroke="var(--coral)"
                strokeOpacity="0.5"
                strokeWidth="1"
                strokeDasharray="3,4"
              />
              <g transform="translate(260, 160)">
                <line x1="-11" y1="-13" x2="11" y2="13" stroke="var(--coral)" strokeWidth="1.8" />
                <line x1="11" y1="-13" x2="-11" y2="13" stroke="var(--coral)" strokeWidth="1.8" />
              </g>
            </g>
          )}

          {/* Clusters */}
          {left.map((n, i) => (
            <Node key={n.id} x={n.x} y={n.y + drift(i)} label={n.id} state={leftState} />
          ))}
          {right.map((n, i) => (
            <Node key={n.id} x={n.x} y={n.y + drift(i + 3)} label={n.id} state={rightState} />
          ))}

          {/* Choice labels appear only in phase 2 */}
          {showChoiceLabels && (
            <g style={{ animation: 'fade-up 500ms ease both' }}>
              <text
                x="100"
                y="262"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="9.5"
                fill="var(--emerald)"
                letterSpacing="0.15em"
              >
                CHOOSES C
              </text>
              <text
                x="100"
                y="276"
                textAnchor="middle"
                fontFamily="Spectral, serif"
                fontStyle="italic"
                fontSize="11"
                fill="var(--emerald)"
              >
                refuses to answer
              </text>
              <text
                x="420"
                y="262"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="9.5"
                fill="var(--cyan)"
                letterSpacing="0.15em"
              >
                CHOOSES A
              </text>
              <text
                x="420"
                y="276"
                textAnchor="middle"
                fontFamily="Spectral, serif"
                fontStyle="italic"
                fontSize="11"
                fill="var(--cyan)"
              >
                answers, may be stale
              </text>
            </g>
          )}

          {/* Static cluster labels */}
          <text
            x="100"
            y="300"
            textAnchor="middle"
            fontFamily="Spectral, serif"
            fontStyle="italic"
            fontSize="12"
            fill="var(--ink-faint)"
          >
            cluster α
          </text>
          <text
            x="420"
            y="300"
            textAnchor="middle"
            fontFamily="Spectral, serif"
            fontStyle="italic"
            fontSize="12"
            fill="var(--ink-faint)"
          >
            cluster β
          </text>
        </svg>

        {/* Phase indicator + status — fixed height to prevent jumps */}
        <div
          style={{
            marginTop: 14,
            height: 38,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 5,
              alignItems: 'center',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              letterSpacing: '0.2em',
              color: 'var(--ink-faint)',
            }}
          >
            {['INTACT', 'SEVERED', 'CHOSEN', 'HEALING'].map((p, i) => (
              <React.Fragment key={i}>
                <span
                  style={{
                    color: phase === i ? status.color : 'var(--cap-step-inactive)',
                    transition: 'color 300ms ease',
                    fontWeight: phase === i ? 600 : 400,
                  }}
                >
                  {p}
                </span>
                {i < 3 && <span style={{ color: 'var(--ink-ghost)' }}>·</span>}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              fontFamily: 'Spectral, serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: status.color,
              textAlign: 'center',
              transition: 'color 400ms ease',
              maxWidth: 480,
              lineHeight: 1.35,
            }}
          >
            {status.txt}
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: 44,
          fontFamily: 'Spectral, serif',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 17,
          color: 'var(--ink-faint)',
          lineHeight: 1.6,
          maxWidth: 560,
          margin: '44px auto 0',
        }}
      >
        Networks fail. What the system does <em>when they do</em> <br />
        is the only question that matters.
      </div>
    </section>
  );
}
