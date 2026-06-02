import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getInitial() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(QUERY).matches;
}

/**
 * Tracks the user's `prefers-reduced-motion: reduce` setting and re-renders on
 * change. Returns `true` when the user has asked for less motion.
 *
 * The shell already neutralizes CSS animations/transitions globally (see the
 * reduced-motion block in src/shared/utilities.css), but two kinds of motion
 * are invisible to that CSS rule and must be gated in JS:
 *
 *   1. JS-driven loops — requestAnimationFrame / setInterval that mutate state.
 *   2. SVG SMIL — <animate> / <animateTransform> elements.
 *
 * Convention: components with *always-on, autoplay-on-mount* motion (decorative
 * heroes, ambient micro-animations) consult this hook and skip the loop —
 * rendering a sensible static frame — when it returns true. Motion the user
 * explicitly starts (a play/step button they pressed) may keep animating.
 *
 * SSR-safe: returns false when there is no `window` / `matchMedia`.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(getInitial);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(QUERY);
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
