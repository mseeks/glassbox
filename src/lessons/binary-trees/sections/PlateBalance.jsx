import { GitFork } from 'lucide-react';
import Plate from '../components/Plate.jsx';
import BalanceLab from '../labs/BalanceLab.jsx';

// Plate 06 — the dirty secret: balance is everything. A plain search tree has no
// mechanism forcing the bushy shape its speed assumes.
export default function PlateBalance() {
  return (
    <Plate id="p6">
      <div className="bst-rv">
        <div className="bst-kicker">
          <GitFork size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 06</span> · the catch
          </span>
        </div>
        <h2 className="bst-h2">The dirty secret: balance is everything</h2>
        <div className="bst-prose">
          <p>
            Every &ldquo;throws away half&rdquo; so far quietly assumed the tree is bushy — height
            near log n. But a plain search tree has <em>no mechanism</em> forcing that. Its shape is
            at the mercy of the order keys arrive in.
          </p>
          <p>
            Feed it already-sorted data and every key goes the same direction, building a leaning
            stick — and search collapses back to checking one item at a time. It&apos;s the
            difference between asking the smart question each time and lazily asking &ldquo;is it 1?
            is it 2? is it 3?&rdquo;
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <BalanceLab />
      </div>
      <div className="bst-rv">
        <p className="bst-pull">
          A useful search tree isn&apos;t one that&apos;s built right — it&apos;s one that{' '}
          <em>can&apos;t</em> go wrong. Which is the whole reason the next idea exists.
        </p>
      </div>
    </Plate>
  );
}
