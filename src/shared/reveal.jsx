import { useEffect, useRef, useState } from 'react';

// Reveal-on-scroll primitives shared across lessons. Two shapes, one behaviour:
// an element starts hidden (its base class sets opacity/transform in the
// lesson's CSS) and gains the `in` class the first time it scrolls into view.
// The shell's global reduced-motion CSS already removes the transition, so
// under reduced motion content simply appears without animating.

const DEFAULT_THRESHOLD = 0.12;

// Root-scoped: attach the returned ref to a container; every descendant
// matching `selector` gains `inClass` on first intersection. Mirrors the old
// per-lesson useReveal hooks (sha used `.reveal`, memory used `.rev`).
export function useRevealRoot({
  selector = '.reveal',
  inClass = 'in',
  threshold = DEFAULT_THRESHOLD,
} = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(selector);
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add(inClass));
      return;
    }
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(inClass);
            ob.unobserve(e.target);
          }
        });
      },
      { threshold },
    );
    els.forEach((el) => ob.observe(el));
    return () => ob.disconnect();
  }, [selector, inClass, threshold]);
  return ref;
}

// Self-scoped: returns [ref, shown]; the element reveals itself once in view.
// SSR/no-IO safe — falls back to shown immediately.
function useReveal({ threshold = DEFAULT_THRESHOLD } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          ob.disconnect();
        }
      },
      { threshold },
    );
    ob.observe(ref.current);
    return () => ob.disconnect();
  }, [threshold]);
  return [ref, shown];
}

// Wrapper component over useReveal. `base` is the lesson's reveal class
// (e.g. 'reveal' or 'mk-reveal'); `as` keeps semantic tags; `delay` staggers
// entrances via transition-delay.
export function Reveal({
  children,
  className = '',
  as: Tag = 'div',
  base = 'reveal',
  delay = 0,
  threshold,
  style,
}) {
  const [ref, shown] = useReveal({ threshold });
  return (
    <Tag
      ref={ref}
      className={`${base} ${shown ? 'in' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </Tag>
  );
}
