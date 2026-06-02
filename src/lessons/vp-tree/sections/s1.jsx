import { Reveal } from '../../../shared/reveal.jsx';
import SecHead from '../components/SecHead.jsx';
import BruteForceLab from '../labs/BruteForceLab.jsx';

// §I · The Problem — nearest-neighbour search in a metric space, and the
// brute-force baseline the tree exists to beat.
export default function S1() {
  return (
    <section id="s1" className="vp-section">
      <Reveal base="rv">
        <SecHead
          rn="I · The Problem"
          title="The ocean you can't see"
          lede="A sonar operator never sees the sea. They know one thing about each contact: how far away it echoes. That is exactly the world this data structure lives in."
        />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p>
          Picture a screen full of contacts. You have a <span className="hl">query</span>, a
          position you care about, and you want the single closest contact to it. The catch shapes
          everything. You have no map and no coordinates. The only operation available is a{' '}
          <span className="ping">range measurement</span>: given two things, how far apart are they.
        </p>
        <div className="vp-defn">
          <b>Nearest-neighbour search</b>Among a set of points, find the one closest to a given
          query, where "closest" means smallest distance under some distance function.
        </div>
        <div className="vp-defn">
          <b>Metric space</b>A set of points plus a distance function that behaves sensibly.
          Distances are never negative. The distance from a thing to itself is zero, and distance is
          symmetric. Crucially, it obeys the triangle inequality. Coordinates optional; only
          distances are required.
        </div>
        <p>
          The obvious method is to measure the range to every contact and keep the smallest. It
          always works. It is also the baseline we want to beat. Run it below and watch the cost:
          with <span className="hl">N</span> contacts, every query costs{' '}
          <span className="hl">N</span> measurements. Every time.
        </p>
      </Reveal>
      <Reveal base="rv">
        <BruteForceLab />
      </Reveal>
    </section>
  );
}
