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
    before: {
      label: 'A → B',
      sub: 'A probably happened before B',
      color: 'var(--bc-violet)',
      exact: false,
    },
    after: {
      label: 'B → A',
      sub: 'B probably happened before A',
      color: 'var(--bc-violet)',
      exact: false,
    },
    concurrent: {
      label: 'A || B',
      sub: 'A and B are certainly concurrent',
      color: 'var(--bc-emerald)',
      exact: true,
    },
    equal: {
      label: 'A ≡ B',
      sub: 'A and B are component-wise identical',
      color: 'var(--bc-gold)',
      exact: false,
    },
  };

  const v = verdictMeta[verdict];

  return (
    <div className="bc-panel-elevated" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <div className="bc-eyebrow" style={{ color: 'var(--bc-violet)' }}>
          LAB · COMPARE
        </div>
        <div className="bc-italic" style={{ fontSize: 26, color: 'var(--bc-ink)', marginTop: 4 }}>
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
              borderColor: scenario === s.id ? 'var(--bc-gold-edge-strong)' : undefined,
              background: scenario === s.id ? 'var(--bc-gold-wash)' : undefined,
              color: scenario === s.id ? 'var(--bc-gold)' : undefined,
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
            <div className="bc-italic" style={{ fontSize: 22, color: 'var(--bc-gold)' }}>
              Clock A
            </div>
            <div className="bc-mono" style={{ fontSize: 10, color: 'var(--bc-ink-faint)' }}>
              w={clockWeight(cA, K).toFixed(1)}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-end',
              padding: '10px 8px',
              background: 'var(--bc-inset-5)',
              border: '1px solid var(--bc-rule)',
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
                      background: bigger ? 'var(--bc-rose-wash)' : 'var(--bc-sheen)',
                      borderRadius: 2,
                      border: bigger
                        ? '1px solid var(--bc-rose-edge)'
                        : '1px solid var(--bc-sheen-border)',
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
                    style={{
                      fontSize: 9,
                      color: val > 0 ? 'var(--bc-gold)' : 'var(--bc-ink-ghost)',
                    }}
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
            style={{ fontSize: 11, color: 'var(--bc-ink-faint)', writingMode: 'horizontal-tb' }}
          >
            vs.
          </div>
        </div>

        {/* Clock B */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="bc-italic" style={{ fontSize: 22, color: 'var(--bc-teal)' }}>
              Clock B
            </div>
            <div className="bc-mono" style={{ fontSize: 10, color: 'var(--bc-ink-faint)' }}>
              w={clockWeight(cB, K).toFixed(1)}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-end',
              padding: '10px 8px',
              background: 'var(--bc-inset-5)',
              border: '1px solid var(--bc-rule)',
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
                      background: bigger ? 'var(--bc-teal-wash)' : 'var(--bc-sheen)',
                      borderRadius: 2,
                      border: bigger
                        ? '1px solid var(--bc-teal-edge)'
                        : '1px solid var(--bc-sheen-border)',
                    }}
                  >
                    {val > 0 && (
                      <div
                        style={{
                          width: '100%',
                          height: `${Math.max(4, (val / maxVal) * 100)}%`,
                          background:
                            'linear-gradient(180deg, var(--bc-teal-bar-top), var(--bc-teal-bar-bot))',
                          boxShadow: '0 0 10px var(--bc-teal-glow)',
                          borderRadius: '1px 1px 0 0',
                        }}
                      />
                    )}
                  </div>
                  <div
                    className="bc-mono"
                    style={{
                      fontSize: 9,
                      color: val > 0 ? 'var(--bc-teal)' : 'var(--bc-ink-ghost)',
                    }}
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
          background: `color-mix(in srgb, ${v.color} 8%, transparent)`,
          border: `1px solid color-mix(in srgb, ${v.color} 28%, transparent)`,
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
            <div
              className="bc-italic"
              style={{ fontSize: 18, color: 'var(--bc-ink-dim)', marginTop: 4 }}
            >
              {v.sub}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="bc-eyebrow" style={{ marginBottom: 4, fontSize: 9 }}>
              {v.exact ? 'EXACT' : 'PROBABILISTIC'}
            </div>
            <div
              className="bc-mono"
              style={{ fontSize: 11, color: v.exact ? 'var(--bc-emerald)' : 'var(--bc-violet)' }}
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
          background: isFP ? 'var(--bc-rose-wash)' : 'var(--bc-emerald-wash)',
          border: `1px solid ${isFP ? 'var(--bc-rose-edge)' : 'var(--bc-emerald-edge)'}`,
          borderLeft: `3px solid ${isFP ? 'var(--bc-rose)' : 'var(--bc-emerald)'}`,
          borderRadius: 3,
          fontSize: 15,
        }}
      >
        <span
          className="bc-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.15em',
            color: isFP ? 'var(--bc-rose)' : 'var(--bc-emerald)',
          }}
        >
          {isFP ? 'FALSE POSITIVE' : 'CORRECT'}
        </span>{' '}
        <span style={{ color: 'var(--bc-ink-dim)' }}>
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

      <Callout title="The three verdicts" color="var(--bc-violet)">
        <strong>Probabilistic:</strong> "A → B" or "B → A" could be correct, or could be concurrency
        masquerading as causality. <strong>Exact:</strong> "A || B" (concurrent). When neither clock
        dominates the other, both are <em>certainly</em> concurrent. No false negatives. Ever.
      </Callout>
    </div>
  );
};
