import { useEffect, useState } from 'react';
import { ClusterNode } from '../components/ClusterNode.jsx';

export function IncarnationConflict() {
  // Three nodes, A B C, each holding a view of node X.
  // We simulate a sequence of events to show how higher incarnation wins.
  const [scenario, setScenario] = useState(0);

  const scenarios = [
    {
      title: 'Refutation under suspicion',
      narrative:
        'X is suspected by A. X refutes by gossipping alive(i+1). The refutation wins because its incarnation is higher.',
      steps: [
        { who: 'A', view: { state: 'alive', i: 4 }, msg: null },
        { who: 'A', view: { state: 'suspect', i: 4 }, msg: 'A: probe failed → suspect(X, 4)' },
        { who: 'X', view: null, msg: 'X hears suspect(X, 4), increments incarnation' },
        { who: 'A', view: { state: 'alive', i: 5 }, msg: 'X gossips alive(X, 5) → A applies it' },
      ],
    },
    {
      title: 'Stale message ignored',
      narrative:
        'A holds suspect(X, 5). An old alive(X, 4) packet arrives late. Because its incarnation is lower, it is discarded.',
      steps: [
        { who: 'A', view: { state: 'suspect', i: 5 }, msg: null },
        { who: 'A', view: { state: 'suspect', i: 5 }, msg: 'Late packet arrives: alive(X, 4)' },
        {
          who: 'A',
          view: { state: 'suspect', i: 5 },
          msg: 'i=4 < i=5 → ignored. Local view unchanged.',
        },
      ],
    },
    {
      title: 'Suspect overrides alive at same i',
      narrative:
        'A holds alive(X, 7). A suspect(X, 7) arrives from B. They tie on incarnation, but suspect has higher precedence at equal i.',
      steps: [
        { who: 'A', view: { state: 'alive', i: 7 }, msg: null },
        { who: 'A', view: { state: 'alive', i: 7 }, msg: 'Incoming: suspect(X, 7) from B' },
        {
          who: 'A',
          view: { state: 'suspect', i: 7 },
          msg: 'Tie on i → suspect wins. View now suspect(X, 7).',
        },
      ],
    },
    {
      title: 'Dead is absorbing',
      narrative:
        'Once any node receives dead(X, k), no incoming message can revive X. Even a future alive(X, 99) is ignored. X must rejoin as a new identity.',
      steps: [
        { who: 'A', view: { state: 'alive', i: 7 }, msg: null },
        { who: 'A', view: { state: 'dead', i: 7 }, msg: 'Incoming: dead(X, 7), confirmation' },
        { who: 'A', view: { state: 'dead', i: 7 }, msg: 'Incoming: alive(X, 99) (somehow)' },
        {
          who: 'A',
          view: { state: 'dead', i: 7 },
          msg: 'DEAD is absorbing. alive(X, 99) discarded.',
        },
      ],
    },
  ];

  const cur = scenarios[scenario];
  const [stepIdx, setStepIdx] = useState(0);

  // reset when scenario changes
  useEffect(() => {
    setStepIdx(0);
  }, [scenario]);

  // auto-advance
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    if (stepIdx >= cur.steps.length - 1) {
      setAuto(false);
      return;
    }
    const t = setTimeout(() => setStepIdx((s) => s + 1), 1800);
    return () => clearTimeout(t);
  }, [auto, stepIdx, cur.steps.length]);

  const view = cur.steps[stepIdx]?.view;

  return (
    <div className="swim-card" style={{ padding: 0, overflow: 'hidden' }}>
      <span className="swim-corner-ornament tl" />
      <span className="swim-corner-ornament tr" />
      <span className="swim-corner-ornament bl" />
      <span className="swim-corner-ornament br" />

      <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--border)' }}>
        <div className="swim-label" style={{ color: 'var(--ink-dim)' }}>
          Conflict resolution scenarios
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {scenarios.map((s, i) => (
            <button
              key={i}
              className="swim-btn"
              data-active={scenario === i}
              onClick={() => {
                setScenario(i);
                setAuto(false);
              }}
              style={{ fontSize: 10 }}
            >
              {i + 1}. {s.title}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 320 }}>
        <div
          style={{ padding: 28, background: 'var(--bg-deeper)', position: 'relative' }}
          className="dot-grid-bg"
        >
          <div className="swim-label" style={{ color: 'var(--ink-faint)', marginBottom: 20 }}>
            Node A's view of X
          </div>
          {view && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 18,
                marginTop: 32,
              }}
            >
              <svg width="180" height="180" viewBox="0 0 180 180">
                <ClusterNode
                  x={90}
                  y={90}
                  state={view.state}
                  size={28}
                  pulse={view.state !== 'dead'}
                  incarnation={view.i}
                />
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div
                  className="swim-mono"
                  style={{
                    fontSize: 13,
                    color:
                      view.state === 'alive'
                        ? 'var(--alive)'
                        : view.state === 'suspect'
                          ? 'var(--suspect)'
                          : 'var(--dead)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {view.state}(X, {view.i})
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div className="swim-label" style={{ color: 'var(--ink-faint)', marginBottom: 16 }}>
            Trace
          </div>
          <div
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}
          >
            {cur.steps.slice(0, stepIdx + 1).map((s, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11.5,
                  color: i === stepIdx ? 'var(--ink-bright)' : 'var(--ink-faint)',
                  padding: '6px 0',
                  borderLeft: i === stepIdx ? '2px solid var(--brass)' : '2px solid transparent',
                  paddingLeft: 10,
                  transition: 'all 0.3s',
                }}
              >
                {s.msg ? s.msg : 'Initial state'}
              </div>
            ))}
          </div>
          <div
            style={{
              padding: 14,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              fontStyle: 'italic',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 15,
              color: 'var(--ink-dim)',
              lineHeight: 1.5,
            }}
          >
            {cur.narrative}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="swim-btn" onClick={() => setStepIdx(0)}>
              ↺ restart
            </button>
            <button
              className="swim-btn"
              onClick={() => setStepIdx((s) => Math.min(s + 1, cur.steps.length - 1))}
              disabled={stepIdx >= cur.steps.length - 1}
            >
              step ›
            </button>
            <button
              className="swim-btn"
              data-active={auto}
              onClick={() => {
                setStepIdx(0);
                setAuto(true);
              }}
            >
              ▶ play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
