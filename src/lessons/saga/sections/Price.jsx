import Canto from '../components/Canto.jsx';
import Prose from '../components/Prose.jsx';
import PullQuote from '../components/PullQuote.jsx';
import LostUpdateLab from '../labs/LostUpdateLab.jsx';

// Canto V — the letter the saga quietly drops. Atomicity was the cheap one to
// give back; the expensive loss is isolation, the I in ACID, shown with the
// last seat on a flight.
export default function Price() {
  return (
    <Canto
      n="Canto V"
      kicker="the price"
      id="canto-5"
      title="The letter the saga quietly drops"
      lede="Atomicity, it turns out, was the cheap one to give back. The expensive loss is hidden in a single word."
    >
      <Prose drop>
        <p>
          That word is <em>immediately</em>. Because each step commits and becomes visible at once,
          a second saga can read — and act on — a first saga’s half-finished work. The database term
          for stopping concurrent transactions from seeing each other’s unfinished changes is{' '}
          <em>isolation</em>, the <b>I</b> in ACID. Across its steps, a saga has none of it. Every
          anomaly that isolation exists to prevent — dirty reads, lost updates — walks back in.
        </p>
        <p>
          And you cannot simply turn isolation up. Those familiar levels live inside a single
          database’s concurrency control; here there is no concurrency control spanning the services
          to turn up. A saga is, structurally and permanently, <em>read-uncommitted</em> across its
          entire length. See it happen with the last seat on a flight.
        </p>
      </Prose>
      <div className="sg-rv">
        <LostUpdateLab />
      </div>
      <div className="sg-rv">
        <PullQuote>
          Atomicity you can rebuild with compensations. Isolation you must rebuild <b>by hand</b> —
          one anomaly, one countermeasure, at a time.
        </PullQuote>
      </div>
    </Canto>
  );
}
