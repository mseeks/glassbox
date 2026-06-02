import Chapter from '../components/Chapter.jsx';
import StochasticLab from '../labs/StochasticLab.jsx';

// 04 · A bank of registers — split the hash into m independent sub-streams and
// average; error falls as 1.04/√m.
export default function Chapter04() {
  return (
    <Chapter n="04" title="A bank of registers">
      <p className="lead">
        The fix for a noisy estimate is the oldest one in statistics: run many independent trials
        and average them.
      </p>
      <p>
        But each item can only be hashed once. The trick is to <strong>split the hash</strong>. Use
        the first few bits to choose one of <em className="k">m</em> registers, and the remaining
        bits to compute that register's run. One stream becomes many. It shatters into m independent
        sub-streams, each watching its own slice, each keeping its own maximum run, so now there are
        m estimates to combine instead of a single fragile one and the noise falls steadily as you
        add more. That is the whole move.
      </p>
      <p>
        The resulting accuracy is governed by a single clean law: the relative error is about{' '}
        <strong>1.04 divided by the square root of m</strong>. More registers, tighter estimate.
        Step one item through to see the bits split off and route to their register, then open the
        stream and watch the whole bank fill at once.
      </p>
      <StochasticLab />
      <p>
        Sixteen thousand registers is the common production size, and it pins the error near eight
        tenths of a percent. The cost is tiny. You pay only for the registers themselves, each a
        handful of bits.
      </p>
    </Chapter>
  );
}
