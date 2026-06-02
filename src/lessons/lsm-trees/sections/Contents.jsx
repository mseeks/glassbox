import Movement from '../components/Movement.jsx';

// The survey — the table of contents, used to anchor-link into each chapter.
const ITEMS = [
  ['I', 'The One Idea', 'newest wins; reads drill down', 'one'],
  ['II', 'Why Bother', 'the disk has a grain', 'why'],
  ['III', 'The Machine', 'memtable · log · sstable', 'machine'],
  ['IV', 'The Cost of Never Erasing', 'reads, and the bloom gatekeeper', 'read'],
  ['V', 'Paying the Debt', 'compaction', 'compact'],
  ['VI', 'The Trade You Cannot Escape', 'read · update · memory', 'rum'],
  ['VII', 'The Weight of the Dead', 'tombstones', 'tomb'],
];

export default function Contents() {
  return (
    <Movement id="contents" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <span className="kicker">the survey</span>
        <span style={{ flex: 1, height: 1, background: 'var(--rule-soft)' }} />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))',
          gap: 0,
          borderTop: '1px solid var(--rule-soft)',
        }}
      >
        {ITEMS.map(([n, t, s, id]) => (
          <a
            key={id}
            href={`#${id}`}
            className="toc-row"
            style={{
              padding: '16px 16px 16px 0',
              borderBottom: '1px solid var(--rule)',
              textDecoration: 'none',
              display: 'flex',
              gap: 12,
              alignItems: 'baseline',
              color: 'var(--ink)',
              transition: 'background 0.16s, padding 0.16s',
            }}
          >
            <span
              className="m"
              style={{ fontSize: 12, color: 'var(--instr)', minWidth: 22, fontWeight: 600 }}
            >
              {n}
            </span>
            <span>
              <span className="d" style={{ fontSize: 16, fontWeight: 700, display: 'block' }}>
                {t}
              </span>
              <span
                className="serif"
                style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--ink-3)' }}
              >
                {s}
              </span>
            </span>
          </a>
        ))}
      </div>
    </Movement>
  );
}
