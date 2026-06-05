import Section from '../components/Section.jsx';
import LivenessLab from '../labs/LivenessLab.jsx';

// §V — safety always holds; progress does not. The F-L-P impossibility, and the
// leader that sidesteps it in practice.
export default function Liveness() {
  return (
    <Section id="liveness" roman="V">
      <div className="pax-rv">
        <p className="pax-kicker">The catch</p>
        <h2 className="pax-h2">Always correct, not always finished</h2>
        <p className="pax-prose">
          Safety holds no matter what. <span className="pax-strong">Progress does not.</span> Two
          proposers can fall into a duel: each new Prepare invalidates the other's pending Accept,
          so neither ever lands. Nothing gets carved — forever.
        </p>
      </div>
      <div className="pax-rv">
        <LivenessLab />
      </div>
      <div className="pax-rv">
        <p className="pax-prose" style={{ marginTop: 18 }}>
          This isn't a bug to be patched away. It's a famous impossibility result, sometimes called{' '}
          <span className="pax-strong">F-L-P</span> after its authors: in a fully asynchronous
          network where even one machine can crash, no deterministic protocol can guarantee that
          agreement ever terminates. Paxos took the only escape that keeps safety intact — it gives
          up the <em>guarantee</em> of progress and relies on a stable leader to make progress in
          practice. Paxos itself never prescribes how that leader is chosen; in practice, randomized
          backoff between rival proposers breaks the symmetry so one of them wins out.
        </p>
      </div>
    </Section>
  );
}
