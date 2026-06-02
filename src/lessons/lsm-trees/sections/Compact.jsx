import Movement from '../components/Movement.jsx';
import Heading from '../components/Heading.jsx';
import Prose from '../components/Prose.jsx';
import CompactLab from '../labs/CompactLab.jsx';

// §V — Paying the debt. Compaction, with real accounting.
export default function Compact() {
  return (
    <Movement id="compact">
      <Heading
        n="V"
        kicker="paying the debt"
        title="Compaction"
        lede="A pile that only grows becomes a swamp. Compaction is the background labour that drains it: open several strata, merge them in key order keeping only the newest value per key, write one cleaner stratum, discard the rest. How eagerly you do this is the deepest decision in the whole design."
      />
      <Prose style={{ marginBottom: 26 }} dropcap>
        <p>
          Compaction is just §I applied ahead of time. A read resolves "newest wins" on the fly.
          Compaction resolves it permanently. It merges overlapping strata, drops superseded values,
          and retires tombstones once no older copy of their key survives beneath them. The
          graveyard is continually dug up and reburied in better order.
        </p>
        <p>
          Two schools dominate. They sit at opposite ends of one axis. <strong>Size-tiered</strong>
          merges files of similar size, letting many accumulate before a sudden collapse: cheap to
          write, costly to read. <strong>Leveled</strong> keeps each level a single non-overlapping
          sorted run, rewriting neighbours on overflow: cheap to read, costly to write. Run them
          side by side. Let the counters tell the truth.
        </p>
      </Prose>
      <CompactLab />
      <div
        style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        className="g2"
      >
        <div className="fig-soft">
          <div className="d" style={{ fontSize: 16, fontWeight: 700, marginBottom: 5 }}>
            size-tiered
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            <strong>Write-cheap, read-costly.</strong> A key is rewritten only a handful of times.
            But overlapping files at a level mean a lookup may open several. Cassandra's historical
            default, still apt for write-heavy work.
          </div>
        </div>
        <div className="fig-soft">
          <div className="d" style={{ fontSize: 16, fontWeight: 700, marginBottom: 5 }}>
            leveled
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            <strong>Read-cheap, write-costly.</strong> Each level adds at most one file to a lookup,
            so read-amp is bounded by the level count. The catch: a key may be rewritten 20× or more
            as it sinks. The LevelDB / RocksDB default.
          </div>
        </div>
      </div>
    </Movement>
  );
}
