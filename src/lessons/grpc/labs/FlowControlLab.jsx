import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';

const W = 8; // flow-control window capacity (slots)

// HTTP/2 flow control as backpressure: the receiver advertises a window; a slow
// consumer lets it fill and the sender pauses. The fill loop autoplays on mount,
// so reduced-motion users get a static equilibrium frame that still responds to
// the consumer-speed slider — no animation, but the lesson still lands.
export default function FlowControlLab() {
  const [consumer, setConsumer] = useState(2.5);
  const [fill, setFill] = useState(0);
  const [paused, setPaused] = useState(false);
  const fillRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      // Static frame: where the window settles for this consumer speed.
      const f = Math.max(0, Math.min(W, Math.round(W - consumer)));
      fillRef.current = f;
      setFill(f);
      setPaused(W - f < 0.5);
      return;
    }
    const id = setInterval(() => {
      let f = fillRef.current;
      f = Math.max(0, f - consumer); // consumer acks → frees window
      const space = W - f;
      const sent = Math.min(3, space); // producer wants 3/tick
      setPaused(space < 0.5);
      f = Math.min(W, f + sent);
      fillRef.current = f;
      setFill(f);
    }, 360);
    return () => clearInterval(id);
  }, [consumer, reduced]);

  const filled = Math.round(fill);
  return (
    <div className="gx-panel pad" style={{ marginTop: 22 }}>
      <div className="gx-panel-label">
        <span className="dot" />
        http/2 flow-control window · backpressure
      </div>

      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}
      >
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: paused ? 'var(--coral)' : 'var(--cyan)',
              letterSpacing: '0.1em',
            }}
          >
            {paused ? 'PAUSED' : 'SENDING'}
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--ink-faint2)',
              fontFamily: 'var(--font-mono)',
              marginTop: 3,
            }}
          >
            producer
          </div>
        </div>

        {/* window slots */}
        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
          {Array.from({ length: W }).map((_, i) => {
            const on = i < filled;
            const edge = i === filled - 1;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  maxWidth: 30,
                  height: 40,
                  borderRadius: 5,
                  border: `1px solid ${on ? (paused ? 'var(--coral)' : 'var(--cyan)') : 'var(--line)'}`,
                  background: on
                    ? paused
                      ? 'var(--coral-glow)'
                      : 'var(--cyan-glow)'
                    : 'transparent',
                  boxShadow:
                    edge && on
                      ? `0 0 10px ${paused ? 'var(--coral-glow)' : 'var(--cyan-glow)'}`
                      : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            );
          })}
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--amber)',
              letterSpacing: '0.1em',
            }}
          >
            {consumer.toFixed(1)}/t
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--ink-faint2)',
              fontFamily: 'var(--font-mono)',
              marginTop: 3,
            }}
          >
            consumer
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: 'var(--ink-dim)',
            fontFamily: 'var(--font-mono)',
            marginBottom: 6,
          }}
        >
          <span>slow consumer</span>
          <span>consumer speed</span>
          <span>fast</span>
        </div>
        <input
          className="gx-range"
          type="range"
          aria-label="consumer speed"
          min={0.4}
          max={3.2}
          step={0.1}
          value={consumer}
          onChange={(e) => setConsumer(+e.target.value)}
        />
      </div>

      <p style={{ fontSize: 14, color: 'var(--ink-dim)', margin: '16px 0 0' }}>
        The receiver advertises how much it can take — the{' '}
        <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>window</em>. When a slow consumer
        lets it fill, the sender <b style={{ color: 'var(--coral)' }}>pauses</b> at the protocol
        level. Slowness propagates
        <b> backward</b>, sender to receiver, automatically. That's{' '}
        <em style={{ color: 'var(--cyan)', fontStyle: 'normal' }}>backpressure</em> — and it's why a
        gRPC stream won't let a firehose drown a struggling reader.
      </p>
    </div>
  );
}
