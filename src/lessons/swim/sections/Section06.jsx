import { EpidemicSim } from '../labs/EpidemicSim.jsx';

export function Section06() {
  return (
    <section className="swim-section" id="s06">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 06</span>
          <h2 className="swim-section-title">
            The <em>infection</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid" style={{ marginBottom: 40 }}>
          <p className="swim-lede">
            How does a single update — "node 17 is suspect" — reach every member of the cluster? Not
            through broadcast. Through contagion.
          </p>
          <p>
            SWIM's elegance is that it sends <em>no dedicated dissemination traffic at all</em>. The
            probes and acks are already flying. Every message has spare room. So each pending update
            — alive, suspect, dead, join — gets
            <strong> piggybacked</strong> onto outgoing probe traffic as a small rider in the
            packet. Each update carries a transmission counter; once it has been attached to roughly{' '}
            <code>λ · log N</code> messages, the cluster has almost certainly heard it.
          </p>
          <p>
            The math is the math of epidemics. If every infected host transmits to a handful of
            others each round, the infected population follows the familiar logistic curve: slow at
            first, then a sudden inflection, then saturation. By round ⌈log₂ N⌉, with high
            probability, the fact is everywhere.
          </p>
        </div>

        <EpidemicSim />

        <div className="swim-rule" />

        <div className="swim-prose swim-mid">
          <p>
            The packet has finite room. When more updates need to ride than can fit, SWIM
            prioritises them: <em>fresher updates first</em>, then those with
            <em> lower transmission counts</em>. Updates near their dissemination threshold are
            deprioritised — they're almost everywhere already. This keeps the most useful
            information moving without bloating the wire format.
          </p>
          <p>
            The same packets carry two stories: <em>"I'm checking on you"</em> and
            <em> "here's what I know about everyone else."</em> The first answers the local
            question; the second propagates the answer. One protocol, one packet, two jobs.
          </p>
        </div>
      </div>
    </section>
  );
}
