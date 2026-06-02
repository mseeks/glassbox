import { Stamp } from 'lucide-react';
import { scrollToId } from '../../../shared/useScrollSpy.js';

// Sticky lesson navigation. The TOC is exported so the lesson root can use
// the same ordering for scroll-spy active-section detection.
export const TOC = [
  ['problem', 'Problem'],
  ['hash', 'Hash'],
  ['build', 'Build'],
  ['tamper', 'Tamper'],
  ['proof', 'Proof'],
  ['math', 'Math'],
  ['security', 'Security'],
  ['reconcile', 'Reconcile'],
  ['variants', 'Variants'],
  ['applications', 'Uses'],
  ['closing', 'End'],
];

export default function Nav({ progress, active }) {
  return (
    <div className="mk-nav">
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span
          className="mk-display"
          style={{
            fontSize: 16,
            color: 'var(--paper)',
            letterSpacing: '0.02em',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <Stamp size={15} style={{ color: 'var(--gold)' }} /> Merkle Trees
        </span>
        <div
          style={{ display: 'flex', gap: 14, overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }}
        >
          {TOC.map(([id, label]) => (
            <button
              key={id}
              className={`mk-toc-link ${active === id ? 'active' : ''}`}
              onClick={() => scrollToId(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mk-progress" style={{ width: `${progress}%` }} />
    </div>
  );
}
