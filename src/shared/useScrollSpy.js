import { useEffect, useRef, useState } from 'react';

// Tracks which section is in view for a table-of-contents / section nav.
// Observes the elements with the given ids and returns the id of the one
// currently in the reading band (rootMargin). Replaces the per-lesson
// IntersectionObserver copies in swim, bloom-filters, bloom-clock, merkle, udp.
//
// Pass a STABLE `ids` array (module constant or useMemo) so the observer is
// not torn down every render.
//
// With `syncHash: true` the hook also makes chapters deep-linkable: on mount it
// scrolls to the section named in the URL hash (the browser's native hash-scroll
// misses because lessons render lazily), and as the reader scrolls it reflects
// the active section into the hash via history.replaceState — shareable, no
// history spam, and it won't dirty a clean URL until the reader actually moves.
export function useScrollSpy(
  ids,
  { rootMargin = '-30% 0px -60% 0px', initial, syncHash = false } = {},
) {
  const hashId = () =>
    typeof window === 'undefined' ? '' : decodeURIComponent(window.location.hash.slice(1));

  const [activeId, setActiveId] = useState(() => {
    if (syncHash) {
      const h = hashId();
      if (ids.includes(h)) return h;
    }
    return initial ?? ids[0];
  });

  // Honor a deep link on mount: jump to the targeted section once it exists.
  // Use an INSTANT jump (not smooth) and re-correct after a beat — lessons mount
  // interactive charts and ambient figures that reflow the page after the first
  // paint, which would otherwise leave a smooth scroll landing short of target.
  useEffect(() => {
    if (!syncHash) return;
    const h = hashId();
    if (!h || !ids.includes(h)) return;
    const jump = () => {
      const el = document.getElementById(h);
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    };
    const t1 = setTimeout(jump, 100);
    const t2 = setTimeout(jump, 550);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // mount only — a one-shot deep-link jump
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin },
    );
    const observed = ids.map((id) => document.getElementById(id)).filter(Boolean);
    observed.forEach((el) => ob.observe(el));
    return () => ob.disconnect();
  }, [ids, rootMargin]);

  // Reflect the active section into the URL hash.
  const primed = useRef(false);
  useEffect(() => {
    if (!syncHash || typeof window === 'undefined' || !activeId) return;
    // Skip the very first run when the URL had no hash, so landing on a lesson
    // doesn't immediately append "#first-section" to a clean URL.
    if (!primed.current) {
      primed.current = true;
      if (!window.location.hash) return;
    }
    if (hashId() !== activeId) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#${activeId}`,
      );
    }
  }, [syncHash, activeId]);

  return activeId;
}

// Smooth-scroll to a section by id, honoring prefers-reduced-motion (jumps
// instantly when the user asks for less motion).
export function scrollToId(id, { block = 'start' } = {}) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  const reduce =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block });
}
