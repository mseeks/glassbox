import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { clockWeight, emptyClock, hashesFor, recordEvent } from '../engine/index.js';
import { Callout, Code } from '../components/atoms.jsx';

export const ConstructionLab = () => {
  const [m, setM] = useState(20);
  const [k, setK] = useState(3);
  const [clock, setClock] = useState(() => emptyClock(20));
  const [lastEvent, setLastEvent] = useState(null);
  const [highlightedPositions, setHighlightedPositions] = useState([]);
  const highlightTimer = useRef(null);

  // Reset clock when m changes
  useEffect(() => {
    setClock(emptyClock(m));
    setLastEvent(null);
    setHighlightedPositions([]);
  }, [m]);

  // Clear the pending highlight-fade timeout on unmount so it can't fire late.
  useEffect(() => () => clearTimeout(highlightTimer.current), []);

  const NODES = ['Alice', 'Bob', 'Carol', 'Dan', 'Eve', 'Frank'];
  const NODE_COLORS = [
    'var(--bc-gold)',
    'var(--bc-violet)',
    'var(--bc-emerald)',
    'var(--bc-rose)',
    'var(--bc-teal)',
    'var(--bc-node-6)',
  ];

  const record = (nodeId) => {
    const positions = hashesFor(nodeId, k, m);
    setClock((prev) => recordEvent(prev, nodeId, k));
    setLastEvent(nodeId);
    setHighlightedPositions(positions);
    clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedPositions([]), 1200);
  };

  const reset = () => {
    clearTimeout(highlightTimer.current);
    setClock(emptyClock(m));
    setLastEvent(null);
    setHighlightedPositions([]);
  };

  const maxValue = Math.max(...clock, 1);
  const weight = clockWeight(clock, k);
  const positionsForLastEvent = lastEvent ? hashesFor(lastEvent, k, m) : [];

  return (
    <div className="bc-panel-elevated" style={{ padding: 32 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 28,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div className="bc-eyebrow" style={{ color: 'var(--bc-gold)' }}>
            LAB · CONSTRUCTION
          </div>
          <div className="bc-italic" style={{ fontSize: 26, color: 'var(--bc-ink)', marginTop: 4 }}>
            Record an event. Watch k counters rise.
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className="bc-grid-2" style={{ marginBottom: 30 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              className="bc-mono"
              style={{ fontSize: 11, color: 'var(--bc-ink-muted)', letterSpacing: '0.1em' }}
            >
              SLOTS · m
            </span>
            <span className="bc-italic" style={{ fontSize: 20, color: 'var(--bc-gold)' }}>
              {m}
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="48"
            value={m}
            onChange={(e) => setM(+e.target.value)}
            className="bc-slider"
            aria-label="Number of slots m"
            aria-valuetext={`${m} slots`}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              className="bc-mono"
              style={{ fontSize: 11, color: 'var(--bc-ink-muted)', letterSpacing: '0.1em' }}
            >
              HASHES · k
            </span>
            <span className="bc-italic" style={{ fontSize: 20, color: 'var(--bc-gold)' }}>
              {k}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            value={k}
            onChange={(e) => {
              setK(+e.target.value);
              reset();
            }}
            className="bc-slider"
            aria-label="Number of hash functions k"
            aria-valuetext={`${k} hash functions`}
          />
        </div>
      </div>

      {/* The clock display */}
      <div
        style={{
          padding: 24,
          background: 'var(--bc-inset-6)',
          border: '1px solid var(--bc-rule-strong)',
          borderRadius: 4,
          marginBottom: 22,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 3,
            alignItems: 'flex-end',
            minHeight: 130,
            marginBottom: 14,
          }}
        >
          {clock.map((v, i) => {
            const highlighted = highlightedPositions.includes(i);
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  minWidth: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: 110,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    background: highlighted ? 'var(--bc-gold-wash)' : 'var(--bc-sheen)',
                    borderRadius: 2,
                    border: highlighted
                      ? '1px solid var(--bc-gold-edge)'
                      : '1px solid var(--bc-sheen-border)',
                    transition: 'background 200ms, border-color 200ms',
                  }}
                >
                  {v > 0 && (
                    <div
                      className="bc-counter-bar"
                      style={{
                        width: '100%',
                        height: `${Math.max(4, (v / maxValue) * 100)}%`,
                        animation: highlighted
                          ? 'bc-bar-grow 380ms cubic-bezier(0.22, 1, 0.36, 1)'
                          : undefined,
                      }}
                    />
                  )}
                </div>
                <div
                  className="bc-mono"
                  style={{
                    fontSize: 10,
                    color: v > 0 ? 'var(--bc-gold)' : 'var(--bc-ink-ghost)',
                    fontWeight: 500,
                  }}
                >
                  {v}
                </div>
                <div className="bc-mono" style={{ fontSize: 9, color: 'var(--bc-ink-ghost)' }}>
                  {i}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid var(--bc-rule)',
            fontSize: 12,
          }}
        >
          <div className="bc-mono" style={{ color: 'var(--bc-ink-muted)' }}>
            <span style={{ color: 'var(--bc-ink-faint)' }}>weight ≈ </span>
            <span style={{ color: 'var(--bc-gold)' }}>{weight.toFixed(1)}</span>
            <span style={{ color: 'var(--bc-ink-faint)' }}> events</span>
          </div>
          <div className="bc-mono" style={{ color: 'var(--bc-ink-muted)' }}>
            <span style={{ color: 'var(--bc-ink-faint)' }}>slots used: </span>
            <span style={{ color: 'var(--bc-gold)' }}>
              {clock.filter((v) => v > 0).length}/{m}
            </span>
          </div>
          <div className="bc-mono" style={{ color: 'var(--bc-ink-muted)' }}>
            <span style={{ color: 'var(--bc-ink-faint)' }}>max counter: </span>
            <span style={{ color: 'var(--bc-gold)' }}>{maxValue}</span>
          </div>
        </div>
      </div>

      {/* Event buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {NODES.map((id, i) => (
          <button
            key={id}
            onClick={() => record(id)}
            className="bc-btn"
            style={{
              borderColor: `color-mix(in srgb, ${NODE_COLORS[i]} 38%, transparent)`,
              color: NODE_COLORS[i],
              background: `color-mix(in srgb, ${NODE_COLORS[i]} 9%, transparent)`,
            }}
          >
            event at {id}
          </button>
        ))}
        <button className="bc-btn" onClick={reset}>
          <RotateCcw size={13} /> reset
        </button>
      </div>

      {/* Last-event explanation */}
      {lastEvent && (
        <div
          style={{
            padding: '14px 18px',
            background: 'var(--bc-gold-wash)',
            border: '1px solid var(--bc-gold-edge)',
            borderLeft: '3px solid var(--bc-gold)',
            borderRadius: 3,
            fontSize: 15,
            color: 'var(--bc-ink-dim)',
          }}
        >
          <span
            className="bc-mono"
            style={{ fontSize: 11, color: 'var(--bc-gold)', letterSpacing: '0.15em' }}
          >
            LAST EVENT
          </span>{' '}
          <span style={{ color: 'var(--bc-ink)' }}>
            "{lastEvent}" hashed to positions{' '}
            {positionsForLastEvent.map((p, i) => (
              <React.Fragment key={i}>
                <Code>{p}</Code>
                {i < positionsForLastEvent.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
            . Each of those counters was incremented by 1.
          </span>
        </div>
      )}

      <Callout title="What to notice" color="var(--bc-violet)">
        Every node maps to a <em>fixed set of k positions</em>, deterministic from its identity. Two
        nodes can share positions. That's where the noise comes from later. But size never grows:
        you can pick m once and put a thousand nodes in your cluster without changing a single slot.
      </Callout>
    </div>
  );
};
