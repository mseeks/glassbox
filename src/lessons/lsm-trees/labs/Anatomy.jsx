// §III's three-part diagram: memtable (in memory) · WAL (on disk, append) ·
// SSTable (on disk, immutable). Static; the WriteLab below it shows the flow.
export default function Anatomy() {
  const parts = [
    {
      k: 'memtable',
      where: 'in memory',
      d: 'A small sorted structure — a skip-list — that catches every write. This is the surface of the core, where new sediment lands and is kept in order. Fast, and volatile: it vanishes on crash.',
    },
    {
      k: 'write-ahead log',
      where: 'on disk',
      d: 'The memtable’s insurance. Every write is appended here, sequentially, before it is acknowledged. If the process dies, the log replays into a fresh memtable and nothing is lost.',
    },
    {
      k: 'sstable',
      where: 'on disk',
      d: 'When the memtable fills, it is frozen and written out as one immutable Sorted-String Table — a finished stratum. From that instant it is read-only forever. Compaction may merge it into a new file, but never edits it.',
    },
  ];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
        gap: 0,
        border: '1px solid var(--edge)',
      }}
    >
      {parts.map((p, i) => (
        <div
          key={p.k}
          className="anat-cell"
          style={{ padding: '20px', borderRight: i < 2 ? '1px solid var(--rule-soft)' : 'none' }}
        >
          <div className="tiny" style={{ color: 'var(--instr)' }}>
            {p.where}
          </div>
          <div className="d" style={{ fontSize: 21, fontWeight: 700, margin: '4px 0 12px' }}>
            {p.k}
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{p.d}</div>
        </div>
      ))}
    </div>
  );
}
