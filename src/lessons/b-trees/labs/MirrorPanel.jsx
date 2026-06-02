import { Database, Layers } from 'lucide-react';

// §VII — the tradeoff mirror. B-tree (read-optimized) beside its write-optimized
// reflection, the LSM tree. A static comparison panel, no interaction.
export default function MirrorPanel() {
  const Side = ({ icon: Icon, tone, name, tag, rows }) => (
    <div className="bt-card" style={{ padding: '18px 18px 16px', borderTop: `3px solid ${tone}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <Icon size={20} style={{ color: tone }} />
        <div>
          <div className="bt-display" style={{ fontWeight: 600, fontSize: 18, lineHeight: 1 }}>
            {name}
          </div>
          <div
            className="bt-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: tone,
              marginTop: 3,
            }}
          >
            {tag}
          </div>
        </div>
      </div>
      {rows.map(([a, b], i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 8,
            padding: '6px 0',
            borderTop: i ? '1px solid var(--rule)' : 'none',
            fontSize: 13.5,
          }}
        >
          <span className="bt-mono" style={{ color: 'var(--ink-3)', minWidth: 64, fontSize: 11 }}>
            {a}
          </span>
          <span style={{ color: 'var(--ink)' }}>{b}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div
      className="bt-grid-2"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}
    >
      <Side
        icon={Database}
        tone="var(--blue)"
        name="B-tree"
        tag="read-optimized"
        rows={[
          [
            'reads',
            'Three or four seeks, always. The flat shape is unbeatable for point and range lookups.',
          ],
          [
            'writes',
            'In-place: split a full leaf and you rewrite scattered pages all the way up the spine. Random-write amplification.',
          ],
          ['lives in', 'Postgres, MySQL/InnoDB, SQLite, most filesystems.'],
        ]}
      />
      <Side
        icon={Layers}
        tone="var(--stamp)"
        name="LSM tree"
        tag="write-optimized"
        rows={[
          ['writes', 'Append to an in-memory buffer, flush sequentially. No random writes at all.'],
          [
            'reads',
            'May probe several sorted runs: read amplification, softened by Bloom filters.',
          ],
          ['lives in', 'RocksDB, Cassandra, LevelDB, ScyllaDB.'],
        ]}
      />
    </div>
  );
}
