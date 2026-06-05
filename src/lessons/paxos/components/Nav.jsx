// The section navigation: a fixed left rail on wide screens, a sticky
// horizontal scroller on narrow ones. Active section + smooth-scroll are driven
// by the shared useScrollSpy / scrollToId in the composition root. Each button's
// visible label is its accessible name, so the rail needs no extra ARIA.
export const NAV = [
  { id: 'problem', n: 'I', t: 'The problem' },
  { id: 'witness', n: 'II', t: 'The witness' },
  { id: 'phases', n: 'III', t: 'Two phases' },
  { id: 'binding', n: 'IV', t: 'The binding rule' },
  { id: 'liveness', n: 'V', t: 'Liveness & limits' },
  { id: 'log', n: 'VI', t: 'From decree to law' },
  { id: 'compare', n: 'VII', t: 'Paxos vs Raft' },
  { id: 'coda', n: 'VIII', t: 'The one idea' },
];

export default function Nav({ active, onJump }) {
  return (
    <nav className="pax-nav" aria-label="sections">
      {NAV.map((s) => (
        <button
          key={s.id}
          className={`pax-nav-item ${active === s.id ? 'on' : ''}`}
          aria-current={active === s.id ? 'true' : undefined}
          onClick={() => onJump(s.id)}
        >
          <span className="num">{s.n}</span>
          <span className="bar" />
          {s.t}
        </button>
      ))}
    </nav>
  );
}
