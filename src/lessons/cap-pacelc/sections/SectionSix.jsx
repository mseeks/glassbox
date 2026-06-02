import { SectionLabel } from '../components/SectionLabel.jsx';
import { ConsistencyLattice } from '../labs/ConsistencyLattice.jsx';

export function SectionSix() {
  return (
    <section className="section" id="s6">
      <SectionLabel num="6" label="The Consistency Lattice" />
      <h2 className="h-section">
        C is not binary. It is a <em>lattice</em>.
      </h2>

      <p className="lede">
        The CAP theorem speaks of consistency as if it were one thing: linearizable or not. The real
        landscape is a partial order with many rungs, and many of them are achievable in
        always-available systems. The question is never just &ldquo;CP or AP&rdquo;; it is also{' '}
        <em>which</em> consistency level you actually want, and how much you&rsquo;re willing to pay
        for the extra strength.
      </p>

      <p>
        Climb the tower. Each level prevents some anomalies and permits others. A
        causally-consistent system, for example, lives well below linearizable — but it preserves
        the intuitions humans actually rely on (your reply appears after the post it replies to)
        without paying for global coordination on independent operations. Linearizability is the
        luxury good; most applications would be happy with causal+ if they could articulate the
        requirement.
      </p>

      <div style={{ margin: '32px 0 0' }}>
        <ConsistencyLattice />
      </div>
      <div className="figure-caption" style={{ marginBottom: 36 }}>
        <strong>Fig. 6</strong> &nbsp; Click any level to see what it prevents, what it permits, and
        what implements it.
      </div>

      <p>
        Two structural points are worth pausing on. <strong>First</strong>: the tower is a partial
        order, not a total one. Linearizability is about
        <em> single-object</em> operations: reads and writes on one key, like &ldquo;set
        account-42&rsquo;s balance to $100&rdquo;. Serializability is about <em>multi-object</em>{' '}
        transactions — operations that touch several keys at once and must commit together, like
        &ldquo;debit account-42 and credit account-43.&rdquo; Linearizability cares that each
        individual operation appears to take effect in real-time order; serializability cares that
        the whole bundle is equivalent to running the transactions one at a time. Neither implies
        the other. You can have either, both (&ldquo;strict serializability&rdquo;), or neither.
        <strong> Second</strong>: the popular dichotomy &ldquo;strong vs eventual&rdquo; collapses
        an entire middle layer where most interesting systems actually live. Causal consistency is
        achievable in an
        <em> always-available</em> system. This is a quiet but important fact. CAP&rsquo;s result is
        about <em>linearizability</em>, not about consistency in general. Many of the guarantees in
        the middle of the tower can be had under partition.
      </p>

      <div className="pull">
        The choice is never just CP or AP. It is which <em>shape</em> of consistency you commit to,
        and what your application actually needs.
      </div>
    </section>
  );
}
