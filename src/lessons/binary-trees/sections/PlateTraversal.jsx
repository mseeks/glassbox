import { ListOrdered } from 'lucide-react';
import Plate from '../components/Plate.jsx';
import TraversalLab from '../labs/TraversalLab.jsx';

// Plate 05 — in-order = sorted. The tree you can cheaply insert into is, under
// the hood, the sorted sequence you wanted all along.
export default function PlateTraversal() {
  return (
    <Plate id="p5">
      <div className="bst-rv">
        <div className="bst-kicker">
          <ListOrdered size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 05</span> · the secret
          </span>
        </div>
        <h2 className="bst-h2">A sorted list, in disguise</h2>
        <div className="bst-prose">
          <p>
            There are three ways to walk a tree, but one is special.{' '}
            <span className="term">In-order</span> traversal — left, then the node, then right —
            visits the keys in perfect ascending order, as a direct consequence of the invariant.
            The tree you can cheaply insert into is, underneath, the sorted sequence you wanted all
            along.
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <TraversalLab />
      </div>
    </Plate>
  );
}
