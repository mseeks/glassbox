export function Section10() {
  return (
    <section className="swim-section" id="s10">
      <div className="swim-page">
        <div className="swim-section-header">
          <span className="swim-section-number">§ 10</span>
          <h2 className="swim-section-title">
            In <em>context</em>
          </h2>
        </div>

        <div className="swim-prose swim-mid" style={{ marginBottom: 40 }}>
          <p className="swim-lede">
            SWIM sits in a constellation of protocols that handle different layers of the same
            problem space. Knowing where each one belongs is half the work.
          </p>
        </div>

        <div className="swim-card" style={{ padding: 0, overflow: 'hidden' }}>
          <span className="swim-corner-ornament tl" />
          <span className="swim-corner-ornament tr" />
          <span className="swim-corner-ornament bl" />
          <span className="swim-corner-ornament br" />
          <table className="swim-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: 180, paddingLeft: 28 }}>Protocol</th>
                <th style={{ width: 200 }}>Solves</th>
                <th style={{ width: 160 }}>Consistency</th>
                <th style={{ paddingRight: 28 }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label" style={{ paddingLeft: 28 }}>
                  SWIM
                </td>
                <td>Membership, failure detection</td>
                <td>Eventual / weak</td>
                <td style={{ paddingRight: 28 }}>O(1) per node. The subject of this lesson.</td>
              </tr>
              <tr>
                <td className="label" style={{ paddingLeft: 28 }}>
                  Phi Accrual
                </td>
                <td>Failure detection only</td>
                <td>—</td>
                <td style={{ paddingRight: 28 }}>
                  Emits a continuous suspicion <em>value</em> rather than a binary verdict; the
                  application picks the threshold. Used in Cassandra, Akka.
                </td>
              </tr>
              <tr>
                <td className="label" style={{ paddingLeft: 28 }}>
                  Anti-entropy gossip
                </td>
                <td>Data replication</td>
                <td>Eventual</td>
                <td style={{ paddingRight: 28 }}>
                  SWIM's cousin for arbitrary key-value updates. Merkle trees for efficient diff.
                  Used in Dynamo, Cassandra, Riak.
                </td>
              </tr>
              <tr>
                <td className="label" style={{ paddingLeft: 28 }}>
                  Raft / Paxos
                </td>
                <td>Consensus on a log</td>
                <td>Linearizable</td>
                <td style={{ paddingRight: 28 }}>
                  Strong consistency on replicated state. Requires majority quorum. Often used{' '}
                  <em>alongside</em> SWIM — Consul is the canonical example.
                </td>
              </tr>
              <tr>
                <td className="label" style={{ paddingLeft: 28 }}>
                  Plain heartbeats
                </td>
                <td>Failure detection</td>
                <td>—</td>
                <td style={{ paddingRight: 28 }}>
                  Each node sends "I'm alive" to all peers. Simple, O(N²) total, high false-positive
                  rate. The baseline SWIM improves on.
                </td>
              </tr>
              <tr>
                <td className="label" style={{ paddingLeft: 28 }}>
                  ZooKeeper / etcd
                </td>
                <td>Coordination service</td>
                <td>Linearizable</td>
                <td style={{ paddingRight: 28 }}>
                  Centralised quorum-based service for locks, leader election, config. Higher
                  operational overhead; stronger guarantees.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="swim-rule" />

        <div className="swim-prose swim-mid">
          <p>
            The most common production pattern: SWIM at the bottom for membership, Raft above it for
            consistent data. <em>Consul</em> is built this way — Serf (SWIM with Lifeguard) handles
            "who is in the cluster," and Raft handles the strongly-consistent key-value store the
            cluster manages. They occupy different rungs of the same ladder. SWIM is the cheap,
            unanimous-eventually layer. Raft is the expensive, unanimous-now layer. Choose by what
            you need; pay only for that.
          </p>
        </div>
      </div>
    </section>
  );
}
