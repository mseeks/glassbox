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
  const NODE_COLORS = ['#f5b942', '#b794f4', '#6ee7b7', '#fb7185', '#5eead4', '#a78bfa'];

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
          <div className="bc-eyebrow" style={{ color: '#f5b942' }}>
            LAB · CONSTRUCTION
          </div>
          <div className="bc-italic" style={{ fontSize: 26, color: '#f0e8d2', marginTop: 4 }}>
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
              style={{ fontSize: 11, color: '#a89e85', letterSpacing: '0.1em' }}
            >
              SLOTS · m
            </span>
            <span className="bc-italic" style={{ fontSize: 20, color: '#f5b942' }}>
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
              style={{ fontSize: 11, color: '#a89e85', letterSpacing: '0.1em' }}
            >
              HASHES · k
            </span>
            <span className="bc-italic" style={{ fontSize: 20, color: '#f5b942' }}>
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
          background: 'rgba(15, 19, 38, 0.6)',
          border: '1px solid rgba(45, 52, 88, 0.6)',
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
                    background: highlighted ? 'rgba(245, 185, 66, 0.08)' : 'rgba(255,255,255,0.02)',
                    borderRadius: 2,
                    border: highlighted
                      ? '1px solid rgba(245, 185, 66, 0.4)'
                      : '1px solid rgba(255,255,255,0.04)',
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
                    color: v > 0 ? '#f5b942' : '#3d3d3d',
                    fontWeight: 500,
                  }}
                >
                  {v}
                </div>
                <div className="bc-mono" style={{ fontSize: 9, color: '#3d3d3d' }}>
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
            borderTop: '1px solid rgba(45, 52, 88, 0.5)',
            fontSize: 12,
          }}
        >
          <div className="bc-mono" style={{ color: '#a89e85' }}>
            <span style={{ color: '#5e5747' }}>weight ≈ </span>
            <span style={{ color: '#f5b942' }}>{weight.toFixed(1)}</span>
            <span style={{ color: '#5e5747' }}> events</span>
          </div>
          <div className="bc-mono" style={{ color: '#a89e85' }}>
            <span style={{ color: '#5e5747' }}>slots used: </span>
            <span style={{ color: '#f5b942' }}>
              {clock.filter((v) => v > 0).length}/{m}
            </span>
          </div>
          <div className="bc-mono" style={{ color: '#a89e85' }}>
            <span style={{ color: '#5e5747' }}>max counter: </span>
            <span style={{ color: '#f5b942' }}>{maxValue}</span>
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
              borderColor: `${NODE_COLORS[i]}55`,
              color: NODE_COLORS[i],
              background: `${NODE_COLORS[i]}11`,
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
            background: 'rgba(245, 185, 66, 0.06)',
            border: '1px solid rgba(245, 185, 66, 0.2)',
            borderLeft: '3px solid #f5b942',
            borderRadius: 3,
            fontSize: 15,
            color: '#c8bfa5',
          }}
        >
          <span
            className="bc-mono"
            style={{ fontSize: 11, color: '#f5b942', letterSpacing: '0.15em' }}
          >
            LAST EVENT
          </span>{' '}
          <span style={{ color: '#f0e8d2' }}>
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

      <Callout title="What to notice" color="#b794f4">
        Every node maps to a <em>fixed set of k positions</em>, deterministic from its identity. Two
        nodes can share positions — that's where the noise comes from later. But size never grows:
        you can pick m once and put a thousand nodes in your cluster without changing a single slot.
      </Callout>
    </div>
  );
};
