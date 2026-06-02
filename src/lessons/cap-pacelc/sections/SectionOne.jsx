import { SectionLabel } from '../components/SectionLabel.jsx';

/* ════════════════════════════════════════════════════════════════════════
   § 1 — THE QUESTION

   Three desires, individually reasonable, jointly impossible.
   ════════════════════════════════════════════════════════════════════════ */
export function SectionOne() {
  return (
    <section className="section" id="s1">
      <SectionLabel num="1" label="The Question" />
      <h2 className="h-section">
        Three desires that <em>cannot</em> all be true.
      </h2>

      <p className="lede">
        A distributed system is many machines pretending to be one. The pretense is useful: clients
        see a single service, write to it, read from it, and trust the answers. But the pretense is
        also <em>fragile</em>, and the nature of that fragility is what the CAP theorem describes.
      </p>

      <p>
        Concretely, &ldquo;distributed data system&rdquo; means anything that holds state across
        more than one machine: a database like PostgreSQL or MongoDB; a key-value store like Redis
        or Cassandra; a coordination service like Zookeeper or etcd; a file store like S3 or HDFS;
        even a message queue like Kafka. All of them face the same set of tradeoffs the moment they
        replicate data across two or more nodes for durability, availability, or scale.
      </p>

      <p>
        Three things, all reasonable on their own, become impossible together the moment the network
        can fail. The shape of the impossibility is the whole content of the theorem; everything
        that follows in this lesson is a consequence.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          margin: '38px 0',
        }}
      >
        {[
          {
            letter: 'C',
            name: 'Consistency',
            color: 'var(--emerald)',
            desc: 'Every read returns the most recent write, system-wide. There appears to be only one copy of the data, and it tells the truth in real time.',
          },
          {
            letter: 'A',
            name: 'Availability',
            color: 'var(--cyan)',
            desc: 'Every request, sent to any non-failed node, receives a non-error response. Nothing blocks; nothing refuses.',
          },
          {
            letter: 'P',
            name: 'Partition tolerance',
            color: 'var(--coral)',
            desc: 'The system continues to function even when the network arbitrarily drops or delays messages between subsets of nodes.',
          },
        ].map((d, i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${d.color}`,
              padding: '22px 20px 24px',
              borderRadius: 2,
            }}
          >
            <div
              style={{
                fontFamily: 'Spectral, serif',
                fontSize: 48,
                fontWeight: 200,
                color: d.color,
                lineHeight: 1,
                marginBottom: 6,
                letterSpacing: '-0.02em',
              }}
            >
              {d.letter}
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                color: 'var(--ink-faint)',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              {d.name}
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>{d.desc}</div>
          </div>
        ))}
      </div>

      <p>
        Eric Brewer first posed it as a conjecture in 2000; Gilbert and Lynch proved it two years
        later. The pop version, &ldquo;pick two,&rdquo; has misled an entire generation of
        engineers. The real result is far more interesting, and to see why, we need first to sharpen
        what each letter actually means.
      </p>

      <div className="pull">The theorem is short. The misunderstanding of it is long.</div>
    </section>
  );
}
