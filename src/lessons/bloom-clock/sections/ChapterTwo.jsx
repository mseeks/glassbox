import { AlertTriangle } from 'lucide-react';
import { Callout, ChapterTitle, Code, Prose, Section } from '../components/atoms.jsx';
import { VectorClockLab } from '../labs/VectorClockLab.jsx';

export const ChapterTwo = () => (
  <Section id="ch2">
    <ChapterTitle
      number="II"
      eyebrow="THE EXACT WAY"
      title="Vector clocks"
      sub="The structure the Bloom clock improves upon — and the cost it pays for being exact."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          Lamport's original 1978 timestamps were a single integer: increment on every event, take
          the max-plus-one on every receive. Beautiful, but they collapse all of distributed time
          into a single scalar. They give you a <em>total</em> order where what you actually need is
          a <em>partial</em> one — concurrent events look ordered even though they aren't.
        </p>
        <p>
          The fix, due to Mattern and Fidge a decade later, is the <em>vector clock</em>. Instead of
          one integer, every node carries one integer
          <em> for every node in the cluster</em>. Each node only ever increments its own slot; on
          every receive, you take the pointwise max across the whole vector before incrementing your
          own slot again.
        </p>
        <p>
          The result is exact. Given two events A and B with their attached vectors, A happened
          before B iff every component of A is less than or equal to B's and at least one is
          strictly less. Neither dominates? Concurrent. No ambiguity, no probabilities — the
          structure is a faithful encoding of the happens-before partial order.
        </p>
        <p>
          Try the lab below. Click <Code>tick</Code> to record a local event. Use the dropdown to
          send a message between nodes — the receiver will merge. Then add a node and watch what
          happens to every existing vector.
        </p>
      </Prose>
    </div>

    <VectorClockLab />

    <div style={{ maxWidth: 760, marginTop: 40 }}>
      <Prose>
        <p>
          You can see the problem already with eight nodes. Now imagine a cluster of a hundred. A
          thousand. Tens of thousands. Every event drags around an integer vector the size of the
          cluster. Every message gossiped between nodes carries one. Every key written to a
          replicated store stores one.
        </p>
        <p>
          And it gets worse: the cluster isn't static. Nodes join, nodes fail, nodes are forgotten.
          Each of those events has to be reflected in every vector everywhere, or the comparisons go
          wrong. Garbage-collecting a slot that belonged to a node nobody talks to anymore is a
          famously gnarly subproblem — the "version vector pruning" question that has its own thread
          of academic literature.
        </p>
        <p>
          Vector clocks are right. They just become structurally expensive at scale, and they assume
          a kind of bookkeeping that's hard to maintain in a long-running system with churn.
        </p>
      </Prose>

      <Callout icon={AlertTriangle} title="The bill" color="#fb7185" tone="warn">
        Space per event: <strong>O(N)</strong>. Comparison: <strong>O(N)</strong>. Membership
        management: ongoing, non-trivial, and adversarial to the very network conditions that make
        distributed systems hard in the first place.
      </Callout>
    </div>
  </Section>
);
