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
      <div className="bc-mono" style={{ fontSize: 11, color: '#5e5747' }}>
        weight {clockWeight(clock, kVal).toFixed(1)}
      </div>
    </div>
    <div
      style={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-end',
        padding: '10px 12px',
        background: 'rgba(15, 19, 38, 0.5)',
        border: '1px solid rgba(45, 52, 88, 0.5)',
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
                background: 'rgba(255, 255, 255, 0.025)',
                borderRadius: 2,
                border:
                  highlight && isMax ? `1px solid ${accent}88` : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {v > 0 && (
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(3, (v / maxVal) * 100)}%`,
                    background: `linear-gradient(180deg, ${accent}ee, ${accent}66)`,
                    boxShadow: `0 0 10px ${accent}44`,
                    borderRadius: '1px 1px 0 0',
                    transition: 'height 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              )}
            </div>
            <div className="bc-mono" style={{ fontSize: 9, color: v > 0 ? accent : '#3d3d3d' }}>
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
        <div className="bc-eyebrow" style={{ color: '#b794f4' }}>
          LAB · MERGE
        </div>
        <div className="bc-italic" style={{ fontSize: 26, color: '#f0e8d2', marginTop: 4 }}>
          Pointwise max, position by position
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <BarRow clock={clockA} label="Clock A" accent="#f5b942" maxVal={allMax} kVal={K} />
        <div className="bc-divider">
          <span className="bc-mono" style={{ fontSize: 10 }}>
            +
          </span>
        </div>
        <BarRow clock={clockB} label="Clock B" accent="#5eead4" maxVal={allMax} kVal={K} />
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
              accent="#b794f4"
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
            style={{ fontSize: 11, color: '#5e5747', alignSelf: 'center', marginRight: 6 }}
          >
            A:
          </span>
          {['Alice', 'Bob', 'Carol'].map((id) => (
            <button
              key={id}
              onClick={() => addToA(id)}
              className="bc-btn"
              style={{
                borderColor: 'rgba(245, 185, 66, 0.4)',
                color: '#f5b942',
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
            style={{ fontSize: 11, color: '#5e5747', alignSelf: 'center', marginRight: 6 }}
          >
            B:
          </span>
          {['Bob', 'Carol', 'Dan'].map((id) => (
            <button
              key={id}
              onClick={() => addToB(id)}
              className="bc-btn"
              style={{
                borderColor: 'rgba(94, 234, 212, 0.4)',
                color: '#5eead4',
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

      <Callout title="The merge" color="#b794f4">
        At every position, the merged clock takes the <em>larger</em> of A's value and B's value.
        Information flows monotonically — counters never decrease. This is what makes the merge
        associative, commutative, and idempotent: properties that let a whole cluster gossip clocks
        in any order and still converge.
      </Callout>
    </div>
  );
};
