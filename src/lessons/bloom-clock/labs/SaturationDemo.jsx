import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { clockWeight, compareClocks, emptyClock, recordEvent } from '../engine/index.js';
import { Callout } from '../components/atoms.jsx';

const SATURATION_M = 32;
const SATURATION_K = 3;
const SATURATION_TARGET_WEIGHT = 80;
const SATURATION_NODE_IDS = [
  'Alice',
  'Bob',
  'Carol',
  'Dan',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
  'Iris',
  'Jack',
];

export const SaturationDemo = () => {
  const M = SATURATION_M;
  const K = SATURATION_K;
  const TARGET_WEIGHT = SATURATION_TARGET_WEIGHT;

  const [running, setRunning] = useState(false);
  const [clockA, setClockA] = useState(() => emptyClock(M));
  const [clockB, setClockB] = useState(() => emptyClock(M));
  const [step, setStep] = useState(0);
  const [stats, setStats] = useState({ checks: 0, fps: 0 });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setStep((s) => s + 1);
      }, 60);
      return () => clearInterval(intervalRef.current);
    }
  }, [running]);

  useEffect(() => {
    if (step === 0 || !running) return;
    // Each step adds 1 concurrent event to each of A and B
    const idA = SATURATION_NODE_IDS[Math.floor(Math.random() * SATURATION_NODE_IDS.length)];
    const idB = SATURATION_NODE_IDS[Math.floor(Math.random() * SATURATION_NODE_IDS.length)];
    setClockA((prev) => {
      const next = recordEvent(prev, idA, K);
      if (clockWeight(next, K) >= TARGET_WEIGHT) {
        setRunning(false);
      }
      return next;
    });
    setClockB((prev) => recordEvent(prev, idB, K));
  }, [step, running, K, TARGET_WEIGHT]);

  // Recompute stats whenever clocks change — count how often A appears dominated by B (FP since they're concurrent)
  useEffect(() => {
    const verdict = compareClocks(clockA, clockB);
    // FP = concurrent in truth but verdict says before/after
    if (verdict === 'before' || verdict === 'after') {
      setStats((s) => ({ checks: s.checks + 1, fps: s.fps + 1 }));
    } else if (verdict === 'concurrent') {
      setStats((s) => ({ checks: s.checks + 1, fps: s.fps }));
    }
  }, [clockA, clockB]);

  const reset = () => {
    setRunning(false);
    setClockA(emptyClock(M));
    setClockB(emptyClock(M));
    setStep(0);
    setStats({ checks: 0, fps: 0 });
  };

  const currentVerdict = compareClocks(clockA, clockB);
  const currentWeight = clockWeight(clockA, K);
  const fpRate = stats.checks > 0 ? stats.fps / stats.checks : 0;

  const maxVal = Math.max(...clockA, ...clockB, 1);

  return (
    <div className="bc-panel-elevated" style={{ padding: 32 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div className="bc-eyebrow" style={{ color: 'var(--bc-rose)' }}>
            LAB · SATURATION
          </div>
          <div className="bc-italic" style={{ fontSize: 26, color: 'var(--bc-ink)', marginTop: 4 }}>
            Watch the clock fall apart
          </div>
        </div>
        <div className="bc-mono" style={{ fontSize: 11, color: 'var(--bc-ink-faint)' }}>
          m = {M}, k = {K}, two concurrent timelines
        </div>
      </div>

      {/* Live clocks */}
      <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
        <div>
          <div
            className="bc-italic"
            style={{ fontSize: 18, color: 'var(--bc-gold)', marginBottom: 6 }}
          >
            Clock A,{' '}
            <span className="bc-mono" style={{ fontSize: 11, color: 'var(--bc-ink-faint)' }}>
              weight {clockWeight(clockA, K).toFixed(0)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-end',
              padding: '8px 10px',
              background: 'var(--bc-inset-5)',
              border: '1px solid var(--bc-rule)',
              borderRadius: 3,
              height: 60,
            }}
          >
            {clockA.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                {v > 0 && (
                  <div
                    className="bc-counter-bar"
                    style={{
                      width: '100%',
                      height: `${Math.max(2, (v / maxVal) * 44)}px`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div
            className="bc-italic"
            style={{ fontSize: 18, color: 'var(--bc-teal)', marginBottom: 6 }}
          >
            Clock B,{' '}
            <span className="bc-mono" style={{ fontSize: 11, color: 'var(--bc-ink-faint)' }}>
              weight {clockWeight(clockB, K).toFixed(0)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 2,
              alignItems: 'flex-end',
              padding: '8px 10px',
              background: 'var(--bc-inset-5)',
              border: '1px solid var(--bc-rule)',
              borderRadius: 3,
              height: 60,
            }}
          >
            {clockB.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                {v > 0 && (
                  <div
                    style={{
                      width: '100%',
                      height: `${Math.max(2, (v / maxVal) * 44)}px`,
                      background:
                        'linear-gradient(180deg, var(--bc-teal-bar-top), var(--bc-teal-bar-bot))',
                      boxShadow: '0 0 8px var(--bc-teal-glow)',
                      borderRadius: '1px 1px 0 0',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats panel */}
      <div className="bc-stat-grid" style={{ marginBottom: 18 }}>
        <div
          style={{
            padding: 14,
            background: 'var(--bc-inset-4)',
            border: '1px solid var(--bc-rule-soft)',
            borderRadius: 3,
          }}
        >
          <div className="bc-eyebrow" style={{ marginBottom: 4, fontSize: 9 }}>
            CURRENT VERDICT
          </div>
          <div
            className="bc-italic"
            style={{
              fontSize: 22,
              color:
                currentVerdict === 'concurrent'
                  ? 'var(--bc-emerald)'
                  : currentVerdict === 'equal'
                    ? 'var(--bc-gold)'
                    : 'var(--bc-rose)',
            }}
          >
            {currentVerdict === 'before' && 'A → B (FP)'}
            {currentVerdict === 'after' && 'B → A (FP)'}
            {currentVerdict === 'concurrent' && 'A || B (✓)'}
            {currentVerdict === 'equal' && 'A ≡ B'}
          </div>
        </div>
        <div
          style={{
            padding: 14,
            background: 'var(--bc-inset-4)',
            border: '1px solid var(--bc-rule-soft)',
            borderRadius: 3,
          }}
        >
          <div className="bc-eyebrow" style={{ marginBottom: 4, fontSize: 9 }}>
            OBSERVED FPR
          </div>
          <div
            className="bc-italic"
            style={{
              fontSize: 22,
              color:
                fpRate > 0.3
                  ? 'var(--bc-rose)'
                  : fpRate > 0.05
                    ? 'var(--bc-gold)'
                    : 'var(--bc-emerald)',
            }}
          >
            {(fpRate * 100).toFixed(1)}%
          </div>
        </div>
        <div
          style={{
            padding: 14,
            background: 'var(--bc-inset-4)',
            border: '1px solid var(--bc-rule-soft)',
            borderRadius: 3,
          }}
        >
          <div className="bc-eyebrow" style={{ marginBottom: 4, fontSize: 9 }}>
            STEPS
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: 'var(--bc-ink)' }}>
            {step}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className={`bc-btn ${running ? 'bc-btn-violet' : 'bc-btn-gold'}`}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? <Pause size={13} /> : <Play size={13} />}
          {running ? 'pause' : currentWeight > 0 ? 'continue' : 'begin'}
        </button>
        <button className="bc-btn" onClick={reset}>
          <RotateCcw size={13} /> reset
        </button>
      </div>

      <Callout title="What you're watching" color="var(--bc-rose)" tone="warn">
        Both clocks are recording <em>completely independent</em> events. They are always,
        truthfully, concurrent. Early on, the structure recognizes this: the verdict reads
        "concurrent." As weight piles on, slots saturate, and the verdict starts flipping to false
        "A → B" or "B → A." The structure isn't broken. It's exhausted. The information density
        exceeds what m and k can carry.
      </Callout>
    </div>
  );
};
