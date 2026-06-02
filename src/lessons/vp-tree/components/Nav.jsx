import { scrollToId } from '../../../shared/useScrollSpy.js';

// The seven chapters, in order. A module constant so the scroll-spy observer
// (which keys on this array) isn't rebuilt every render.
export const SECTIONS = [
  { id: 's1', rn: 'I', name: 'The Problem' },
  { id: 's2', rn: 'II', name: 'No Order' },
  { id: 's3', rn: 'III', name: 'The Idea' },
  { id: 's4', rn: 'IV', name: 'Triangle Rule' },
  { id: 's5', rn: 'V', name: 'The Search' },
  { id: 's6', rn: 'VI', name: 'The Curse' },
  { id: 's7', rn: 'VII', name: 'Onward' },
];

// Sticky chapter nav. Smooth-scrolls to a section (reduced-motion-aware via the
// shared scrollToId) and highlights the active one.
export default function Nav({ active }) {
  return (
    <nav className="vp-nav">
      <div className="vp-nav-inner">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={active === s.id ? 'on' : ''}
            onClick={() => scrollToId(s.id)}
          >
            <span className="rn">{s.rn}</span>
            {s.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
