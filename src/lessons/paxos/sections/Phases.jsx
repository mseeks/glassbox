import Section from '../components/Section.jsx';
import Walkthrough from '../components/Walkthrough.jsx';
import { scClear } from '../engine/index.js';

// §III — the two-phase mechanism: reserve (Prepare), then carve (Accept).
export default function Phases() {
  return (
    <Section id="phases" roman="III">
      <div className="pax-rv">
        <p className="pax-kicker">The mechanism</p>
        <h2 className="pax-h2">Two phases: reserve, then carve</h2>
        <p className="pax-prose">
          There are three roles, though one machine often plays several.{' '}
          <span className="pax-strong">Proposers</span> put decrees forward.{' '}
          <span className="pax-strong">Acceptors</span> — the legislators — vote and remember.{' '}
          <span className="pax-strong">Learners</span> simply find out the result.
        </p>
        <p className="pax-prose">
          A proposer works in two passes, and the first exists only to consult the witness before
          the second commits anything. <span className="pax-em">Phase 1, Prepare:</span> pick a
          ballot number that is unique and ever-rising, and ask a majority to promise to ignore
          lower ballots — and to report any decree they've already voted for.{' '}
          <span className="pax-em">Phase 2, Accept:</span> if a majority promised, ask them to vote
          the decree in. A majority of votes means it's <span className="pax-strong">chosen</span>,
          permanently.
        </p>
        <p className="pax-prose pax-soft">
          Step through a clean run below. Each legislator's card shows what ballot it has promised,
          what ballot it last voted under, and the decree it holds.
        </p>
      </div>
      <div className="pax-rv">
        <div className="pax-lab">
          <div className="pax-lab-h">
            <span className="pax-lab-t">A Decree Passes</span>
          </div>
          <p className="pax-lab-sub">One proposer, an empty chamber. Advance step by step.</p>
          <Walkthrough build={scClear} scenarioKey="clear" />
        </div>
      </div>
    </Section>
  );
}
