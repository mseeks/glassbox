import { Info } from 'lucide-react';
import { Callout, ChapterTitle, Prose, Section } from '../components/atoms.jsx';
import { MergeLab } from '../labs/MergeLab.jsx';

export const ChapterFive = () => (
  <Section id="ch5">
    <ChapterTitle
      number="V"
      eyebrow="THE MERGE"
      title="How knowledge travels"
      sub="Pointwise max, the operation that ties the structure together."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          When two nodes communicate, the receiver doesn't just adopt the sender's clock. It{' '}
          <em>merges</em> the sender's clock with its own. The operation is shamelessly simple: at
          each of the m positions, take the maximum of the two values. The result becomes the
          receiver's new clock.
        </p>
        <p>
          The merge is doing more work than it looks. It's preserving
          <em> everything either side knows</em> about the causal past, then setting the floor for
          everything that comes next. If A has heard about more events at position 7 than B has,
          after the merge both have heard about them. If B knows more about position 12, same story.
          Information about the past flows monotonically. Counters never go down on a merge.
        </p>
      </Prose>
    </div>

    <div style={{ marginTop: 40 }}>
      <MergeLab />
    </div>

    <div style={{ maxWidth: 760, marginTop: 40 }}>
      <Prose>
        <p>
          Pointwise max has three algebraic properties: associative, commutative, idempotent.
          Together they are the load-bearing structure of the whole approach. They mean three things
          in practice:
        </p>
        <p>
          <em>Order doesn't matter.</em> If a node receives merges from peers in any sequence, it
          ends up at the same place. That makes gossip-based dissemination correct without any
          global coordination. You can flood the network in any order.
        </p>
        <p>
          <em>Re-merging is safe.</em> A message delivered twice, merged twice, accidentally counted
          twice. No problem. Idempotence means the second merge is a no-op.
        </p>
        <p>
          <em>Convergence is guaranteed.</em> If everyone eventually hears about everyone else's
          clock (even indirectly, through chains), every node's clock converges to the same value.
          This is the lattice structure that makes Bloom clocks fit naturally into the same family
          as conflict-free replicated data types.
        </p>
      </Prose>

      <Callout icon={Info} title="A subtle thing" color="#6ee7b7" tone="note">
        After merging, the receiver typically records its <em>own</em> local event too. The receive
        itself counts. That extra increment makes the receiver's clock strictly dominate the
        sender's, which is exactly what we need: the receive happened-after the send, and the
        comparison must reflect that.
      </Callout>
    </div>
  </Section>
);
