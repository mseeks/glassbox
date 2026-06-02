import { Reveal } from '../../../shared/reveal.jsx';
import SecHead from '../components/SecHead.jsx';
import CurseLab from '../labs/CurseLab.jsx';

// §VI · The Curse — in high dimensions distances concentrate, pruning dies, and
// the tree degrades to brute force. The honest failure mode.
export default function S6() {
  return (
    <section id="s6" className="vp-section">
      <Reveal base="rv">
        <SecHead
          rn="VI · The Curse"
          title="Where the pruning dies"
          lede="Every honest data structure has a place it breaks. For vantage-point trees, that place is high-dimensional space."
        />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p>
          The whole machine runs on <em>variety</em> in distances. Some near, some far, so a ring
          can meaningfully separate them. That variety is exactly what disappears as the number of
          dimensions grows. Pull the slider and watch the distribution of pairwise distances
          collapse toward a single value.
        </p>
      </Reveal>
      <Reveal base="rv">
        <CurseLab />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p style={{ marginTop: 22 }}>
          When nearly all pairs sit at the same distance, the query lands right on top of every
          shell at once. Neither side can be ruled out. So the search visits everything, and the
          tree quietly becomes the brute-force scan it set out to beat. That is the catch. It is
          also why exact structures lose their edge on the high-dimensional vectors behind image and
          text search, and why that world turns to <strong>approximate</strong> methods that trade a
          sliver of accuracy for speed.
        </p>
      </Reveal>
    </section>
  );
}
