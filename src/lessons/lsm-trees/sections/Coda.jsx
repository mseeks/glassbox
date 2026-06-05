import Movement from '../components/Movement.jsx';
import Prose from '../components/Prose.jsx';

// Where the survey continues — three real strata to drill next, each one
// rooted in a chapter the reader just walked through. Colored with the
// lesson's own theme tokens (writes / instrument / compaction), so the
// light↔dark flip carries for free.
const NEXT = [
  [
    'var(--gold)',
    'Compaction strategies',
    '§VI named the RUM trade; the families that pick a point on it — leveled, size-tiered, and lazy-leveling (RocksDB, Dostoevsky) — are where the abstract surface becomes an engineering dial.',
  ],
  [
    'var(--instr)',
    'Range filters',
    "§IV's Bloom is blind to ranges. Succinct structures — SuRF, prefix Bloom, and the newer ribbon filters — answer “any key between these two?” without opening a stratum.",
  ],
  [
    'var(--writ)',
    'Write-optimized B-trees',
    'The Bε-tree and fractal tree buffer writes inside the nodes of a tree, reaching for LSM ingest speed while keeping a B-tree’s tidy read path.',
  ],
];

// Coda — stop fighting the arrow of time.
export default function Coda() {
  return (
    <Movement style={{ padding: '92px 0 76px', borderTop: '1px solid var(--rule-soft)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <div className="kicker" style={{ marginBottom: 14 }}>
          coda
        </div>
        <h2
          className="d"
          style={{
            fontSize: 'clamp(34px,6vw,60px)',
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            margin: '0 0 26px',
          }}
        >
          Stop fighting
          <br />
          the{' '}
          <span style={{ color: 'var(--writ)', textShadow: '0 0 34px var(--glow-writ)' }}>
            arrow of time.
          </span>
        </h2>
        <Prose style={{ margin: '0 auto', textAlign: 'left', maxWidth: 600 }}>
          <p>
            One rule carried us the whole way down.{' '}
            <em>Never overwrite; lay a newer layer on top; read the shallowest.</em> From it fell
            append-only writes that please the disk, a memtable and log to catch them, immutable
            strata to keep them, Bloom filters to spare the reader, compaction to settle old debts,
            and tombstones to mark the dead. Each one a consequence, not a separate invention.
          </p>
          <p>
            The same move, made elsewhere, becomes a write-ahead log, an event-sourced system, a
            version-control history, a replicated state machine. The log-structured merge-tree is
            the storage-engine member of that family, and perhaps the clearest. It works because
            time is the one ordering a disk truly keeps. Every structure that fights that loses. The
            LSM tree is what you get when you stop.
          </p>
        </Prose>

        <div className="kicker" style={{ marginTop: 46, marginBottom: 16 }}>
          where to drill next
        </div>
        <div
          style={{
            maxWidth: 600,
            margin: '0 auto',
            textAlign: 'left',
            display: 'grid',
            gap: 16,
          }}
        >
          {NEXT.map(([accent, title, body]) => (
            <div key={title}>
              <span
                className="d"
                style={{ color: accent, fontWeight: 700, fontSize: 15.5, letterSpacing: '-0.01em' }}
              >
                {title}
              </span>
              <span className="serif" style={{ color: 'var(--ink-2)', fontSize: 15 }}>
                {' — '}
                {body}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 50, color: 'var(--instr)', fontSize: 22 }}>⊕</div>
        <div
          className="serif"
          style={{ fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)', marginTop: 12 }}
        >
          a field manual in seven movements
        </div>
      </div>
    </Movement>
  );
}
