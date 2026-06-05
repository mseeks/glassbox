import Canto from '../components/Canto.jsx';
import Prose from '../components/Prose.jsx';
import Panel from '../components/Panel.jsx';
import PullQuote from '../components/PullQuote.jsx';
import TheSplit from '../components/TheSplit.jsx';

// Canto I — atomicity loses its owner. Where the all-or-nothing guarantee comes
// from (one database's write-ahead log), and what splitting a system does to it.
export default function BrokenPromise() {
  return (
    <Canto
      n="Canto I"
      kicker="the broken promise"
      id="canto-1"
      title="Atomicity loses its owner"
      lede="Where the all-or-nothing guarantee actually comes from — and what splitting a system does to it."
    >
      <Prose drop>
        <p>
          A single database keeps a <em>write-ahead log</em>: a durable journal it appends to before
          it touches the real data. That journal is the secret of atomicity — the <b>A</b> in ACID,
          the promise that a group of changes either all happen or none do. To commit, the engine
          seals the journal; to abort, it discards it. One log, one authority, one place that
          decides the fate of the whole group.
        </p>
        <p>
          Break the monolith into an Order service, a Payment service, an Inventory service, a
          Shipping service — each with its own database and its own log — and that authority
          vanishes. There is no shared journal. There is no engine that can see all four at once. No
          statement you can write spans them. Four logs, four authorities, and no referee standing
          over them.
        </p>
      </Prose>
      <div className="sg-rv">
        <Panel title="figure · one log becomes four">
          <TheSplit />
        </Panel>
      </div>
      <div className="sg-rv">
        <PullQuote>
          Atomicity was never a law of nature. It was a <b>service the database provided</b> — and
          splitting the system handed the problem back to you.
        </PullQuote>
      </div>
    </Canto>
  );
}
