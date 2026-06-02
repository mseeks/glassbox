// Sticky chapter nav with horizontal scroll on mobile. CHAPTERS is the
// authoritative ordering used by both the nav and the section IDs.
const CHAPTERS = [
  ['unit', 'The bit'],
  ['ingenuity', 'The squeeze'],
  ['explosion', 'The explosion'],
  ['ocean', 'The ocean'],
  ['why', 'Why'],
];

export default function ChapterNav() {
  return (
    <nav className="cnav">
      <div className="cnav-in">
        <span className="cnav-mark">◉</span>
        {CHAPTERS.map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
