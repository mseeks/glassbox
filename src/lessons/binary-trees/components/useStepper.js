import { useCallback, useEffect, useRef, useState } from 'react';

// A stepped player shared by several labs: advances an index 0..len-1 on a
// timer, returning play / step / stop / reset controls plus an `atEnd` flag.
// Autoplay is user-initiated (a Play button), so it keeps the timer; the labs
// that autoplay-on-mount gate that mount effect with usePrefersReducedMotion.
export function useStepper(len, ms = 750) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const t = useRef(null);
  const stop = useCallback(() => {
    setPlaying(false);
    if (t.current) {
      clearTimeout(t.current);
      t.current = null;
    }
  }, []);
  const reset = useCallback(() => {
    stop();
    setI(0);
  }, [stop]);
  useEffect(() => {
    if (!playing) return;
    if (i >= len - 1) {
      setPlaying(false);
      return;
    }
    t.current = setTimeout(() => setI((v) => Math.min(v + 1, len - 1)), ms);
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [playing, i, len, ms]);
  useEffect(
    () => () => {
      if (t.current) clearTimeout(t.current);
    },
    [],
  );
  const play = useCallback(() => {
    if (i >= len - 1) setI(0);
    setPlaying(true);
  }, [i, len]);
  const step = useCallback(() => {
    stop();
    setI((v) => Math.min(v + 1, len - 1));
  }, [stop, len]);
  return { i, setI, playing, play, stop, step, reset, atEnd: i >= len - 1 };
}
