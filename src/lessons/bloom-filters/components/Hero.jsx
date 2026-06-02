import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePrefersReducedMotion } from '../../../shared/usePrefersReducedMotion.js';
import { useInViewport } from '../../../shared/useInViewport.js';

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const [vpRef, inView] = useInViewport();
  const [bits, setBits] = useState(() =>
    Array(240)
      .fill(0)
      .map(() => (Math.random() > 0.85 ? 1 : 0)),
  );

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => {
      setBits((prev) => {
        const next = [...prev];
        for (let i = 0; i < 3; i++) {
          const idx = Math.floor(Math.random() * next.length);
          next[idx] = next[idx] ? 0 : 1;
        }
        return next;
      });
    }, 700);
    return () => clearInterval(id);
  }, [reduced, inView]);

  return (
    <section ref={vpRef} className="relative overflow-hidden" style={{ minHeight: '92vh' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(24, 1fr)',
            gap: '4px',
            padding: '4rem 2rem',
            height: '100%',
            width: '100%',
            gridAutoRows: '1fr',
          }}
        >
          {bits.map((b, i) => (
            <div
              key={i}
              style={{
                background: b ? '#c4b5fd' : 'rgba(232, 222, 200, 0.05)',
                borderRadius: '1px',
                transition: 'background 900ms ease',
                boxShadow: b ? '0 0 6px rgba(196, 181, 253, 0.4)' : 'none',
                minHeight: 0,
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="relative z-10 max-w-6xl mx-auto px-6 md:px-12"
        style={{ paddingTop: '14vh', paddingBottom: '8vh' }}
      >
        <div className="bf-fade-up" style={{ animationDelay: '0.1s' }}>
          <div
            className="bf-ui"
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.32em',
              color: 'rgba(196, 181, 253, 0.75)',
              textTransform: 'uppercase',
            }}
          >
            Burton H. Bloom · 1970
          </div>
        </div>

        <h1
          className="bf-display bf-fade-up mt-8"
          style={{
            fontSize: 'clamp(3rem, 11vw, 8.5rem)',
            lineHeight: 0.95,
            fontWeight: 300,
            animationDelay: '0.25s',
          }}
        >
          Bloom
          <br />
          <span className="bf-display-italic" style={{ fontWeight: 300, color: '#c4b5fd' }}>
            Filters.
          </span>
        </h1>

        <div className="bf-fade-up mt-10 max-w-3xl" style={{ animationDelay: '0.45s' }}>
          <p
            className="bf-body"
            style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', lineHeight: 1.55, color: '#d4c5a0' }}
          >
            Ten bits to know if anything belongs. A complete tour of the data structure that traded
            certainty for memory, and changed how big systems answer the oldest question in
            computing:
            <span className="bf-display-italic bf-mark-amber"> have I seen this before?</span>
          </p>
        </div>

        <div
          className="bf-fade-up mt-16 flex items-center gap-8 flex-wrap"
          style={{ animationDelay: '0.7s' }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '12px',
                height: '12px',
                background: '#c4b5fd',
                borderRadius: '1px',
                boxShadow: '0 0 8px rgba(196, 181, 253, 0.5)',
              }}
            />
            <span className="bf-ui bf-mark-muted" style={{ fontSize: '0.85rem' }}>
              set
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '12px',
                height: '12px',
                background: 'rgba(232, 222, 200, 0.1)',
                border: '1px solid rgba(232, 222, 200, 0.15)',
                borderRadius: '1px',
              }}
            />
            <span className="bf-ui bf-mark-muted" style={{ fontSize: '0.85rem' }}>
              unset
            </span>
          </div>
          <div className="bf-mono bf-mark-muted" style={{ fontSize: '0.78rem' }}>
            10 chapters · 7 interactive labs
          </div>
        </div>

        <div className="bf-fade-up mt-20" style={{ animationDelay: '1s' }}>
          <ChevronDown style={{ width: 24, height: 24, color: 'rgba(232, 222, 200, 0.4)' }} />
        </div>
      </div>
    </section>
  );
}
