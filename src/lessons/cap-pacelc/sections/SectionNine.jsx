import { SectionLabel } from '../components/SectionLabel.jsx';
import { QuorumLab } from '../labs/QuorumLab.jsx';
import LessonLink from '../../../shared/LessonLink.jsx';

export function SectionNine() {
  return (
    <section className="section" id="s9">
      <SectionLabel num="9" label="The Tunable Quorum" />
      <h2 className="h-section">
        Most systems let you <em>slide</em> the dial.
      </h2>

      <p className="lede">
        The Dynamo paper popularized a simple-but-deep idea: instead of choosing CP or AP at design
        time, parameterize the consistency decision <em>per query</em>. Three numbers do all the
        work: <strong>N</strong> the number of replicas, <strong>W</strong> the number of acks
        required to commit a write, and <strong>R</strong> the number of replicas a read must hear
        from before answering.
      </p>

      <p>
        One simple rule governs the behavior. When <code>R + W &gt; N</code>, the write quorum and
        the read quorum must overlap by at least one node, and that overlapping node will carry the
        latest write back into every read. The system feels strongly consistent. When{' '}
        <code>R + W ≤ N</code>, the quora can miss each other, so a read can miss a recent write.
        The system is eventually consistent. That single inequality is the whole of it.
      </p>

      <div style={{ margin: '32px 0 0' }}>
        <QuorumLab />
      </div>
      <div className="figure-caption" style={{ marginBottom: 36 }}>
        <strong>Fig. 9</strong> &nbsp; Tune N, W, R. The overlap (when <code>R + W &gt; N</code>) is
        what consistency costs.
      </div>

      <p>
        Look at the special cases the dials produce. <code>R = W = 1</code> is maximum availability.
        Any single node can answer either request, so the system survives almost any failure but
        offers no consistency guarantee. <code>W = N</code> means every write must reach every
        replica before it commits: high consistency, but a single failed replica kills writes.{' '}
        <code>R = W = ⌈(N+1)/2⌉</code>, read and write quora set to a strict majority, is the
        canonical &ldquo;quorum&rdquo; setting, the same shape used by{' '}
        <LessonLink to="paxos">
          <strong>Paxos</strong>
        </LessonLink>{' '}
        and <strong>Raft</strong> (Paxos being the older, original consensus algorithm; Raft a more
        recent, more understandable reformulation). It tolerates ⌊(N-1)/2⌋ failures while staying
        strong. Different applications want different points on this surface, and many systems let
        the application pick per query. Strong for the checkout. Fast for the product listing.
      </p>
    </section>
  );
}
