import { SectionLabel } from '../components/SectionLabel.jsx';
import { PartitionLab } from '../labs/PartitionLab.jsx';

export function SectionFive() {
  return (
    <section className="section" id="s5">
      <SectionLabel num="5" label="The Real Choice: CP or AP" />
      <h2 className="h-section">
        Two systems, one event, <em>two</em> answers.
      </h2>

      <p className="lede">
        Two three-node clusters, one trained to prefer consistency, one to prefer availability.
        Trigger a partition and watch the same operations (writes, reads) produce completely
        different behaviors. The fork in the road is real, and a system commits to a direction the
        day it&rsquo;s designed.
      </p>

      <p>
        The <em>CP cluster</em> is shaped like <strong>Raft</strong>, a popular consensus algorithm
        that elects a leader and replicates a log of operations to a majority before each commit.
        That &ldquo;majority&rdquo; is called a <strong>quorum</strong>: a strict-majority vote that
        guarantees any two committed states overlap on at least one node, so the cluster cannot
        disagree with itself. When the network splits, the minority side cannot reach a quorum, so
        it refuses both writes and linearizable reads on that side. The majority side, holding two
        of three votes, elects a new leader if needed and keeps going. The cost is paid by the
        clients on the wrong side.
      </p>

      <p>
        The <em>AP cluster</em> is shaped like <strong>Dynamo</strong>, Amazon&rsquo;s 2007 design
        (the basis for DynamoDB and Cassandra), which has no leader and lets every node accept
        writes locally, gossiping them to peers in the background. When the network splits, both
        sides keep serving requests, but they diverge. After the heal, conflict resolution kicks in:
        last-writer-wins, vector-clock siblings, or a <strong>CRDT</strong> merge function. A CRDT,
        a Conflict-free Replicated Data Type, is a data structure whose merge operation is designed
        so that concurrent edits always combine into one well-defined value, no matter the order.
        The cost is paid by the application&rsquo;s view of consistency.
      </p>

      <div style={{ margin: '32px 0 0' }}>
        <PartitionLab />
      </div>
      <div className="figure-caption" style={{ marginBottom: 36 }}>
        <strong>Fig. 5</strong> &nbsp; Trigger the partition. Write on either side. Watch what each
        system does.
      </div>

      <p>
        Try every combination. Trigger the partition, write to the minority side on both systems,
        read from the majority side on both. The CP cluster will refuse the minority write outright.
        The AP cluster will accept it, then look stale to clients reading the majority side, and at
        heal-time it will reconcile, possibly losing data, possibly keeping it, depending on the
        resolution rule.
      </p>

      <p>
        This is not a story about which is &ldquo;better.&rdquo; They are different contracts, and
        each is right for different problems. A bank ledger wants CP. A shopping cart wants AP. The
        next sections refine that choice: first by recognizing consistency itself is not binary,
        then by noticing that the partition-time choice has a quieter twin that runs even when the
        network works perfectly.
      </p>
    </section>
  );
}
