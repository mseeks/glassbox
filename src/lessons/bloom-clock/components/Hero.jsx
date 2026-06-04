import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

export const Hero = () => {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();

  // 64 bars with shifting heights — feels like a slow-breathing spectrum
  const [bars, setBars] = useState(() =>
    Array.from({ length: 64 }, () => Math.random() * 0.6 + 0.1),
  );

  useEffect(() => {
    // Reduced motion: leave the bars at their initial representative
    // heights — a static spectrum — instead of breathing forever.
    // Off-screen: pause the breathing so we don't churn CPU; the last
    // frame stays rendered and motion resumes when scrolled back.
    if (reduced || !inView) return;
    const id = setInterval(() => {
      setBars((prev) =>
        prev.map((v) => {
          // Smooth random walk per bar
          const target = Math.random() * 0.85 + 0.1;
          return v + (target - v) * 0.05;
        }),
      );
    }, 90);
    return () => clearInterval(id);
  }, [reduced, inView]);

  return (
    <section
      ref={vpRef}
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        padding: 'clamp(48px, 8vw, 96px) clamp(18px, 4vw, 48px)',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Constellation background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 3,
          padding: '0 clamp(18px, 4vw, 32px)',
          opacity: 0.22,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {bars.map((h, i) => {
          const colorChoice =
            i % 17 === 0
              ? 'var(--bc-violet)'
              : i % 23 === 0
                ? 'var(--bc-emerald)'
                : 'var(--bc-gold)';
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h * 60}%`,
                background: `linear-gradient(180deg, color-mix(in srgb, ${colorChoice} 80%, transparent) 0%, color-mix(in srgb, ${colorChoice} 13%, transparent) 100%)`,
                boxShadow: `0 0 16px color-mix(in srgb, ${colorChoice} 27%, transparent)`,
                transition: 'height 1.2s ease-out',
                borderRadius: '1px 1px 0 0',
              }}
            />
          );
        })}
      </div>

      {/* Top tag */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginBottom: 40,
          animation: 'bc-fade-up 900ms 100ms both',
        }}
      >
        <div className="bc-eyebrow" style={{ color: 'var(--bc-gold)', wordSpacing: '0.3em' }}>
          DISTRIBUTED CAUSALITY
        </div>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 1, animation: 'bc-fade-up 1100ms 250ms both' }}>
        <h1 className="bc-display bc-hero-title">
          The Bloom
          <br />
          <span className="bc-italic" style={{ color: 'var(--bc-gold)' }}>
            Clock
          </span>
        </h1>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 36,
          animation: 'bc-fade-up 1100ms 500ms both',
        }}
      >
        <p
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(20px, 2.6vw, 30px)',
            color: 'var(--bc-ink-dim)',
            maxWidth: 720,
            lineHeight: 1.35,
            margin: 0,
            fontWeight: 400,
          }}
        >
          A constant-size structure for telling time across machines that may never agree on it.
        </p>
      </div>

      {/* Bottom row */}
      <div
        className="bc-hero-row"
        style={{
          position: 'relative',
          zIndex: 1,
          animation: 'bc-fade-up 1100ms 750ms both',
        }}
      >
        <div>
          <div className="bc-eyebrow" style={{ marginBottom: 6, fontSize: 10 }}>
            Asks
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: 'var(--bc-ink)' }}>
            did <span style={{ color: 'var(--bc-gold)' }}>A</span> happen before{' '}
            <span style={{ color: 'var(--bc-gold)' }}>B</span>?
          </div>
        </div>
        <div>
          <div className="bc-eyebrow" style={{ marginBottom: 6, fontSize: 10 }}>
            Answers
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: 'var(--bc-ink)' }}>
            <span style={{ color: 'var(--bc-violet)' }}>probably</span> ·{' '}
            <span style={{ color: 'var(--bc-emerald)' }}>certainly not</span>
          </div>
        </div>
        <div>
          <div className="bc-eyebrow" style={{ marginBottom: 6, fontSize: 10 }}>
            Costs
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: 'var(--bc-ink)' }}>
            fixed bits, regardless of cluster size
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bc-pulse 2.2s infinite ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 1,
        }}
      >
        <div
          className="bc-mono"
          style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--bc-ink-faint)' }}
        >
          BEGIN
        </div>
        <ChevronDown size={16} style={{ color: 'var(--bc-ink-faint)' }} />
      </div>
    </section>
  );
};
