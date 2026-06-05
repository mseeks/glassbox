// The lesson navigation: a sticky top bar (brand + current plate) and a fixed
// right-hand rail of dots on wide screens. The active section + smooth-scroll
// are driven by the shared useScrollSpy / scrollToId in the composition root.
// Each rail dot is icon-only, so it carries an aria-label (its plate name).
export const NAV = [
  { id: 'p0', num: '00', label: 'Overview' },
  { id: 'p1', num: '01', label: 'The problem' },
  { id: 'p2', num: '02', label: 'The idea' },
  { id: 'p3', num: '03', label: 'The shape' },
  { id: 'p4', num: '04', label: 'The rule' },
  { id: 'p5', num: '05', label: 'The secret' },
  { id: 'p6', num: '06', label: 'The catch' },
  { id: 'p7', num: '07', label: 'Rebalancing' },
  { id: 'p8', num: '08', label: 'Heaps' },
  { id: 'p9', num: '09', label: 'Coda' },
];

export default function Nav({ active, progress, onJump }) {
  const cur = NAV.find((s) => s.id === active) || NAV[0];
  return (
    <>
      <div className="bst-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
      <div className="bst-bar">
        <div className="bst-bar-in">
          <button className="bst-brand" onClick={() => onJump(NAV[0].id)}>
            BINARY<b>·</b>TREES
          </button>
          <div className="bst-now">
            <span className="n">{cur.num}</span>
            &nbsp;·&nbsp;{cur.label}
          </div>
        </div>
      </div>
      <nav className="bst-rail" aria-label="sections">
        {NAV.map((s) => (
          <button
            key={s.id}
            className={s.id === active ? 'on' : ''}
            aria-current={s.id === active ? 'true' : undefined}
            onClick={() => onJump(s.id)}
            aria-label={`${s.num} · ${s.label}`}
          >
            <span className="tip" aria-hidden="true">
              {s.num} · {s.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}
