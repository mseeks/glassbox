import { useEffect, useState } from 'react';

// Reading-progress for the thin bar several lessons pin to the top of the page.
// Returns the document's vertical scroll position as a 0–100 percentage and
// re-reads on scroll (passive listener) + once on mount. Replaces the per-lesson
// copies in b-trees / hyperloglog / merkle-trees / sha.
//
// A progress bar re-rendering on scroll is cheap (one number, one style update);
// the lessons that previously poked a ref's width imperatively render identically
// from this value.
//
// SSR/no-document safe — returns 0 until a document exists.
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onScroll = () => {
      const el = document.scrollingElement || document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return progress;
}
