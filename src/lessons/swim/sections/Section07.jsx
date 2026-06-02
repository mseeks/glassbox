import { FullClusterSim } from '../labs/FullClusterSim.jsx';

export function Section07() {
  return (
    <section className="swim-section" id="s07">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 07</span>
          <h2 className="swim-section-title">
            The <em>protocol, in motion</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid" style={{ marginBottom: 40 }}>
          <p className="swim-lede">
            All five mechanisms running at once. Probing, indirect fallback, suspicion, incarnation
            arbitration, and piggybacked gossip — together, on the same wire, over the same packets.
          </p>
          <p>
            Below is a 24-node cluster in steady operation. Each node probes one random peer per
            period. Probe successes ack back in green. Probe failures trigger indirect probes, then
            a suspicion gossip in amber. After the suspicion timeout, unrefuted suspects become
            dead. Throughout, the wire never grows beyond the constant per-node load you saw in §01.
          </p>
        </div>

        <FullClusterSim />
      </div>
    </section>
  );
}
