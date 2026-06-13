import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  defaultPageId,
  getLessonById,
  getPageIdFromUrl,
  indexPage,
  pages,
} from './lesson-catalog.js';
import Nav from './shared/Nav.jsx';
import { NavContext } from './shared/NavContext.js';
import './shared/tokens.css';
import './shared/utilities.css';

// Lazy-load the landing index (and its Glyph) so it ships in its own chunk
// rather than the shared entry bundle, which the index page would otherwise
// dominate. It renders inside the same <Suspense> as the lazy lessons.
const IndexPage = lazy(() => import('./index-page/IndexPage.jsx'));

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
      <Nav activePage={activePage} onSelect={selectPage} />
      <main
        ref={mainRef}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="false"
        aria-label={activePage.title}
        style={{ outline: 'none', '--lesson-link-color': activeAccent || undefined }}
      >
        <NavContext.Provider value={selectPage}>
          <Suspense fallback={<LessonLoading accent={activeAccent} />}>
            <ActivePage onSelectLesson={selectPage} />
          </Suspense>
        </NavContext.Provider>
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
