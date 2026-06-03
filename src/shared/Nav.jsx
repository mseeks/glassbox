import { useEffect, useId, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { getLessonById, indexPage, pages } from '../lesson-catalog.js';
import './nav.css';

const navLabelFor = (page) => (page.id === indexPage.id ? 'Index' : page.label);

// The lesson switcher. On desktop it's the familiar wrapping pill bar; below
// 768px (driven entirely by nav.css) it collapses to a hamburger + the current
// lesson, toggling a dropdown of every lesson. The open/closed state only does
// anything on mobile — the list is always laid out inline on wide screens.
export default function Nav({ activePage, onSelect }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const menuId = useId();

  const activeAccent = getLessonById(activePage.id)?.accent;
  const currentLabel = navLabelFor(activePage);

  // While the mobile dropdown is open, close it on Escape or an outside tap.
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const handleSelect = (pageId) => {
    setOpen(false);
    onSelect(pageId);
  };

  return (
    <nav ref={navRef} className="lesson-nav" aria-label="Lesson navigation">
      <div className="lesson-nav__bar">
        <button
          type="button"
          className="lesson-nav__toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`Lessons menu — current lesson: ${currentLabel}`}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          <span className="lesson-nav__current">
            <span
              className="lesson-nav__dot"
              style={{ '--accent': activeAccent || 'var(--ink)' }}
              aria-hidden="true"
            />
            <span className="lesson-nav__current-label">{currentLabel}</span>
          </span>
        </button>
      </div>

      <ul id={menuId} className="lesson-nav__list" data-open={open}>
        {pages.map((page) => {
          const isActive = page.id === activePage.id;
          const accent = getLessonById(page.id)?.accent;

          return (
            <li key={page.id}>
              <button
                type="button"
                className="lesson-nav__link"
                aria-current={isActive ? 'page' : undefined}
                style={{ '--accent': accent || 'var(--ink)' }}
                onClick={() => handleSelect(page.id)}
              >
                {navLabelFor(page)}
              </button>
            </li>
          );
        })}
      </ul>

      {activeAccent && (
        <span
          aria-hidden="true"
          className="lesson-nav__underline"
          style={{
            background: `linear-gradient(90deg, transparent, ${activeAccent}, transparent)`,
          }}
        />
      )}
    </nav>
  );
}
