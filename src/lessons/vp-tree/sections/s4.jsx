import { Reveal } from '../../../shared/reveal.jsx';
import SecHead from '../components/SecHead.jsx';
import TriangleLab from '../labs/TriangleLab.jsx';

// §IV · Triangle Rule — the triangle inequality turns two known ranges into a
// guaranteed lower bound. That bound is why pruning works.
export default function S4() {
  return (
    <section id="s4" className="vp-section">
      <Reveal base="rv">
        <SecHead
          rn="IV · Triangle Rule"
          title="The one rule that lets you skip"
          lede="Knowing two sides of a triangle traps the third inside a band. That trap is the entire reason a vantage-point tree is fast."
        />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p>
          A balanced tree alone doesn&apos;t make search fast. You could still end up walking every
          branch. The speed comes from a single geometric fact, the{' '}
          <span className="ping">triangle inequality</span>: no side of a triangle can exceed the
          sum of the other two.
        </p>
        <div className="vp-defn">
          <b>Triangle inequality</b>For any three points, the distance between two of them is at
          most the sum of their distances to the third, and at least the absolute difference.
          Formally, |a − b| ≤ d ≤ a + b.
        </div>
        <p>
          Why does that matter? During a search we always know two ranges: from our query to the
          current landmark, and (stored at build time) from that landmark out to a whole region of
          contacts. From those two known ranges the inequality manufactures a{' '}
          <strong> guaranteed lower bound</strong> on how close anything in that region could
          possibly be. A floor. Nothing in there can be nearer than that. Drag the three points and
          watch the band tighten and widen.
        </p>
      </Reveal>
      <Reveal base="rv">
        <TriangleLab />
      </Reveal>
    </section>
  );
}
