import { useEffect, useRef } from 'react';

// A self-correcting setInterval hook: ticks `cb` every `delay` ms while `active`.
// `active` is always driven by a button the reader pressed (Play / Rounds), so
// this is user-initiated motion — it needs no reduced-motion gate. The latest
// callback is captured in a ref so the interval never holds a stale closure.
export function useInterval(cb, delay, active) {
  const saved = useRef(cb);
  useEffect(() => {
    saved.current = cb;
  });
  useEffect(() => {
    if (!active || delay == null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay, active]);
}
