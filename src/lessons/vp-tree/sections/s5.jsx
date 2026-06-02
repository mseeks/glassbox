import { Reveal } from '../../../shared/reveal.jsx';
import SecHead from '../components/SecHead.jsx';
import SearchLab from '../labs/SearchLab.jsx';

// §V · The Search — branch-and-bound: descend toward the query, hold the best,
// prune any region the geometry rules out. Exact, never a gamble.
export default function S5() {
  return (
    <section id="s5" className="vp-section">
      <Reveal base="rv">
        <SecHead
          rn="V · The Search"
          title="The guided hunt"
          lede="Descend toward the query. Hold on to the closest contact so far. Throw away any region that provably can't beat it."
        />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p>
          Now assemble the pieces. Searching for the nearest neighbour, we walk down the tree. At
          each vantage point we go toward the side the query falls on first, the most promising
          direction, and keep a running <span className="amber">best contact</span> and its range,
          written here as a shrinking circle.
        </p>
        <p>
          Then comes the payoff. Before descending the <em>other</em> side, we ask: using the
          triangle inequality, what is the closest anything over there could possibly be? If that
          lower bound already exceeds our current best, the entire region (all its contacts, all its
          sub-regions) <span className="coral">is pruned</span>, skipped without a single
          measurement. Step through it and watch the measurement counter stay far below N.
        </p>
      </Reveal>
      <Reveal base="rv">
        <SearchLab />
      </Reveal>
      <Reveal base="rv" className="vp-prose">
        <p style={{ marginTop: 22 }}>
          The guarantee is the quietly remarkable part: pruning is <strong>exact</strong>. It never
          gambles. A region is discarded only when the geometry proves nothing inside it can win, so
          the answer is always the true nearest neighbour, identical to brute force and reached at a
          fraction of the cost. On well-behaved data, that&apos;s a walk of about log&nbsp;N levels
          instead of N comparisons.
        </p>
      </Reveal>
    </section>
  );
}
