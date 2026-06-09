import LessonLink from '../../../shared/LessonLink.jsx';

export function Closing() {
  return (
    <section className="swim-section" style={{ paddingBottom: 140 }}>
      <div className="swim-page">
        <div className="swim-narrow" style={{ margin: '0 auto' }}>
          <div className="swim-eyebrow" style={{ marginBottom: 28, color: 'var(--brass)' }}>
            Coda
          </div>
          <h2
            className="swim-display"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              margin: 0,
              color: 'var(--ink-bright)',
              lineHeight: 1.05,
            }}
          >
            What you are <em>looking at</em>
          </h2>
          <div className="swim-rule-short" style={{ margin: '28px 0' }} />
          <div className="swim-prose" style={{ fontSize: 17, lineHeight: 1.75 }}>
            <p>
              A protocol that takes a structurally simple question, <em>who is here?</em>, and
              answers it across thousands of machines without ever asking everyone at once. The
              cleverness is not in any one mechanism but in the way five small ideas compose. Count
              them. The indirect probe kills false positives at constant cost. The suspicion state
              breaks the tradeoff between detection speed and commitment. The incarnation number
              resolves disagreement with the minimum information needed. The piggyback rides every
              packet that was going out anyway. The epidemic spread reaches a thousand nodes in
              about ten rounds.
            </p>
            <p>
              Each piece by itself is unsurprising. Each piece is doing something the others could
              not. Together they describe a particular way of being correct in a network. It refuses
              to pay for properties it does not need, and uses the savings to scale.
            </p>
            <p>
              The protocol does not provide consensus, ordering, or moment-to-moment agreement. It
              provides something less, on purpose.{' '}
              <em>The cluster knows, eventually, who is here.</em> That much is enough to build the
              rest on.
            </p>
          </div>
          <div style={{ marginTop: 56 }}>
            <div className="swim-eyebrow" style={{ marginBottom: 24, color: 'var(--brass)' }}>
              Where to go next
            </div>
            <div className="swim-prose swim-mid" style={{ fontSize: 17, lineHeight: 1.75 }}>
              <p>
                <strong style={{ color: 'var(--brass)' }}>Lifeguard</strong>, if you intend to run
                this. The three refinements from §09 — a node that <em>handicaps itself</em> when
                its own health degrades, suspicion timeouts that decay as witnesses pile on, and a
                word sent straight to the accused — are what turn the paper's clean object into
                something that survives slow nodes and GC pauses. SWIM with Lifeguard is what ships
                inside Serf, Consul, and Nomad.
              </p>
              <p>
                <strong style={{ color: 'var(--brass)' }}>
                  Raft, or <LessonLink to="paxos">Paxos</LessonLink>
                </strong>
                , for the rung above. Membership is not consensus, and SWIM was careful never to
                promise it. When you need an ordered, linearizable decision about shared state, SWIM
                tells you who the members <em>are</em> and a consensus log decides what they{' '}
                <em>agree to</em> — the cheap eventual layer at the bottom, the expensive
                unanimous-now layer on top. It is the same two-rung ladder the comparison in §10
                ends on, and Consul is its canonical shape.
              </p>
              <p>
                <strong style={{ color: 'var(--brass)' }}>Anti-entropy gossip</strong>, for moving
                more than just <em>who is here</em>. SWIM piggybacks membership deltas; its cousin
                gossips arbitrary key-value state, with{' '}
                <LessonLink to="merkle-trees">Merkle trees</LessonLink> making the reconciliation
                diff cheap. It is how Dynamo, Cassandra, and Riak keep replicas converging — the
                same epidemic spread, pointed at data instead of liveness.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                background: 'var(--brass)',
                transform: 'rotate(45deg)',
              }}
            />
            <span
              className="swim-mono"
              style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.16em' }}
            >
              END
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: 'linear-gradient(90deg, var(--brass-deep), transparent)',
              }}
            />
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: 'JetBrains Mono',
              fontSize: 10.5,
              color: 'var(--ink-label)',
              lineHeight: 1.7,
            }}
          >
            <div>Das, A., Gupta, I., & Motivala, A. (2002).</div>
            <div>SWIM: Scalable Weakly-consistent Infection-style Process Group Membership.</div>
            <div>International Conference on Dependable Systems and Networks.</div>
            <div style={{ marginTop: 10 }}>Dadgar, A., Phillips, J., & Currey, J. (2018).</div>
            <div>Lifeguard: Local Health Awareness for More Accurate Failure Detection.</div>
            <div>HashiCorp Research.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
