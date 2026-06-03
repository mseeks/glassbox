import { SectionLabel } from '../components/SectionLabel.jsx';
import { QuadrantMap } from '../labs/QuadrantMap.jsx';

export function SectionEight() {
  return (
    <section className="section" id="s8">
      <SectionLabel num="8" label="The Four Quadrants" />
      <h2 className="h-section">
        Where real systems <em>actually</em> sit.
      </h2>

      <p className="lede">
        PACELC&rsquo;s two binary choices yield four quadrants. Every distributed data system lands
        somewhere in this plane, sometimes precisely, sometimes ambiguously, but always at the cost
        of having committed to a stance about what to give up when.
      </p>

      <p>
        A quick note on the cast: <strong>Spanner</strong> is Google&rsquo;s global-scale SQL
        database; <strong>etcd</strong> and <strong>Zookeeper</strong> are configuration and
        coordination services used to elect leaders, hold cluster metadata, and lock critical
        sections; <strong>DynamoDB</strong> and <strong>Cassandra</strong> are wide-column /
        key-value stores designed for high-write workloads; <strong>MongoDB</strong> is a document
        database; <strong>Cosmos DB</strong> is Microsoft&rsquo;s multi-model cloud database. Each
        one is a real piece of software you can deploy today, and each has made the tradeoffs PACELC
        describes explicit in its design.
      </p>

      <p>
        The most populated quadrants are <strong>PC/EC</strong> (consistent always: Spanner, etcd,
        FoundationDB, and Bigtable-style stores like HBase) and <strong>PA/EL</strong> (available
        always: DynamoDB, Cassandra, Riak). The middle quadrant <strong>PC/EL</strong>, strong when
        it matters and fast otherwise, is the textbook home of Yahoo&rsquo;s PNUTS: it trades
        consistency for latency in normal operation, yet stays consistent under partition by making
        unreachable records unavailable. The fourth, <strong>PA/EC</strong>, is the &ldquo;have it
        all&rdquo; pitch and is usually configurable: Cosmos DB exposes five consistency levels and
        lets the client choose.
      </p>

      <div style={{ margin: '32px 0 0' }}>
        <QuadrantMap />
      </div>
      <div className="figure-caption" style={{ marginBottom: 36 }}>
        <strong>Fig. 8</strong> &nbsp; The PACELC plane. Hover any system for its stance.
      </div>

      <p>
        The map is more honest than the CAP-letter alone, but it still flattens reality. Many of
        these systems offer per-query knobs that slide their effective position along either axis.
        Cassandra is PA/EL by default, but <code>SELECT … CONSISTENCY ALL</code> moves it toward EC
        for that query. Cosmos DB exposes the full continuum explicitly. Treat the points on this
        map as a system&rsquo;s defaults and center of gravity, not its limit.
      </p>
    </section>
  );
}
