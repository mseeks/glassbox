function PropertyCard({ kind, title, formula, body, accent }) {
  const color = accent || 'var(--brass)';
  return (
    <div className="swim-card" style={{ padding: 28, position: 'relative', height: '100%' }}>
      <span className="swim-corner-ornament tl" />
      <span className="swim-corner-ornament tr" />
      <span className="swim-corner-ornament bl" />
      <span className="swim-corner-ornament br" />
      <div className="swim-label" style={{ color: 'var(--ink-label)', marginBottom: 14 }}>
        {kind}
      </div>
      <h3
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: 28,
          color: 'var(--ink-bright)',
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 22,
          color,
          fontWeight: 500,
          marginTop: 16,
          marginBottom: 16,
          letterSpacing: '-0.01em',
        }}
      >
        {formula}
      </div>
      <div className="swim-prose" style={{ fontSize: 14, lineHeight: 1.6 }}>
        {body}
      </div>
    </div>
  );
}

export function Section08() {
  return (
    <section className="swim-section" id="s08">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 08</span>
          <h2 className="swim-section-title">
            The <em>properties</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid" style={{ marginBottom: 48 }}>
          <p className="swim-lede">
            Six quantitative claims SWIM makes, and the mechanism behind each.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          <PropertyCard
            kind="01 · Network load"
            title="O(1) per node per round"
            formula="≈ k + 2 msg"
            accent="var(--alive)"
            body={
              <>
                One probe out, one ack back, plus an expected constant number of forwarded indirect
                probes. <em>Independent of N.</em> The cluster's total load is O(N), spread evenly.
              </>
            }
          />
          <PropertyCard
            kind="02 · Detection latency"
            title="Time to first suspicion"
            formula="E[t] ≈ T"
            accent="var(--probe)"
            body={
              <>
                With T the protocol period (typically 1–5 s), the expected time between a node's
                death and its first suspect mark is bounded by T. Every alive peer probes someone
                each round, so a dead node is probed quickly in expectation.
              </>
            }
          />
          <PropertyCard
            kind="03 · Confirmation latency"
            title="Time to dead"
            formula="T + τ_susp"
            accent="var(--suspect)"
            body={
              <>
                The suspicion timeout τ_susp lets the suspect refute itself. Typical values are 5T,
                giving a few-second window before commitment. Tunable per environment.
              </>
            }
          />
          <PropertyCard
            kind="04 · Dissemination"
            title="To full convergence"
            formula="O(log N) · T"
            accent="var(--gossip)"
            body={
              <>
                Each update is gossipped O(log N) times. At N = 10,000 with T = 1 s, full
                propagation takes roughly 13–15 seconds, with high probability.
              </>
            }
          />
          <PropertyCard
            kind="05 · False-positive rate"
            title="Bounded exponentially"
            formula="≈ p^(k+1)"
            accent="var(--dead)"
            body={
              <>
                Given a single-link drop probability p, indirect probing via k helpers cuts the
                false-positive probability from p to p^(k+1). At k = 3 and p = 0.05, that is 6 ×
                10⁻⁶ per round.
              </>
            }
          />
          <PropertyCard
            kind="06 · Completeness"
            title="Eventually, w.h.p."
            formula="P(detect) → 1"
            accent="var(--brass)"
            body={
              <>
                Strong completeness, eventually: every crash failure is detected by every non-faulty
                member with probability approaching one over time. A non-zero tail that vanishes
                within a few rounds.
              </>
            }
          />
        </div>

        <div className="swim-rule" />

        <div className="swim-prose swim-mid">
          <p>
            What is <em>not</em> here matters as much as what is. SWIM does not provide agreement on
            the membership view at any given moment. Different nodes briefly see different things.
            It does not detect Byzantine failures; a malicious node lying about its own incarnation
            can confuse the protocol. It does not order data, transactions, or anything other than
            the membership facts themselves. <em>Weak consistency is a feature</em>: it buys the
            protocol its scalability. Stronger guarantees cost round-trips SWIM refuses to pay.
          </p>
        </div>
      </div>
    </section>
  );
}
