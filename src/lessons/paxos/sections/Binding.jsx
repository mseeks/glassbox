import Section from '../components/Section.jsx';
import Walkthrough from '../components/Walkthrough.jsx';
import { scForced } from '../engine/index.js';

// §IV — the binding rule, the hinge that forbids flip-flops and makes Paxos safe.
export default function Binding() {
  return (
    <Section id="binding" roman="IV">
      <div className="pax-rv">
        <p className="pax-kicker">Why it's safe</p>
        <h2 className="pax-h2">The rule that forbids flip-flops</h2>
        <p className="pax-prose">
          Here is the hinge of the whole protocol. When a proposer finishes Phase 1, it does{' '}
          <span className="pax-strong">not</span> get to submit whatever it likes. If any promise
          came back carrying a decree already voted on, the proposer is{' '}
          <span className="pax-em">bound</span> to re-submit the one with the{' '}
          <span className="pax-strong">highest ballot number</span> it heard. It may use its own
          decree only if no legislator had voted at all.
        </p>
        <p className="pax-prose">
          Watch it bite. Proposer A gets “BUILD HARBOR” chosen by the first three legislators. Then
          proposer B arrives wanting “FUND FLEET” — but polls a quorum that overlaps A's by a single
          legislator, number 3, the witness. That one report forces B to carry “BUILD HARBOR”
          forward instead.
        </p>
      </div>
      <div className="pax-rv">
        <div className="pax-lab">
          <div className="pax-lab-h">
            <span className="pax-lab-t">Forced to Carry It Forward</span>
          </div>
          <p className="pax-lab-sub">
            Two proposers, overlapping quorums. The witness (legislator 3) decides the outcome.
          </p>
          <Walkthrough build={scForced} scenarioKey="forced" witness={2} />
        </div>
      </div>
      <div className="pax-rv">
        <p className="pax-prose" style={{ marginTop: 18 }}>
          That's the safety argument in miniature. Once a decree is chosen by some majority, any
          later proposer must poll a majority too — and by the arithmetic from before, the two
          majorities share a witness who reports the chosen decree. The binding rule then re-submits
          it. The decree can never flip.
        </p>
        <p className="pax-prose">
          Why the <span className="pax-em">highest</span> ballot, not the most common? Because
          interrupted rounds can leave different legislators reporting different decrees. A short
          argument shows the highest-numbered report is always the chosen one, if anything was
          chosen — so taking the maximum is the safe move. And notice: none of this leaned on
          timing. Messages may be delayed for a year; the worst outcome is delay, never
          disagreement.
        </p>
      </div>
    </Section>
  );
}
