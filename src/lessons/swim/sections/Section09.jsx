export function Section09() {
  return (
    <section className="swim-section" id="s09">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 09</span>
          <h2 className="swim-section-title">
            In <em>practice</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid">
          <p className="swim-lede">
            The paper's protocol is a clean object. Production clusters are not. A decade of
            operational experience has produced a small set of refinements.
          </p>
          <p>
            <strong style={{ color: 'var(--brass)' }}>Asymmetric partitions.</strong> SWIM assumes
            that a node responding to <em>somebody</em> is evidence it is alive. Consider a partial
            partition, where node M can reach half the cluster but not the other half. The
            unreachable half will keep suspecting M, the reachable half will keep refuting, and M
            will flap between states. There is no clean answer: choosing a single global view forces
            an availability sacrifice.
          </p>
          <p>
            <strong style={{ color: 'var(--brass)' }}>Slow nodes.</strong> A node experiencing GC
            pauses, swap pressure, or clock drift may miss probe responses despite being alive. Each
            false positive triggers a refutation and a fresh incarnation, but repeated cycles waste
            bandwidth and produce churn in the membership view.
          </p>
          <p>
            <strong style={{ color: 'var(--brass)' }}>Garbage collection of state.</strong> Dead
            members cannot simply be forgotten; an old <code>alive</code> packet for them could
            resurrect them if their record were gone. Implementations retain dead state for several
            multiples of the dissemination time, then prune.
          </p>
          <p>
            <strong style={{ color: 'var(--brass)' }}>Bootstrap.</strong> A new node needs at least
            one existing member to gossip with. This is solved out-of-band: a seed list of likely
            members from configuration, DNS, or a service registry. Once contact is made with any
            live member, the joiner pulls the full membership list and integrates.
          </p>
        </div>

        <div className="swim-rule-short" style={{ margin: '48px 0 24px' }} />

        <div>
          <div className="swim-label" style={{ color: 'var(--brass)', marginBottom: 16 }}>
            LIFEGUARD <span style={{ color: 'var(--ink-label)' }}>· Dadgar et al., 2018</span>
          </div>
          <div className="swim-prose swim-mid">
            <p>
              HashiCorp's Memberlist powers Serf, Consul, and Nomad. Years of running SWIM at scale
              produced <em>Lifeguard</em>: a set of additions designed to dampen the failure modes
              above without altering the core protocol.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 18,
              marginTop: 28,
            }}
          >
            <div className="swim-card">
              <span className="swim-corner-ornament tl" />
              <span className="swim-corner-ornament tr" />
              <span className="swim-corner-ornament bl" />
              <span className="swim-corner-ornament br" />
              <div className="swim-label" style={{ color: 'var(--brass)', marginBottom: 10 }}>
                SELF-AWARENESS
              </div>
              <h4
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 22,
                  margin: 0,
                  color: 'var(--ink-bright)',
                }}
              >
                Local Health Multiplier
              </h4>
              <p className="swim-prose" style={{ fontSize: 14, marginTop: 12 }}>
                A node tracks its own missed deadlines and slow probes. When its self-health
                degrades, it <em>handicaps itself</em> by lengthening its own probe and suspicion
                timeouts. The insight: if I am the slow witness, I should not be aggressive about
                declaring others dead.
              </p>
            </div>
            <div className="swim-card">
              <span className="swim-corner-ornament tl" />
              <span className="swim-corner-ornament tr" />
              <span className="swim-corner-ornament bl" />
              <span className="swim-corner-ornament br" />
              <div className="swim-label" style={{ color: 'var(--brass)', marginBottom: 10 }}>
                DOGPILE GUARD
              </div>
              <h4
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 22,
                  margin: 0,
                  color: 'var(--ink-bright)',
                }}
              >
                Time-bounded suspicion
              </h4>
              <p className="swim-prose" style={{ fontSize: 14, marginTop: 12 }}>
                A suspicion is not permanent. As independent members confirm it, Lifeguard shrinks
                the suspicion timeout logarithmically: the more witnesses pile on, the sooner a
                truly-dead node is declared dead, while a lone suspicion waits the full timeout.
              </p>
            </div>
            <div className="swim-card">
              <span className="swim-corner-ornament tl" />
              <span className="swim-corner-ornament tr" />
              <span className="swim-corner-ornament bl" />
              <span className="swim-corner-ornament br" />
              <div className="swim-label" style={{ color: 'var(--brass)', marginBottom: 10 }}>
                BUDDY SYSTEM
              </div>
              <h4
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 22,
                  margin: 0,
                  color: 'var(--ink-bright)',
                }}
              >
                A word to the accused
              </h4>
              <p className="swim-prose" style={{ fontSize: 14, marginTop: 12 }}>
                When a node suspects a peer, it sends word straight to the accused instead of
                waiting for the rumour to reach it through gossip. Told at the earliest possible
                moment, the suspect can broadcast a higher-incarnation refutation before a false
                suspicion hardens into death.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
