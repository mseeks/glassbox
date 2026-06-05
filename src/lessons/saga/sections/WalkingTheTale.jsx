import Canto from '../components/Canto.jsx';
import Prose from '../components/Prose.jsx';
import Panel from '../components/Panel.jsx';
import SagaExecutorLab from '../labs/SagaExecutorLab.jsx';
import StepAnatomy from '../components/StepAnatomy.jsx';

// Canto IV — forward to commit, backward to undo. One run of a checkout saga;
// the reader chooses where the world breaks and watches the recovery, then meets
// the three kinds of step and the pivot that divides backward from forward.
export default function WalkingTheTale() {
  return (
    <Canto
      n="Canto IV"
      kicker="walking the tale"
      id="canto-4"
      title="Forward to commit, backward to undo"
      lede="One run of a checkout saga. Choose where the world breaks, and watch the chronicle write itself."
    >
      <Prose drop>
        <p>
          Four steps, each with its compensation already named beneath it. Let the saga succeed and
          it walks left to right, every local commit lighting in turn. Make a step fail and you will
          see the recovery: the chain stops, and the steps that had committed are unwound in
          reverse. Run it more than once, breaking it in different places.
        </p>
      </Prose>
      <div className="sg-rv">
        <SagaExecutorLab />
      </div>
      <Prose>
        <p>
          Two things repay attention. First, the failing step’s own local transaction just rolls
          back the ordinary way — it was a single ACID transaction and nothing committed there, so
          only the <em>earlier</em> steps need compensating; break the very first step and there is
          nothing to undo at all. This unwinding is called <em>backward recovery</em>.
        </p>
        <p>
          Second, the obvious worry: what about a step that cannot be undone — money already
          disbursed, an email already sent? A saga answers by giving each step a role, and by
          ordering them so the irreversible ones come last.
        </p>
      </Prose>
      <div className="sg-rv">
        <Panel title="figure · the three kinds of step">
          <StepAnatomy />
        </Panel>
      </div>
      <Prose>
        <p>
          Everything before the <span className="sg-gd">pivot</span> is compensatable. Everything
          after it is <span className="sg-lp">retriable</span> — it cannot be undone, so it is built
          to keep trying until it succeeds. That is <em>forward recovery</em>: past the point of no
          return, the saga does not walk back; it pushes through.
        </p>
      </Prose>
    </Canto>
  );
}
