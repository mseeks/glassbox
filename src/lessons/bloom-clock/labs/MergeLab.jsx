import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { clockWeight, emptyClock, mergeClocks, recordEvent } from '../engine/index.js';
import { Callout } from '../components/atoms.jsx';

// Hoisted to module scope so it isn't redefined on every MergeLab render
// (an inline component remounts its whole subtree each render). The merge
// inputs it needs for the "took the max" highlight are threaded via props.
const BarRow = ({
  clock,
  label,
  accent,
  barTop,
  barBot,
  glow,
  edge,
  maxVal,
  takesMax,
  highlight,
  merged,
  clockA,
  clockB,
  kVal,
}) => (
  <div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
      }}
    >
      <div className="bc-italic" style={{ fontSize: 20, color: accent }}>
        {label}
      </div>
      <div className="bc-mono" style={{ fontSize: 11, color: 'var(--bc-ink-faint)' }}>
        weight {clockWeight(clock, kVal).toFixed(1)}
      </div>
    </div>
    <div
      style={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-end',
        padding: '10px 12px',
        background: 'var(--bc-inset-5)',
        border: '1px solid var(--bc-rule)',
        borderRadius: 3,
      }}
    >
      {clock.map((v, i) => {
        const isMax = takesMax && merged && merged[i] === v && clockA[i] !== clockB[i];
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                width: '100%',
                height: 70,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                background: 'var(--bc-sheen-2)',
                borderRadius: 2,
                border:
                  highlight && isMax ? `1px solid ${edge}` : '1px solid var(--bc-sheen-border)',
              }}
            >
              {v > 0 && (
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(3, (v / maxVal) * 100)}%`,
                    background: `linear-gradient(180deg, ${barTop}, ${barBot})`,
                    boxShadow: `0 0 10px ${glow}`,
                    borderRadius: '1px 1px 0 0',
                    transition: 'height 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              )}
            </div>
            <div
              className="bc-mono"
              style={{ fontSize: 9, color: v > 0 ? accent : 'var(--bc-ink-ghost)' }}
            >
              {v}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export const MergeLab = () => {
  const M = 16;
  const K = 3;

  const [clockA, setClockA] = useState(() => {
    let c = emptyClock(M);
    c = recordEvent(c, 'Alice', K);
    c = recordEvent(c, 'Alice', K);
    c = recordEvent(c, 'Bob', K);
    return c;
  });

  const [clockB, setClockB] = useState(() => {
    let c = emptyClock(M);
    c = recordEvent(c, 'Bob', K);
    c = recordEvent(c, 'Carol', K);
    c = recordEvent(c, 'Dan', K);
    return c;
  });

  const [merged, setMerged] = useState(null);
  const [showingMerge, setShowingMerge] = useState(false);
  const mergeTimer = useRef(null);

  // Clear the pending reveal timeout on unmount so it can't fire late.
  useEffect(() => () => clearTimeout(mergeTimer.current), []);

  const runMerge = () => {
    setShowingMerge(true);
    clearTimeout(mergeTimer.current);
    mergeTimer.current = setTimeout(() => setMerged(mergeClocks(clockA, clockB)), 400);
  };

  const reset = () => {
    clearTimeout(mergeTimer.current);
    setShowingMerge(false);
    setMerged(null);
    let cA = emptyClock(M);
    cA = recordEvent(cA, 'Alice', K);
    cA = recordEvent(cA, 'Alice', K);
    cA = recordEvent(cA, 'Bob', K);
    setClockA(cA);
    let cB = emptyClock(M);
    cB = recordEvent(cB, 'Bob', K);
    cB = recordEvent(cB, 'Carol', K);
    cB = recordEvent(cB, 'Dan', K);
    setClockB(cB);
  };

  const addToA = (id) => setClockA((prev) => recordEvent(prev, id, K));
  const addToB = (id) => setClockB((prev) => recordEvent(prev, id, K));

  const allMax = Math.max(...clockA, ...clockB, ...(merged || []), 1);

  return (
    <div className="bc-panel-elevated" style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <div className="bc-eyebrow" style={{ color: 'var(--bc-violet)' }}>
          LAB · MERGE
        </div>
        <div className="bc-italic" style={{ fontSize: 26, color: 'var(--bc-ink)', marginTop: 4 }}>
          Pointwise max, position by position
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <BarRow
          clock={clockA}
          label="Clock A"
          accent="var(--bc-gold)"
          barTop="var(--bc-gold-bar-top)"
          barBot="var(--bc-gold-bar-bot)"
          glow="var(--bc-gold-glow)"
          edge="var(--bc-gold-edge)"
          maxVal={allMax}
          kVal={K}
        />
        <div className="bc-divider">
          <span className="bc-mono" style={{ fontSize: 10 }}>
            +
          </span>
        </div>
        <BarRow
          clock={clockB}
          label="Clock B"
          accent="var(--bc-teal)"
          barTop="var(--bc-teal-bar-top)"
          barBot="var(--bc-teal-bar-bot)"
          glow="var(--bc-teal-glow)"
          edge="var(--bc-teal-edge)"
          maxVal={allMax}
          kVal={K}
        />
        {showingMerge && merged && (
          <>
            <div className="bc-divider">
              <span className="bc-mono" style={{ fontSize: 10 }}>
                = max(A, B)
              </span>
            </div>
            <BarRow
              clock={merged}
              label="Merged"
              accent="var(--bc-violet)"
              barTop="var(--bc-violet-bar-top)"
              barBot="var(--bc-violet-bar-bot)"
              glow="var(--bc-violet-glow)"
              edge="var(--bc-violet-edge)"
              maxVal={allMax}
              takesMax
              highlight
              merged={merged}
              clockA={clockA}
              clockB={clockB}
              kVal={K}
            />
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span
            className="bc-mono"
            style={{
              fontSize: 11,
              color: 'var(--bc-ink-faint)',
              alignSelf: 'center',
              marginRight: 6,
            }}
          >
            A:
          </span>
          {['Alice', 'Bob', 'Carol'].map((id) => (
            <button
              key={id}
              onClick={() => addToA(id)}
              className="bc-btn"
              style={{
                borderColor: 'var(--bc-gold-edge)',
                color: 'var(--bc-gold)',
                padding: '6px 12px',
                fontSize: 11,
              }}
            >
              +{id}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span
            className="bc-mono"
            style={{
              fontSize: 11,
              color: 'var(--bc-ink-faint)',
              alignSelf: 'center',
              marginRight: 6,
            }}
          >
            B:
          </span>
          {['Bob', 'Carol', 'Dan'].map((id) => (
            <button
              key={id}
              onClick={() => addToB(id)}
              className="bc-btn"
              style={{
                borderColor: 'var(--bc-teal-edge)',
                color: 'var(--bc-teal)',
                padding: '6px 12px',
                fontSize: 11,
              }}
            >
              +{id}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="bc-btn bc-btn-violet" onClick={runMerge} disabled={showingMerge}>
            <Sparkles size={13} /> merge
          </button>
          <button className="bc-btn" onClick={reset}>
            <RotateCcw size={13} /> reset
          </button>
        </div>
      </div>

      <Callout title="The merge" color="var(--bc-violet)">
        At every position, the merged clock takes the <em>larger</em> of A's value and B's value.
        Information flows monotonically. Counters never decrease. This is what makes the merge
        associative, commutative, and idempotent: properties that let a whole cluster gossip clocks
        in any order and still converge.
      </Callout>
    </div>
  );
};
