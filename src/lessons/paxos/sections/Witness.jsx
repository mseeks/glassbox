import Section from '../components/Section.jsx';
import QuorumExplorer from '../labs/QuorumExplorer.jsx';

// §II — the one idea that does the real work: any two majorities share a member.
export default function Witness() {
  return (
    <Section id="witness" roman="II">
      <div className="pax-rv">
        <p className="pax-kicker">The engine</p>
        <h2 className="pax-h2">Any two majorities share a member</h2>
        <p className="pax-prose">
          Instead of demanding that <em>everyone</em> agree (which freezes if one member is
          missing), Paxos demands only a <span className="pax-strong">majority</span> — a quorum. A
          majority can be reached even when a minority is absent, so no single legislator can wedge
          the system.
        </p>
        <p className="pax-prose">
          That single swap raises one worry: if I poll one majority and you poll another, could we
          walk away with different decrees? The answer is no, and the reason is pure arithmetic.
        </p>
      </div>
      <div className="pax-rv">
        <QuorumExplorer />
      </div>
      <div className="pax-rv">
        <p className="pax-prose" style={{ marginTop: 18 }}>
          That shared member — the <span className="pax-strong">witness</span> — is the hinge of
          everything that follows. It remembers across rounds. If one round managed to lodge a
          decree in a majority, the witness inside every later majority will have seen it. Paxos, in
          one line, is a protocol for making sure the witness is consulted and obeyed before anyone
          may choose.
        </p>
      </div>
    </Section>
  );
}
