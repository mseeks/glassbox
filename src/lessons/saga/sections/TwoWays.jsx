import Canto from '../components/Canto.jsx';
import Prose from '../components/Prose.jsx';
import Callout from '../components/Callout.jsx';
import ChoreographyOrchestration from '../labs/ChoreographyOrchestration.jsx';

// Canto VII — who decides what happens next. Choreography (events on a shared
// bus, no conductor) vs orchestration (one durable orchestrator), plus the two
// truths underneath: durable execution and the transactional-outbox trap.
export default function TwoWays() {
  return (
    <Canto
      n="Canto VII"
      kicker="two ways to conduct"
      id="canto-7"
      title="Who decides what happens next"
      lede="A saga still needs coordination — something must know that payment follows the order. There are two ways to provide it."
    >
      <Prose drop>
        <p>
          In <em>choreography</em>, there is no conductor: each service listens for events on a
          shared bus and emits its own in reply, and the saga is the chain reaction. In{' '}
          <em>orchestration</em>, a single orchestrator issues each command, waits for the reply,
          and decides the next move. Toggle between them — the same checkout, conducted two ways.
        </p>
      </Prose>
      <div className="sg-rv">
        <ChoreographyOrchestration />
      </div>
      <Prose>
        <p>
          Two truths sit underneath that toggle. The orchestrator must be <em>durable</em>: it
          records its progress so that if it crashes mid-saga it resumes from exactly where it
          stopped — the guarantee that <span className="sg-lp">durable-execution</span> engines like
          Temporal, Cadence, and AWS Step Functions exist to provide.
        </p>
        <p>
          And choreography hides a trap. A service must update its database <em>and</em> publish its
          event atomically — but those are two different systems, and we already rejected 2PC
          between them. A crash in the gap leaves the saga stuck. The standard escape is the{' '}
          <em>transactional outbox</em>: write the event into the very same database transaction as
          the state change, then relay it to the bus afterward.
        </p>
      </Prose>
      <div className="sg-rv">
        <Callout kind="note" label="the dual-write trap">
          “Update my row, then publish my event” is not atomic — a failure between the two is a
          silent inconsistency. The outbox folds the event into the row’s own transaction, so they
          commit or fail as one.
        </Callout>
      </div>
    </Canto>
  );
}
