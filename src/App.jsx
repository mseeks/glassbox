import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  defaultPageId,
  getLessonById,
  getPageIdFromUrl,
  indexPage,
  pages,
} from './lesson-catalog.js';
import './shared/tokens.css';
import './shared/utilities.css';

// Lazy-load the landing index (and its Glyph) so it ships in its own chunk
// rather than the shared entry bundle, which the index page would otherwise
// dominate. It renders inside the same <Suspense> as the lazy lessons.
const IndexPage = lazy(() => import('./index-page/IndexPage.jsx'));

const navLabelFor = (page) => {
  if (page.id === indexPage.id) return 'Index';
  return page.label;
};

export default function App() {
  const [activePageId, setActivePageId] = useState(getPageIdFromUrl);
  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) || indexPage,
    [activePageId],
  );
  const ActivePage = activePage.id === indexPage.id ? IndexPage : activePage.Component;
  const mainRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    document.title = activePage.title;
  }, [activePage.title]);

  // After a user-initiated lesson change, move focus to the new content
  // region so screen-reader and keyboard users land on the right place.
  // Skip the very first mount to avoid stealing focus on page load.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (mainRef.current) {
      mainRef.current.focus({ preventScroll: true });
    }
  }, [activePageId]);

  const selectPage = (pageId) => {
    setActivePageId(pageId);

    const url = new URL(window.location.href);
    url.hash = '';
    if (pageId === defaultPageId) {
      url.searchParams.delete('lesson');
    } else {
      url.searchParams.set('lesson', pageId);
    }

    window.history.pushState(null, '', `${url.pathname}${url.search}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Honor browser back/forward — single source of truth is the URL.
  useEffect(() => {
    const onPop = () => setActivePageId(getPageIdFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const activeAccent = getLessonById(activePageId)?.accent;

  return (
    <div className="lesson-shell" style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <nav
        aria-label="Lesson navigation"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10000,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '10px 12px',
          background: 'rgba(10, 10, 15, 0.94)',
          borderBottom: '1px solid rgba(232, 222, 200, 0.12)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {pages.map((page) => {
          const isActive = page.id === activePage.id;
          const accent = getLessonById(page.id)?.accent;

          return (
            <button
              key={page.id}
              aria-current={isActive ? 'page' : undefined}
              type="button"
              onClick={() => selectPage(page.id)}
              style={{
                color: isActive ? 'var(--paper)' : 'var(--ink)',
                background: isActive ? accent || 'var(--ink)' : 'var(--rule-soft)',
                border: `1px solid ${isActive ? accent || 'var(--ink)' : 'var(--rule)'}`,
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.04em',
                padding: '7px 14px',
                textDecoration: 'none',
              }}
            >
              {navLabelFor(page)}
            </button>
          );
        })}
        {activeAccent && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: -1,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${activeAccent}, transparent)`,
              opacity: 0.7,
            }}
          />
        )}
      </nav>
      <main
        ref={mainRef}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="false"
        aria-label={activePage.title}
        style={{ outline: 'none' }}
      >
        <Suspense fallback={<LessonLoading accent={activeAccent} />}>
          <ActivePage onSelectLesson={selectPage} />
        </Suspense>
      </main>
    </div>
  );
}

function LessonLoading({ accent }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: accent || 'rgba(232, 222, 200, 0.5)',
      }}
    >
      Loading lesson…
    </div>
  );
}
