import { useState, useEffect } from 'react';

import { scrollToId } from '../../../shared/useScrollSpy.js';

/* ───────────────────────────────────────────────────────────────────────
   NAVIGATION — sticky nav with section anchors
   ─────────────────────────────────────────────────────────────────────── */

export const Navigation = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-nav]');
      let current = '';
      sections.forEach((s) => {
        const rect = s.getBoundingClientRect();
        if (rect.top < 120 && rect.bottom > 120) {
          current = s.getAttribute('data-nav');
        }
      });
      setActive(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const items = [
    { id: 'hero', label: 'Top' },
    { id: 's1', label: '§1 Substrate' },
    { id: 's2', label: '§2 Philosophies' },
    { id: 's3', label: '§3 Header' },
    { id: 's4', label: '§4 Properties' },
    { id: 's5', label: '§5 Send Lab' },
    { id: 's6', label: '§6 HoL Blocking' },
    { id: 's7', label: '§7 Decision' },
    { id: 's8', label: '§8 In the wild' },
    { id: 's9', label: '§9 MTU' },
    { id: 's10', label: '§10 QUIC' },
    { id: 's11', label: '§11 Pitfalls' },
    { id: 'coda', label: 'Coda' },
  ];

  const scrollTo = (id) => {
    scrollToId(id);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 100,
          background: open ? 'var(--signal)' : 'var(--surface-2)',
          color: open ? 'var(--udp-on-accent)' : 'var(--ink)',
          border: `1px solid ${open ? 'var(--signal)' : 'var(--line-bright)'}`,
          padding: '10px 14px',
          borderRadius: 4,
          fontFamily: 'JetBrains Mono',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.18s',
          boxShadow: 'var(--udp-nav-shadow)',
        }}
      >
        {open ? 'Close' : '☰ Nav'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: 60,
            right: 18,
            zIndex: 99,
            background: 'var(--udp-nav-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--line-bright)',
            borderRadius: 4,
            padding: 10,
            width: 220,
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
            animation: 'udp-fade-in 0.2s ease both',
          }}
        >
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => scrollTo(it.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                background: active === it.id ? 'var(--signal-soft)' : 'transparent',
                color: active === it.id ? 'var(--signal)' : 'var(--ink)',
                border: 'none',
                borderRadius: 3,
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.12s',
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (active !== it.id) e.currentTarget.style.background = 'var(--surface-2)';
              }}
              onMouseLeave={(e) => {
                if (active !== it.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};
