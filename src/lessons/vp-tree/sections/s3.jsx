import { Reveal } from '../../../shared/reveal.jsx';
import SecHead from '../components/SecHead.jsx';
import BuildLab from '../labs/BuildLab.jsx';

// §III · The Idea — pick a vantage point, split by the median range, recurse.
export default function S3() {
  return (
    <section id="s3" className="vp-section">
      <Reveal base="rv">
        <SecHead
          rn="III · The Idea"
          title="File the ocean by range"
          lede="Pick one landmark. Sort everything by its distance from that landmark. Cut at the median. Then do it again, inside each half."
        />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p>
          Here is the move that turns a metric space into a tree. Choose any point to act as a{' '}
          <span className="amber">vantage point</span> — a landmark. Measure the range from it to
          every other point. Now split the rest into two groups by a single ringed boundary: those{' '}
          <em>inside</em> the ring (closer than the median range) and those <em>outside</em> it.
        </p>
        <div className="vp-defn">
          <b>Vantage point</b>A point chosen as a reference landmark. Every other point is filed by
          its distance from this landmark — a value that takes exactly one measurement to compute.
        </div>
        <p>
          Choosing the <strong>median</strong> range as the boundary is what keeps the tree honest:
          half the points land inside, half outside, every time. Recurse into each half — a fresh
          vantage point, a fresh ring — and you get a{' '}
          <span className="hl"> balanced binary tree</span>. Build it once in roughly N·log N work;
          from then on it’s only about log&nbsp;N levels deep. Step through the partition forming
          below.
        </p>
      </Reveal>
      <Reveal base="rv">
        <BuildLab />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p style={{ marginTop: 22 }}>
          Notice the boundaries are <em>spheres</em>, not walls. A coordinate-based tree slices
          space with straight cuts along axes; a vantage-point tree carves it into nested shells
          around landmarks — because shells are all you can describe when distance is your only
          instrument.
        </p>
      </Reveal>
    </section>
  );
}
