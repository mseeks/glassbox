import { useEffect, useRef, useState } from 'react';

// Tracks whether the referenced element is in (or near) the viewport so that
// always-on animation loops can pause when scrolled off-screen — saving CPU and
// battery for the long, multi-chapter lessons. `rootMargin` resumes motion a
// little before the element actually scrolls into view.
//
// Defaults to `true` (and stays true without IntersectionObserver / during SSR)
// so loops run immediately and never get stuck paused.
export function useInViewport({ rootMargin = '200px' } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const ob = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin,
    });
    ob.observe(el);
    return () => ob.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}
