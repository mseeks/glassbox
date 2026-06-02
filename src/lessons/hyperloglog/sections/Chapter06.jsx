import Chapter from '../components/Chapter.jsx';
import MachineLab from '../labs/MachineLab.jsx';

// 06 · The whole instrument — the complete machine plus the two edge corrections
// (linear counting at low cardinality, 64-bit hashing at high).
export default function Chapter06() {
  return (
    <Chapter n="06" title="The whole instrument">
      <p className="lead">
        Hash to coin-flips, route to a register, keep each maximum run, combine with the harmonic
        mean. That is the complete machine.
      </p>
      <p>
        Two corrections handle the edges. At <strong>low cardinality</strong>, when many registers
        are still empty, the estimator switches to <em className="k">linear counting</em> —
        inferring the count from how many registers remain untouched, the way you'd estimate a crowd
        from how many seats are still empty. At <strong>very high cardinality</strong>, a 32-bit
        hash starts to collide; the modern <strong>HyperLogLog++</strong> (2013) simply uses a
        64-bit hash to push that ceiling past anything you'll meet, adds empirical bias correction
        in the awkward middle, and stores registers sparsely when the count is small. The instrument
        below runs the real algorithm.
      </p>
      <MachineLab />
      <p>
        Pour in a thousand or a hundred thousand, crank the duplicates — the error trace stays
        inside its band. <strong>Accuracy depends on the register count alone</strong>, never on the
        volume or the repetition of the stream. That invariance is what makes the structure
        trustworthy at scale.
      </p>
    </Chapter>
  );
}
