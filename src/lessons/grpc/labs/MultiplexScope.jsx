import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SCHEDULES, completionTimes } from '../engine/index.js';

// Per-stream colours for the scope. The frame counts + schedules + completion
// math live in the engine; this map is the only view-layer concern.
const STREAM_STYLE = {
  A: { c: 'var(--cyan)', glow: 'var(--cyan-glow)' },
  B: { c: 'var(--amber)', glow: 'var(--amber-glow)' },
  C: { c: 'var(--violet)', glow: 'var(--violet-glow)' },
};

// Three streams share one TCP connection. HTTP/1.1 sends each to completion
// (head-of-line blocking); HTTP/2 interleaves frames. Replay is user-initiated,
// so it may animate even under reduced motion; the resting frame is fully drawn.
export default function MultiplexScope() {
  const [mode, setMode] = useState('h1');
  const [head, setHead] = useState(10);
  const timer = useRef(null);

  const sched = SCHEDULES[mode];
  const done = useMemo(() => completionTimes(sched), [sched]);

  const play = useCallback(() => {
    clearInterval(timer.current);
    setHead(0);
    timer.current = setInterval(() => {
      setHead((h) => {
        if (h >= 10) {
          clearInterval(timer.current);
          return 10;
        }
        return h + 1;
      });
    }, 300);
  }, []);
  useEffect(() => () => clearInterval(timer.current), []);
  useEffect(() => {
    setHead(10);
    clearInterval(timer.current);
  }, [mode]);

  return (
    <div className="gx-panel pad" style={{ marginTop: 22 }}>
      <div className="gx-panel-label">
        <span className="dot" />
        one TCP connection · frames over time →
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div className="gx-seg">
          <button className={`gx-btn ${mode === 'h1' ? 'on' : ''}`} onClick={() => setMode('h1')}>
            HTTP/1.1
          </button>
          <button className={`gx-btn ${mode === 'h2' ? 'on' : ''}`} onClick={() => setMode('h2')}>
            HTTP/2
          </button>
        </div>
        <button className="gx-btn" onClick={play} style={{ marginLeft: 'auto' }}>
          ▶ replay
        </button>
      </div>

      {/* stream legend */}
      <div className="gx-legend" style={{ marginBottom: 12 }}>
        <span>
          <i style={{ background: 'var(--cyan)' }} />
          stream A · big
        </span>
        <span>
          <i style={{ background: 'var(--amber)' }} />
          stream B · small
        </span>
        <span>
          <i style={{ background: 'var(--violet)' }} />
          stream C · small
        </span>
      </div>

      {/* the timeline */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {sched.map((s, i) => {
          const lit = i < head;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 5,
                position: 'relative',
                border: `1px solid ${lit ? STREAM_STYLE[s].c : 'var(--line)'}`,
                background: lit ? STREAM_STYLE[s].glow : 'transparent',
                transition: 'all 0.18s ease',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: lit ? STREAM_STYLE[s].c : 'var(--ink-faint)',
                }}
              >
                {s}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--ink-faint2)',
          textAlign: 'right',
          marginBottom: 16,
        }}
      >
        time slot →
      </div>

      {/* completion readout */}
      <div className="gx-stat-row">
        {['A', 'B', 'C'].map((s) => (
          <div
            key={s}
            className="gx-stat"
            style={{ borderColor: head >= done[s] ? STREAM_STYLE[s].c : 'var(--line)' }}
          >
            <div className="v" style={{ color: STREAM_STYLE[s].c, fontSize: 22 }}>
              {head >= done[s] ? `t=${done[s]}` : '…'}
            </div>
            <div className="k">stream {s} done</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 14, color: 'var(--ink-dim)', margin: '16px 0 0' }}>
        {mode === 'h1' ? (
          <>
            HTTP/1.1 sends one response to completion before the next starts. The big stream{' '}
            <b style={{ color: 'var(--cyan)' }}>A</b> holds the line. Small streams{' '}
            <b style={{ color: 'var(--amber)' }}>B</b> (t=8) and{' '}
            <b style={{ color: 'var(--violet)' }}>C</b> (t=10) wait behind it. This is{' '}
            <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>head-of-line blocking</em>.
          </>
        ) : (
          <>
            HTTP/2 chops every message into{' '}
            <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>frames</em> tagged with a
            stream id and <b>interleaves</b> them on one connection.{' '}
            <b style={{ color: 'var(--amber)' }}>B</b> finishes at t=5 and{' '}
            <b style={{ color: 'var(--violet)' }}>C</b> at t=6. Neither is trapped behind{' '}
            <b style={{ color: 'var(--cyan)' }}>A</b> anymore. The honest cost: A finishes a touch
            later. gRPC rides exactly this.
          </>
        )}
      </p>
    </div>
  );
}
