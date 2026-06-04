import { useEffect, useState } from 'react';
import { Menu, X as XIcon } from 'lucide-react';
import { CHAPTERS } from './ChaptersData.js';
import { useScrollSpy, scrollToId } from '../../../shared/useScrollSpy.js';

const CHAPTER_IDS = CHAPTERS.map((ch) => ch.id);

export const Nav = () => {
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const active = useScrollSpy(CHAPTER_IDS, {
    rootMargin: '-35% 0px -65% 0px',
    initial: 'hero',
    syncHash: true,
  });

  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Lock body scroll when sheet open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close sheet on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const goTo = (id) => {
    scrollToId(id);
    setOpen(false);
  };

  return (
    <>
      {/* Top progress bar */}
      <div className="bc-nav-progress">
        <div className="bc-nav-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Desktop side rail */}
      <nav className="bc-side-nav" aria-label="Chapter navigation">
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => goTo(ch.id)}
            className="bc-nav-dot"
            data-active={active === ch.id}
            title={ch.label}
            aria-label={`Go to ${ch.label}`}
          >
            <span className="bc-nav-dot-inner" />
            <span className="bc-nav-dot-label">
              {ch.num !== '·' && ch.num !== '∎' ? (
                <span style={{ opacity: 0.5 }}>{ch.num}. </span>
              ) : null}
              {ch.short}
            </span>
          </button>
        ))}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="bc-nav-hamburger"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open chapter menu'}
        aria-expanded={open}
      >
        {open ? <XIcon size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile sheet */}
      {open && (
        <div className="bc-nav-overlay" onClick={() => setOpen(false)}>
          <div className="bc-nav-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bc-eyebrow" style={{ color: 'var(--bc-gold)', marginBottom: 4 }}>
              CHAPTERS
            </div>
            <div
              className="bc-italic"
              style={{ fontSize: 26, color: 'var(--bc-ink)', marginBottom: 20 }}
            >
              The Bloom Clock
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {CHAPTERS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => goTo(ch.id)}
                  className="bc-nav-sheet-item"
                  data-active={active === ch.id}
                >
                  <span
                    className="bc-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.15em',
                      color: 'var(--bc-ink-faint)',
                      marginRight: 12,
                      display: 'inline-block',
                      minWidth: 28,
                      textAlign: 'right',
                    }}
                  >
                    {ch.num}
                  </span>
                  {ch.label}
                </button>
              ))}
            </div>
            <div
              style={{
                marginTop: 32,
                paddingTop: 20,
                borderTop: '1px solid var(--bc-rule-soft)',
              }}
            >
              <div
                className="bc-mono"
                style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--bc-ink-faint)' }}
              >
                DISTRIBUTED CAUSALITY
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
