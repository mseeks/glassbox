// Lesson-local visual helpers: the fixed SVG palette + a pointer→scope-space
// converter. These touch DOM/SVG and so live alongside the components rather
// than in the pure engine.

// Scope palette routed through CSS custom properties so every mark drawn into
// the sonar SVG FLIPS with the theme (dark abyssal screen ↔ pale daylight
// instrument face; see the --vp-svg-* tokens in vp-tree.css). var() is
// unreliable as a bare SVG presentation *attribute*, so consumers apply these
// via the `style` prop (style-based fill/stroke is reliable, as in TreeDiagram).
export const C = {
  ping: 'var(--vp-svg-ping)',
  pingDim: 'var(--vp-svg-ping-dim)',
  amber: 'var(--vp-svg-amber)',
  coral: 'var(--vp-svg-coral)',
  coralDim: 'var(--vp-svg-coral-dim)',
  bone: 'var(--vp-svg-bone)',
  bone2: 'var(--vp-svg-bone-2)',
  bone3: 'var(--vp-svg-bone-3)',
  grid: 'var(--vp-scope-grid)',
  contact: 'var(--vp-svg-contact)',
  hairline: 'var(--vp-svg-hairline)',
  ringIdle: 'var(--vp-svg-ring-idle)',
  tauFill: 'var(--vp-svg-tau-fill)',
};

export function clientToScope(e, el) {
  const r = el.getBoundingClientRect();
  let x = ((e.clientX - r.left) / r.width) * 100;
  let y = ((e.clientY - r.top) / r.height) * 100;
  x = Math.max(4, Math.min(96, x));
  y = Math.max(4, Math.min(96, y));
  return { x, y };
}
