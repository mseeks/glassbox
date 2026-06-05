import { GitFork } from 'lucide-react';
import Plate from '../components/Plate.jsx';
import CompareLab from '../labs/CompareLab.jsx';

// Plate 01 — the tax: sorted OR editable, pick one. The frustration that makes
// trees worth inventing.
export default function PlateProblem() {
  return (
    <Plate id="p1">
      <div className="bst-rv">
        <div className="bst-kicker">
          <GitFork size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 01</span> · the problem
          </span>
        </div>
        <h2 className="bst-h2">Sorted, or editable. Pick one.</h2>
        <div className="bst-prose">
          <p>
            Before any tree, sit with the frustration that makes trees worth inventing. You have a
            collection and two things you do constantly: <span className="term">find</span> an item,
            and <span className="term">add</span> one.
          </p>
          <p>
            Lay the data in a flat line and you&apos;re forced to choose. Keep it <em>sorted</em> in
            an array and finding is wonderful — you can binary-search, checking the middle and
            halving the range each time. But adding means re-opening the order: find the slot, then
            shift everything after it. Use a <em>linked list</em> and adding is a single splice —
            but finding means walking the whole chain, because a list can&apos;t jump to its own
            middle.
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <CompareLab />
      </div>
      <div className="bst-rv">
        <p className="bst-pull">
          The dream is fast at both — and that dream is what a balanced binary search tree delivers,
          by branching instead of laying data in a line.
        </p>
      </div>
    </Plate>
  );
}
