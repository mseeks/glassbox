// Lesson-local visual helpers: the fixed SVG palette + a pointer→scope-space
// converter. These touch DOM/SVG and so live alongside the components rather
// than in the pure engine.

// fixed palette mirrored into SVG (var() is unreliable as an SVG attribute)
export const C = {
  ping: '#3fe0c6',
  pingBright: '#74f1dd',
  pingDim: 'rgba(63,224,198,0.5)',
  amber: '#ffb454',
  amberBright: '#ffc878',
  coral: '#ff6a72',
  coralDim: 'rgba(255,106,114,0.55)',
  bone: '#e8f1ed',
  bone2: '#a6bdb8',
  bone3: '#6e8a86',
  bone4: '#42605c',
  grid: 'rgba(63,224,198,0.11)',
  contact: '#5fb6ab',
};

export function clientToScope(e, el) {
  const r = el.getBoundingClientRect();
  let x = ((e.clientX - r.left) / r.width) * 100;
  let y = ((e.clientY - r.top) / r.height) * 100;
  x = Math.max(4, Math.min(96, x));
  y = Math.max(4, Math.min(96, y));
  return { x, y };
}
