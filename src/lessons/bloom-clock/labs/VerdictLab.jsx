import { useEffect, useState } from 'react';
import {
  clockWeight,
  compareClocks,
  emptyClock,
  mergeClocks,
  recordEvent,
} from '../engine/index.js';
import { Callout } from '../components/atoms.jsx';

export const VerdictLab = () => {
  const M = 16;
  const K = 3;

  // Three preset scenarios + freeform
  const [scenario, setScenario] = useState('caused');

  const computeClocks = (mode) => {
    let cA = emptyClock(M);
    let cB = emptyClock(M);

    if (mode === 'caused') {
      // A causes B: A records events, then sends to B which merges and records
      cA = recordEvent(cA, 'Alice', K);
      cA = recordEvent(cA, 'Bob', K);
      cB = mergeClocks(cB, cA);
      cB = recordEvent(cB, 'Bob', K);
    } else if (mode === 'concurrent') {
      // A and B do their own thing in parallel
      cA = recordEvent(cA, 'Alice', K);
      cA = recordEvent(cA, 'Alice', K);
      cB = recordEvent(cB, 'Carol', K);
      cB = recordEvent(cB, 'Dan', K);
    } else if (mode === 'fp') {
      // Concurrent but designed so A ends up dominated by B (false positive risk)
      cA = recordEvent(cA, 'Alice', K);
      cB = recordEvent(cB, 'Alice', K);
      cB = recordEvent(cB, 'Alice', K);
      cB = recordEvent(cB, 'Bob', K);
      cB = recordEvent(cB, 'Carol', K);
      cB = recordEvent(cB, 'Dan', K);
      cB = recordEvent(cB, 'Eve', K);
    }
    return { cA, cB };
  };

  const [{ cA, cB }, setClocks] = useState(() => computeClocks('caused'));

  useEffect(() => {
    setClocks(computeClocks(scenario));
  }, [scenario]);

  const verdict = compareClocks(cA, cB);
  const truth = scenario === 'caused' ? 'before' : 'concurrent';
  const isFP = verdict !== truth && verdict !== 'equal';

  const maxVal = Math.max(...cA, ...cB, 1);

  const verdictMeta = {
    before: { label: 'A → B', sub: 'A probably happened before B', color: '#b794f4', exact: false },
    after: { label: 'B → A', sub: 'B probably happened before A', color: '#b794f4', exact: false },
    concurrent: {
      label: 'A || B',
      sub: 'A and B are certainly concurrent',
      color: '#6ee7b7',
      exact: true,
    },
    equal: {
      label: 'A ≡ B',
      sub: 'A and B are component-wise identical',
      color: '#f5b942',
      exact: false,
    },
  };

  const v = verdictMeta[verdict];

  return (
    <div className="bc-panel-elevated" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="bc-eyebrow" style={{ color: '#b794f4' }}>
          LAB · COMPARE
        </div>
        <div className="bc-italic" style={{ fontSize: 26, color: '#f0e8d2', marginTop: 4 }}>
          Three scenarios, three verdicts
        </div>
      </div>

      {/* Scenario picker */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'caused', label: 'A causes B', sub: 'A sends to B' },
          { id: 'concurrent', label: 'Concurrent', sub: 'Independent events' },
          { id: 'fp', label: 'False-positive risk', sub: 'Concurrent but B is heavy' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s.id)}
            className="bc-btn"
            style={{
              padding: '10px 16px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              borderColor: scenario === s.id ? 'rgba(245, 185, 66, 0.6)' : undefined,
              background: scenario === s.id ? 'rgba(245, 185, 66, 0.1)' : undefined,
              color: scenario === s.id ? '#f5b942' : undefined,
            }}
          >
            <span style={{ fontSize: 12 }}>{s.label}</span>
            <span
              style={{ fontSize: 9, opacity: 0.7, letterSpacing: '0.06em', textTransform: 'none' }}
            >
              {s.sub}
            </span>
          </button>
        ))}
      </div>

      {/* The clocks side by side */}
      <div className="bc-compare" style={{ marginBottom: 22 }}>
        {/* Clock A */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="bc-italic" style={{ fontSize: 22, color: '#f5b942' }}>
              Clock A
            </div>
            <div className="bc-mono" style={{ fontSize: 10, color: '#5e5747' }}>
              w={clockWeight(cA, K).toFixed(1)}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-end',
              padding: '10px 8px',
              background: 'rgba(15, 19, 38, 0.5)',
              border: '1px solid rgba(45, 52, 88, 0.5)',
              borderRadius: 3,
              minHeight: 90,
            }}
          >
            {cA.map((val, i) => {
              const bigger = val > cB[i];
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: 60,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      background: bigger ? 'rgba(251, 113, 133, 0.06)' : 'rgba(255,255,255,0.02)',
                      borderRadius: 2,
                      border: bigger
                        ? '1px solid rgba(251, 113, 133, 0.35)'
                        : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {val > 0 && (
                      <div
                        className="bc-counter-bar"
                        style={{
                          width: '100%',
                          height: `${Math.max(4, (val / maxVal) * 100)}%`,
                        }}
                      />
                    )}
                  </div>
                  <div
                    className="bc-mono"
                    style={{ fontSize: 9, color: val > 0 ? '#f5b942' : '#3d3d3d' }}
                  >
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison arrows */}
        <div
          className="bc-vs"
          style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}
        >
          <div
            className="bc-mono"
            style={{ fontSize: 11, color: '#5e5747', writingMode: 'horizontal-tb' }}
          >
            vs.
          </div>
        </div>

        {/* Clock B */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="bc-italic" style={{ fontSize: 22, color: '#5eead4' }}>
              Clock B
            </div>
            <div className="bc-mono" style={{ fontSize: 10, color: '#5e5747' }}>
              w={clockWeight(cB, K).toFixed(1)}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-end',
              padding: '10px 8px',
              background: 'rgba(15, 19, 38, 0.5)',
              border: '1px solid rgba(45, 52, 88, 0.5)',
              borderRadius: 3,
              minHeight: 90,
            }}
          >
            {cB.map((val, i) => {
              const bigger = val > cA[i];
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: 60,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      background: bigger ? 'rgba(94, 234, 212, 0.06)' : 'rgba(255,255,255,0.02)',
                      borderRadius: 2,
                      border: bigger
                        ? '1px solid rgba(94, 234, 212, 0.35)'
                        : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {val > 0 && (
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(4, (val / maxVal) * 100)}%`,
                          background: 'linear-gradient(180deg, #5eead4ee, #5eead466)',
                          boxShadow: '0 0 10px rgba(94, 234, 212, 0.4)',
                          borderRadius: '1px 1px 0 0',
                        }}
                      />
                    )}
                  </div>
                  <div
                    className="bc-mono"
                    style={{ fontSize: 9, color: val > 0 ? '#5eead4' : '#3d3d3d' }}
                  >
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div
        style={{
          padding: '20px 24px',
          background: `${v.color}0d`,
          border: `1px solid ${v.color}44`,
          borderLeft: `4px solid ${v.color}`,
          borderRadius: 3,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div className="bc-eyebrow" style={{ color: v.color, marginBottom: 4 }}>
              VERDICT
            </div>
            <div
              className="bc-display"
              style={{ fontSize: 32, color: v.color, letterSpacing: '-0.01em' }}
            >
              {v.label}
            </div>
            <div className="bc-italic" style={{ fontSize: 18, color: '#c8bfa5', marginTop: 4 }}>
              {v.sub}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="bc-eyebrow" style={{ marginBottom: 4, fontSize: 9 }}>
              {v.exact ? 'EXACT' : 'PROBABILISTIC'}
            </div>
            <div
              className="bc-mono"
              style={{ fontSize: 11, color: v.exact ? '#6ee7b7' : '#b794f4' }}
            >
              {v.exact ? 'no error possible' : 'may be FP'}
            </div>
          </div>
        </div>
      </div>

      {/* Truth-vs-verdict commentary */}
      <div
        style={{
          padding: '14px 18px',
          background: isFP ? 'rgba(251, 113, 133, 0.06)' : 'rgba(110, 231, 183, 0.06)',
          border: `1px solid ${isFP ? 'rgba(251, 113, 133, 0.25)' : 'rgba(110, 231, 183, 0.25)'}`,
          borderLeft: `3px solid ${isFP ? '#fb7185' : '#6ee7b7'}`,
          borderRadius: 3,
          fontSize: 15,
        }}
      >
        <span
          className="bc-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.15em',
            color: isFP ? '#fb7185' : '#6ee7b7',
          }}
        >
          {isFP ? 'FALSE POSITIVE' : 'CORRECT'}
        </span>{' '}
        <span style={{ color: '#c8bfa5' }}>
          {scenario === 'caused' &&
            verdict === 'before' &&
            'A really did cause B, and the clock correctly says so.'}
          {scenario === 'caused' &&
            verdict !== 'before' &&
            'A really caused B, but the clock saw it differently.'}
          {scenario === 'concurrent' &&
            verdict === 'concurrent' &&
            'A and B are independent, and the clock detected the concurrency exactly. This verdict is never wrong.'}
          {scenario === 'concurrent' &&
            verdict === 'before' &&
            'A and B are actually independent, but the clock thinks A → B. This is the kind of probabilistic error a Bloom clock allows.'}
          {scenario === 'concurrent' &&
            verdict === 'after' &&
            'A and B are actually independent, but the clock thinks B → A.'}
          {scenario === 'fp' &&
            verdict === 'before' &&
            'A and B are actually concurrent. But B is so much heavier than A that it accidentally dominates A in every position. The clock reports "A → B" with confidence, even though it\'s wrong. This is exactly the failure mode to understand.'}
          {scenario === 'fp' &&
            verdict === 'concurrent' &&
            'A and B are concurrent, and even with the weight imbalance, some position of A poked above B. The clock got lucky and detected the truth.'}
        </span>
      </div>

      <Callout title="The three verdicts" color="#b794f4">
        <strong>Probabilistic:</strong> "A → B" or "B → A" could be correct, or could be concurrency
        masquerading as causality. <strong>Exact:</strong> "A || B" (concurrent). When neither clock
        dominates the other, both are <em>certainly</em> concurrent. No false negatives. Ever.
      </Callout>
    </div>
  );
};
