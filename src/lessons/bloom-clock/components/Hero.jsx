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
          const colorChoice = i % 17 === 0 ? '#b794f4' : i % 23 === 0 ? '#6ee7b7' : '#f5b942';
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h * 60}%`,
                background: `linear-gradient(180deg, ${colorChoice}cc 0%, ${colorChoice}22 100%)`,
                boxShadow: `0 0 16px ${colorChoice}44`,
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
        <div className="bc-eyebrow" style={{ color: '#f5b942', wordSpacing: '0.3em' }}>
          DISTRIBUTED CAUSALITY
        </div>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 1, animation: 'bc-fade-up 1100ms 250ms both' }}>
        <h1 className="bc-display bc-hero-title">
          The Bloom
          <br />
          <span className="bc-italic" style={{ color: '#f5b942' }}>
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
            color: '#c8bfa5',
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
          <div className="bc-italic" style={{ fontSize: 22, color: '#f0e8d2' }}>
            did <span style={{ color: '#f5b942' }}>A</span> happen before{' '}
            <span style={{ color: '#f5b942' }}>B</span>?
          </div>
        </div>
        <div>
          <div className="bc-eyebrow" style={{ marginBottom: 6, fontSize: 10 }}>
            Answers
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: '#f0e8d2' }}>
            <span style={{ color: '#b794f4' }}>probably</span> ·{' '}
            <span style={{ color: '#6ee7b7' }}>certainly not</span>
          </div>
        </div>
        <div>
          <div className="bc-eyebrow" style={{ marginBottom: 6, fontSize: 10 }}>
            Costs
          </div>
          <div className="bc-italic" style={{ fontSize: 22, color: '#f0e8d2' }}>
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
          style={{ fontSize: 10, letterSpacing: '0.25em', color: '#5e5747' }}
        >
          BEGIN
        </div>
        <ChevronDown size={16} color="#5e5747" />
      </div>
    </section>
  );
};
