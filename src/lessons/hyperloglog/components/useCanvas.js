import { useEffect, useRef } from 'react';

// A device-pixel-ratio-aware <canvas> hook. Sizes the canvas to its parent's
// width (height from a data-aspect ratio), re-renders on resize via a
// ResizeObserver, and calls the latest `draw(ctx, w, h)` in CSS pixels.
export function useCanvas(draw, deps) {
  const ref = useRef(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const render = () => {
      const parent = cv.parentElement;
      const w = parent.clientWidth - 0;
      const dpr = window.devicePixelRatio || 1;
      const aspect = cv.dataset.aspect ? Number(cv.dataset.aspect) : 0.5;
      const h = Math.round(w * aspect);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRef.current(ctx, w, h);
    };
    render();
    const ro = new ResizeObserver(render);
    ro.observe(cv.parentElement);
    return () => ro.disconnect();
    // deps is a caller-provided array (a reusable hook), so it can't be statically checked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
