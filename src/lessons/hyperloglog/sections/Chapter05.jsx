import Chapter from '../components/Chapter.jsx';
import HarmonicLab from '../labs/HarmonicLab.jsx';

// 05 · The harmonic mean — the 2007 swap that gives HyperLogLog its name and its
// accuracy: a mean dominated by the small values, immune to a freak run.
export default function Chapter05() {
  return (
    <Chapter n="05" title="The harmonic mean">
      <p className="lead">There is one subtlety left, and it is where the "Hyper" comes from.</p>
      <p>
        Average the registers the obvious way and the estimate stays at the mercy of a single
        unlucky register that happened to draw a monstrous run. The 1985 ancestor of this idea, and
        the 2003 "LogLog" refinement, used means that were merely good. Then came{' '}
        <strong>2007</strong>. HyperLogLog swapped in the <em className="k">harmonic mean</em> of
        the registers, and that one change is the entire leap in accuracy.
      </p>
      <p>
        The harmonic mean is dominated by the <em className="k">small</em> values and shrugs off the
        large ones. So a freak long run, the kind that would drag an ordinary average clear off
        toward infinity and ruin the whole estimate in one stroke, barely nudges it. Try it. Force a
        monster into one register below and compare the two means side by side.
      </p>
      <HarmonicLab />
      <p>
        Same formula, same registers. Only the kind of mean differs. Choosing the one that quietly
        ignores outliers is the whole trick that turns a rough sketch into a precise instrument.
      </p>
    </Chapter>
  );
}
