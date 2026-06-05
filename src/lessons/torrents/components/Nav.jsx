import { useState } from 'react';
import { Menu, X } from 'lucide-react';

// The contents rail: a floating button that opens a right-hand sheet on every
// viewport (the source's responsive design). Active section + smooth scroll are
// driven by the shared useScrollSpy / scrollToId in the composition root. Each
// link carries its visible chapter title as its accessible name; the toggle
// button is icon-only, so it gets an explicit aria-label.
export const NAV = [
  { id: 'inversion', t: 'The inversion' },
  { id: 'naming', t: 'The name is the proof' },
  { id: 'swarm', t: 'Anatomy of a swarm' },
  { id: 'tracker', t: 'The matchmaker' },
  { id: 'dht', t: 'A directory with no center' },
  { id: 'nat', t: 'Reaching through walls' },
  { id: 'choke', t: 'An economy of strangers' },
  { id: 'rarest', t: 'Which piece next' },
  { id: 'v2', t: 'One hash, the whole tower' },
  { id: 'coda', t: 'The through-lines' },
];

export default function Nav({ active, onJump }) {
  const [open, setOpen] = useState(false);
  const go = (id) => {
    setOpen(false);
    onJump(id);
  };
  return (
    <>
      <button
        className="tor-navbtn"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close contents' : 'Open contents'}
        aria-expanded={open}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>
      <div
        className={'tor-navscrim' + (open ? ' tor-open' : '')}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <nav className={'tor-navpanel' + (open ? ' tor-open' : '')} aria-label="Contents">
        <div className="tor-kicker" style={{ marginBottom: 16 }}>
          Contents
        </div>
        {NAV.map((s, i) => (
          <button
            key={s.id}
            className={active === s.id ? 'tor-act' : ''}
            aria-current={active === s.id ? 'true' : undefined}
            onClick={() => go(s.id)}
          >
            <span className="tor-nn">{s.id === 'coda' ? '§' : String(i + 1).padStart(2, '0')}</span>
            <span>{s.t}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
