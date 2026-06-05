import Canto from '../components/Canto.jsx';
import Prose from '../components/Prose.jsx';
import Panel from '../components/Panel.jsx';
import Callout from '../components/Callout.jsx';
import TradeoffTable from '../components/TradeoffTable.jsx';

// Canto VIII — an honest ledger of costs. A saga is not a better 2PC; it is a
// different trade, worth making only with eyes open. The ledger, then the three
// costs easy to underestimate, then the rule of thumb.
export default function WhenToReach() {
  return (
    <Canto
      n="Canto VIII"
      kicker="when to reach for it"
      id="canto-8"
      title="An honest ledger of costs"
      lede="A saga is not a better two-phase commit. It is a different trade — and worth making only with eyes open."
    >
      <div className="sg-rv">
        <Panel title="ledger · 2PC vs saga">
          <TradeoffTable />
        </Panel>
      </div>
      <Prose>
        <p>
          Three costs are easy to underestimate. Every step and every compensation must be{' '}
          <em>idempotent</em> — safe to apply twice — because failures mean retries, and a refund
          that fires twice is its own incident. <em>Observability</em> gets harder: “where is order
          #4827 right now?” no longer has one answer; it is scattered across services and a log of
          events. And eventual consistency <em>leaks to the user</em> — a confirmation can arrive a
          breath before every service agrees the order is real.
        </p>
      </Prose>
      <div className="sg-rv">
        <Callout kind="key" label="the rule of thumb">
          Reach for a saga when the work is long-lived, spans services, and must stay available even
          as parts fail. Reach for a single local transaction whenever you still can — nothing beats
          letting one database keep the promise for you.
        </Callout>
      </div>
    </Canto>
  );
}
