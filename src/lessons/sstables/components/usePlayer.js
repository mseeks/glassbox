import { useCallback, useEffect, useState } from 'react';

// A timed step-player for the labs. `i` walks 0…total; play() runs a timer that
// advances one step every `speed` ms, step() nudges one step by hand, reset()
// returns to the start. Play is always user-initiated (a button they press), so
// under reduced motion the loop is allowed to run — the labs simply hide the
// Play control and let Step/Reset drive instead. When `reduced` is set the timer
// collapses to ~1ms so an explicitly-requested run resolves instantly rather
// than animating.
//
// The controls are useCallback-stable so the labs can list `reset` in the
// dependency array of their "restart when the input changes" effect without a
// lint suppression.
export function usePlayer(total, { speed = 720, reduced = false } = {}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (i >= total) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => Math.min(total, x + 1)), reduced ? 1 : speed);
    return () => clearTimeout(t);
  }, [playing, i, total, speed, reduced]);
  const play = useCallback(() => {
    setI((x) => (x >= total ? 0 : x));
    setPlaying(true);
  }, [total]);
  const pause = useCallback(() => setPlaying(false), []);
  const step = useCallback(() => {
    setPlaying(false);
    setI((x) => Math.min(total, x + 1));
  }, [total]);
  const reset = useCallback(() => {
    setPlaying(false);
    setI(0);
  }, []);
  return { i, setI, playing, play, pause, step, reset };
}
