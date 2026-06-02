import { ProbeSimulator } from '../labs/ProbeSimulator.jsx';

export function Section03() {
  return (
    <section className="swim-section" id="s03">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 03</span>
          <h2 className="swim-section-title">
            The <em>probe</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid" style={{ marginBottom: 40 }}>
          <p className="swim-lede">
            Each round, every node picks one random peer and asks it a single question:
            <em> are you there?</em> If the answer fails to arrive, the node does not jump to
            conclusions. It gathers more evidence first.
          </p>
          <p>
            A single unanswered ping is weak evidence. The most common reason it doesn't arrive is
            not death but a transient blip on the specific link between{' '}
            <em>this prober and this target</em>. So the prober asks for a second opinion. It picks{' '}
            <strong>k</strong> other nodes at random, usually k = 3, and asks each of them to probe
            the target on its behalf. One success is enough. If even one of those indirect probes
            arrives, the target is alive; the original failure was the network's fault, not the
            node's.
          </p>
          <p>
            This is the move that separates SWIM from a naive heartbeat detector. By triangulating,
            you reduce the false-positive rate roughly from <code>p</code>
            (some link drop probability) to <code>p</code>
            <sup>k+1</sup>. That is an exponential improvement at constant per-node cost. Try it
            below: break the direct link and watch the helpers route around it.
          </p>
        </div>

        <ProbeSimulator />

        <div className="swim-rule" />

        <div className="swim-prose swim-mid">
          <p
            className="swim-lede"
            style={{ color: 'var(--brass)', fontSize: 'clamp(17px, 1.9vw, 21px)' }}
          >
            On randomness, briefly.
          </p>
          <p>
            Why does the prober pick its target at random? The answer is coverage. If every node
            always probed the same neighbour, dead nodes near popular neighbours would be detected
            quickly and the unloved corners of the cluster would be probed almost never. Random
            selection gives <em>probabilistic completeness</em>: over enough rounds, every node is
            probed by every other node with high probability.
          </p>
          <p>
            In practice, pure randomness has high variance. Some nodes wait a long time for their
            turn. So real implementations keep a randomly shuffled list, walk it in order, and
            reshuffle at the end. Each node has its own shuffle. That preserves randomness{' '}
            <em>between</em> nodes; within one node, the schedule is bounded. Memberlist (HashiCorp)
            and Serf do exactly this.
          </p>
        </div>
      </div>
    </section>
  );
}
