import { SectionLabel } from '../components/SectionLabel.jsx';
import { LatencyComparison } from '../labs/LatencyComparison.jsx';

export function SectionSeven() {
  return (
    <section className="section" id="s7">
      <SectionLabel num="7" label="Enter PACELC" />
      <h2 className="h-section">
        Even when the wire holds, every guarantee costs <em>time</em>.
      </h2>

      <p className="lede">
        CAP describes a forced choice during a network partition. Its silence about normal operation
        is suspicious. Partitions are rare; normal is the common case. What is the system doing
        then?
      </p>

      <p>
        The missing half was named by Daniel Abadi in 2010. <strong>PACELC</strong>: if Partition, A
        or C. That is the CAP question. <em>Else</em>, Latency or Consistency. That is the everyday
        question, and the ELC half is the part that actually shapes the user experience most of the
        time, because most of the time the wire is fine and the only thing you&rsquo;re trading is
        round-trips.
      </p>

      <p>
        Every additional consistency guarantee is paid for in messages. A local read can be served
        instantly. A read-your-writes read requires sticky routing or a session token. A quorum read
        requires waiting for two-of-three replicas to answer. A linearizable read requires a leader
        or a consensus check. A cross-region linearizable read requires sending light across
        continents. The same data; the same uptime; the same code path. The difference is how much
        certainty the client is willing to pay for.
      </p>

      <LatencyComparison />
      <div className="figure-caption" style={{ marginBottom: 32 }}>
        <strong>Fig. 7</strong> &nbsp; The same data, queried at different consistency levels. The
        cost is latency.
      </div>

      <p>So the honest formulation of the choice every distributed-data system actually makes:</p>

      <div
        style={{
          margin: '28px 0',
          padding: '28px 32px',
          background: 'var(--surface)',
          border: '1px solid var(--border-bright)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'Spectral, serif',
            fontWeight: 300,
            fontSize: 'clamp(20px, 3vw, 28px)',
            lineHeight: 1.4,
            color: 'var(--ink)',
            letterSpacing: '-0.005em',
          }}
        >
          <span style={{ color: 'var(--coral)', fontStyle: 'italic' }}>If</span>{' '}
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.85em',
              color: 'var(--coral)',
            }}
          >
            Partition
          </span>
          , then <span style={{ color: 'var(--emerald)', fontStyle: 'italic' }}>A</span> or{' '}
          <span style={{ color: 'var(--emerald)', fontStyle: 'italic' }}>C</span>.
          <br />
          <span style={{ color: 'var(--violet)', fontStyle: 'italic' }}>Else</span>, then{' '}
          <span style={{ color: 'var(--violet)', fontStyle: 'italic' }}>L</span> or{' '}
          <span style={{ color: 'var(--violet)', fontStyle: 'italic' }}>C</span>.
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            color: 'var(--ink-faint)',
            textTransform: 'uppercase',
          }}
        >
          PACELC
        </div>
      </div>

      <p>
        Notice the symmetry: in both halves of the formulation, <em>C</em>
        appears. Consistency is what you might give up <em>in either branch</em>. In a partition,
        you might give it up to keep serving. In normal operation, you might give it up to keep
        latency low. The two halves together describe a system&rsquo;s consistency posture under
        both regimes.
      </p>
    </section>
  );
}
