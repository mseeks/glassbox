import Movement from '../components/Movement.jsx';
import Prose from '../components/Prose.jsx';

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
          <span style={{ color: 'var(--writ)', textShadow: '0 0 34px rgba(227,88,44,0.4)' }}>
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
        <div style={{ marginTop: 44, color: 'var(--instr)', fontSize: 22 }}>⊕</div>
        <div
          className="serif"
          style={{ fontStyle: 'italic', fontSize: 14, color: 'var(--ink-3)', marginTop: 12 }}
        >
          — a field manual in seven movements —
        </div>
      </div>
    </Movement>
  );
}
