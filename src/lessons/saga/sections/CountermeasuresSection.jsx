import Canto from '../components/Canto.jsx';
import Prose from '../components/Prose.jsx';
import Callout from '../components/Callout.jsx';
import Countermeasures from '../components/Countermeasures.jsx';

// Canto VI — rebuilding isolation, deliberately. You cannot buy isolation back
// wholesale; you reintroduce just enough of it, exactly where an anomaly bites.
export default function CountermeasuresSection() {
  return (
    <Canto
      n="Canto VI"
      kicker="countermeasures"
      id="canto-6"
      title="Rebuilding isolation, deliberately"
      lede="You cannot buy isolation back wholesale. You reintroduce just enough of it, exactly where an anomaly would bite."
    >
      <Prose drop>
        <p>
          The craft of sagas is mostly here: a small repertoire of moves that restore a sliver of
          isolation at a single hot spot, without dragging back the locks and blocking you escaped.
          Four that recur:
        </p>
      </Prose>
      <div className="sg-rv">
        <Countermeasures />
      </div>
      <div className="sg-rv">
        <Callout kind="note" label="apply sparingly">
          Each is a countermeasure, not a cure — and each adds coupling or complexity. You reach for
          one only where a real anomaly would cause real harm, and you leave the rest of the saga
          lock-free.
        </Callout>
      </div>
    </Canto>
  );
}
