import Chapter from '../components/Chapter.jsx';
import HarmonicLab from '../labs/HarmonicLab.jsx';

// 05 · The harmonic mean — the 2007 swap that gives HyperLogLog its name and its
// accuracy: a mean dominated by the small values, immune to a freak run.
export default function Chapter05() {
  return (
    <Chapter n="05" title="The harmonic mean">
      <p className="lead">There is one subtlety left, and it is where the “Hyper” comes from.</p>
      <p>
        Averaging the registers the obvious way still leaves the estimate at the mercy of a single
        unlucky register that happened to draw a monstrous run. The 1984 ancestor of this idea, and
        the 2003 “LogLog” refinement, used means that were merely good. In{' '}
        <strong>2007, HyperLogLog</strong> swapped in the <em className="k">harmonic mean</em> of
        the registers — and that one change is the entire leap in accuracy.
      </p>
      <p>
        The harmonic mean is dominated by the <em className="k">small</em> values and shrugs off the
        large ones. So a freak long run, which would drag an ordinary average toward infinity,
        barely moves it. Force a monster into one register below and compare the two means side by
        side.
      </p>
      <HarmonicLab />
      <p>
        Same formula, same registers — only the kind of mean differs. Choosing the one that ignores
        outliers is the whole trick that turns a rough sketch into a precise instrument.
      </p>
    </Chapter>
  );
}
