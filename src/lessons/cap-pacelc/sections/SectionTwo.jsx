import { SectionLabel } from '../components/SectionLabel.jsx';
import { ConsistencyMicro } from '../components/ConsistencyMicro.jsx';
import { AvailabilityMicro } from '../components/AvailabilityMicro.jsx';
import { PartitionMicro } from '../components/PartitionMicro.jsx';

export function SectionTwo() {
  return (
    <section className="section" id="s2">
      <SectionLabel num="2" label="The Letters, Sharpened" />
      <h2 className="h-section">
        Each word is <em>much</em> pickier than the slogan suggests.
      </h2>

      <p className="lede">
        The casual gloss, &ldquo;C means consistent, A means available, P means
        partition-tolerant,&rdquo; is technically wrong in a way that obscures the real content. The
        theorem only bites when each letter is defined with precision. Most arguments about CAP are
        arguments about which loose definition someone is using.
      </p>

      {/* — C — */}
      <div
        style={{
          marginTop: 36,
          padding: '28px 28px 32px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--emerald)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'Spectral, serif',
              fontWeight: 200,
              fontSize: 64,
              color: 'var(--emerald)',
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
            }}
          >
            C
          </span>
          <span
            style={{
              fontFamily: 'Spectral, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 24,
              color: 'var(--ink)',
            }}
          >
            is linearizability.
          </span>
        </div>
        <p style={{ marginTop: 14 }}>
          Not &ldquo;eventual,&rdquo; not &ldquo;serializable&rdquo; — <em>linearizable</em>. The
          simplest way to think about it: the system behaves <em>as if</em>
          there were only a single copy of the data and a single, fast queue of operations against
          it. Every operation appears to take effect atomically at some instant between the moment a
          client sent it and the moment the response came back. If a write completes before a read
          begins (in real wall-clock time), the read must observe that write. No exceptions, no
          &ldquo;maybe a few milliseconds late,&rdquo; no &ldquo;eventually it&rsquo;ll show
          up.&rdquo;
        </p>
        <p>
          This is dramatically stronger than what most systems offer. It is the consistency model of
          a single-threaded, single-machine database; extending it across replicas requires either a
          coordinator (a consensus algorithm like Raft) or a willingness to refuse service when one
          isn&rsquo;t available.
        </p>
        <ConsistencyMicro />
        <div className="figure-caption">
          <strong>Fig. 2.1</strong> A write commits, then a read begins. Linearizability requires
          the read to see the write.
        </div>
      </div>

      {/* — A — */}
      <div
        style={{
          marginTop: 28,
          padding: '28px 28px 32px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--cyan)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'Spectral, serif',
              fontWeight: 200,
              fontSize: 64,
              color: 'var(--cyan)',
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
            }}
          >
            A
          </span>
          <span
            style={{
              fontFamily: 'Spectral, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 24,
              color: 'var(--ink)',
            }}
          >
            is unconditional answer.
          </span>
        </div>
        <p style={{ marginTop: 14 }}>
          Every request to a non-failed node returns a non-error response in bounded time. Note what
          this excludes: returning &ldquo;try again later,&rdquo; returning a 503, blocking the
          client indefinitely, or routing the request to a node that can answer but won&rsquo;t. A
          node that is up and refusing to answer because it doesn&rsquo;t know whether its data is
          current is <em>not available</em> in CAP&rsquo;s sense.
        </p>
        <p>
          The bar is high on purpose. CAP&rsquo;s A is a worst-case guarantee. Many systems
          advertised as &ldquo;highly available&rdquo; would fail this strict definition. They
          recover quickly, but they do briefly refuse.
        </p>
        <AvailabilityMicro />
        <div className="figure-caption">
          <strong>Fig. 2.2</strong> Available: the node answers, full stop. Unavailable: it hangs,
          errors, or refuses — by any means.
        </div>
      </div>

      {/* — P — */}
      <div
        style={{
          marginTop: 28,
          padding: '28px 28px 32px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--coral)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8 }}>
          <span
            style={{
              fontFamily: 'Spectral, serif',
              fontWeight: 200,
              fontSize: 64,
              color: 'var(--coral)',
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
            }}
          >
            P
          </span>
          <span
            style={{
              fontFamily: 'Spectral, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 24,
              color: 'var(--ink)',
            }}
          >
            is what the universe does to you.
          </span>
        </div>
        <p style={{ marginTop: 14 }}>
          The network may arbitrarily drop or arbitrarily delay messages between any subset of
          nodes. <em>The system must continue to function.</em>P is not a feature you enable; it is
          a fact about the world your system is deployed into. Cables get cut. Switches fail.
          Garbage collection pauses look identical to partitions from the outside. The right way to
          read &ldquo;partition tolerance&rdquo; is therefore: &ldquo;capable of behaving sanely
          when the messages don&rsquo;t arrive.&rdquo;
        </p>
        <p>
          This is the letter the slogan misleads on most. &ldquo;Pick two and drop P&rdquo; suggests
          partitions are optional. They are not. The only system that genuinely doesn&rsquo;t have
          to handle partitions is a system on one machine, where there is no <em>between</em> to
          break.
        </p>
        <PartitionMicro />
        <div className="figure-caption">
          <strong>Fig. 2.3</strong> Two nodes, messages flowing, then a partition. P asks what the
          system does <em>during</em> the lower state.
        </div>
      </div>

      <p style={{ marginTop: 40 }}>
        With these three definitions in hand, sharper than they look, the theorem can be stated
        honestly: <strong>no distributed data system can simultaneously provide all three.</strong>{' '}
        What does the proof actually look like? It&rsquo;s about as short as the theorem is famous.
      </p>
    </section>
  );
}
