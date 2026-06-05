// The section registry + the desktop side index (a fixed right rail of Roman
// numerals + dots). Active section is driven by the shared useScrollSpy in the
// composition root; clicking a dot smooth-scrolls via the shared scrollToId.
// Each rail link gets an aria-label since its visible content is decorative.
export const NAV = [
  { id: 'brief', roman: 'I', t: 'The brief' },
  { id: 'slab', roman: 'II', t: 'The false start' },
  { id: 'lookup', roman: 'III', t: 'The fix' },
  { id: 'anatomy', roman: 'IV', t: 'The layout' },
  { id: 'compress', roman: 'V', t: 'Compression' },
  { id: 'bloom', roman: 'VI', t: 'The bloom filter' },
  { id: 'merge', roman: 'VII', t: 'Compaction' },
  { id: 'gifts', roman: 'VIII', t: 'The payoff' },
  { id: 'marriage', roman: 'IX', t: 'The synthesis' },
  { id: 'family', roman: 'X', t: 'The field' },
];

export default function Nav({ active, onJump }) {
  return (
    <nav className="sst-railnav" aria-label="Sections">
      {NAV.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={active === s.id ? 'on' : ''}
          aria-label={`${s.roman} · ${s.t}`}
          aria-current={active === s.id ? 'true' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onJump(s.id);
          }}
        >
          <span className="rn-roman">{s.roman}</span>
          <span className="rn-dot" />
        </a>
      ))}
    </nav>
  );
}
