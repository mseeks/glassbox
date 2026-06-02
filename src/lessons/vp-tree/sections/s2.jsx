import { Reveal } from '../../../shared/reveal.jsx';
import SecHead from '../components/SecHead.jsx';

// §II · No Order — why an ordinary search tree can't help: a metric space has
// no total order to split on.
export default function S2() {
  return (
    <section id="s2" className="vp-section">
      <Reveal base="rv">
        <SecHead
          rn="II · No Order"
          title="Why a search tree can't save you"
          lede="The trees you already know depend on a thing a metric space simply doesn't have."
        />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p>
          Why not just sort the contacts and binary-search, the way a dictionary or a balanced tree
          does? Because those structures rest on a <strong>total order</strong>: the ability to say,
          for any two items, that one comes "before" the other, consistently. Numbers have it. Words
          have it. That single guarantee is what lets a search tree split its data into "less" and
          "greater" and discard half at every step.
        </p>
        <div className="vp-defn">
          <b>Total order</b>A rule that lines every element up in a single sequence: for any two,
          one is definitively before the other, and the ordering never contradicts itself.
        </div>
        <p>
          A metric space has no such line. Distance is a fact about <em>pairs</em>, not a ranking of
          individuals. Three contacts can sit at mutual ranges of 10, 10, and 10. Perfectly
          consistent, and yet there is no "middle" one to split on. You can't sort what was never on
          a line. So we need a way to divide points that asks only the one question the space can
          answer: <span className="ping">how far apart are these two?</span>
        </p>
      </Reveal>
      <Reveal base="rv" className="vp-pull">
        <span className="amber">Distance ranks pairs, not points.</span> There is no "middle" to cut
        at. So we must build our own.
      </Reveal>
    </section>
  );
}
