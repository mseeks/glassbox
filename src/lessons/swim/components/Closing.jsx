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
              A protocol that takes a structurally simple question — <em>who is here?</em> — and
              answers it across thousands of machines without ever asking everyone at once. The
              cleverness is not in any one mechanism but in the way five small ideas compose. The
              indirect probe kills false positives at constant cost. The suspicion state breaks the
              tradeoff between detection speed and commitment. The incarnation number resolves
              disagreement with the minimum information needed. The piggyback rides every packet
              that was going out anyway. The epidemic spread reaches a thousand nodes in about ten
              rounds.
            </p>
            <p>
              Each piece by itself is unsurprising. Each piece is doing something the others could
              not. Together they describe a particular way of being correct in a network — one that
              refuses to pay for properties it does not need, and uses the savings to scale.
            </p>
            <p>
              The protocol does not provide consensus, ordering, or moment-to-moment agreement. It
              provides something less, on purpose.{' '}
              <em>The cluster knows, eventually, who is here.</em> That much is enough to build the
              rest on.
            </p>
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
              color: 'var(--ink-faint)',
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
