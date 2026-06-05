import Canto from '../components/Canto.jsx';
import Prose from '../components/Prose.jsx';
import Panel from '../components/Panel.jsx';
import Callout from '../components/Callout.jsx';
import PullQuote from '../components/PullQuote.jsx';
import CompensationVsRollback from '../components/CompensationVsRollback.jsx';

// Canto III — a sequence, not an instant. The saga's opposite bet, and the one
// idea people almost always get wrong: a compensation is not a rollback.
export default function Inversion() {
  return (
    <Canto
      n="Canto III"
      kicker="the inversion"
      id="canto-3"
      title="A sequence, not an instant"
      lede="The saga makes the opposite bet — and rests on one idea people almost always get wrong."
    >
      <Prose drop>
        <p>
          So make the opposite bet. Instead of holding four services in a locked instant, let each
          commit its own local transaction — immediately, independently, lock-free — and pair every
          step with a <em>compensating transaction</em>: an action that undoes its effect after the
          fact. If all steps succeed, the saga has committed. If a step fails, you run the
          compensations for the steps that already committed, in reverse order, and the saga has
          cleanly aborted.
        </p>
        <p>
          The term is deliberate. It comes from a 1987 paper by Hector Garcia-Molina and Kenneth
          Salem, and <em>saga</em> is simply the literary word for a long tale told in episodes —
          with, when needed, a closing arc that narrates the undoing. The structure of the pattern
          is the structure of the story.
        </p>
      </Prose>
      <div className="sg-rv">
        <PullQuote>
          A saga keeps no locks and freezes no one. It accepts that the world will briefly be{' '}
          <b>half-finished</b> — and keeps, for every step, a way to make it whole again.
        </PullQuote>
      </div>
      <Prose>
        <p>
          Here is the idea almost everyone gets wrong on first contact. A compensation is{' '}
          <b className="sg-em" style={{ fontWeight: 700 }}>
            not
          </b>{' '}
          a rollback. A rollback rewinds time inside one database, erasing changes that never truly
          committed. A compensation is a brand-new forward transaction that{' '}
          <em>semantically negates</em> an earlier, fully committed one.
        </p>
      </Prose>
      <div className="sg-rv">
        <Panel title="figure · rollback is not compensation">
          <CompensationVsRollback />
        </Panel>
      </div>
      <div className="sg-rv">
        <Callout kind="key" label="why this matters">
          Because a compensation is real business logic, only you can write it. The engine cannot
          derive that the undo of “charge the card” is “issue a refund,” or that some steps — an
          email already sent — have no undo at all. Compensations are designed, not discovered.
        </Callout>
      </div>
    </Canto>
  );
}
