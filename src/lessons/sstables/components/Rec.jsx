import { TOMBSTONE } from '../engine/index.js';

// A small record cell — key on the left, value on the right — coloured by its
// semantic state in a lab (probed, hit, in the active block, kept, dead, …).
// A tombstone value renders as ∅.
export default function Rec({ k, v, state, title }) {
  const map = {
    idle: {},
    probe: { borderColor: 'var(--blood)', background: 'var(--blood-wash)', color: 'var(--ink)' },
    hit: { borderColor: 'var(--blood)', background: 'var(--blood)', color: 'var(--paper)' },
    block: { borderColor: 'var(--steel)', background: 'var(--steel-wash)' },
    kept: { borderColor: 'var(--sage)', background: 'var(--sage-wash)' },
    dead: {
      borderColor: 'var(--dead-2)',
      background: 'var(--recess-2)',
      color: 'var(--dead-2)',
      textDecoration: 'line-through',
    },
    shadow: { opacity: 0.4, textDecoration: 'line-through' },
  };
  return (
    <div className="sst-rec" style={map[state] || {}} title={title}>
      <span className="k">{k}</span>
      {v != null && <span className="v">{v === TOMBSTONE ? '∅' : v}</span>}
    </div>
  );
}
