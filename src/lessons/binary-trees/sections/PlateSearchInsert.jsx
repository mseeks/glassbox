import { Plus } from 'lucide-react';
import Plate from '../components/Plate.jsx';
import InsertSearchLab from '../labs/InsertSearchLab.jsx';

// Plate 04 — one rule (the invariant), and search falls out of it. Insertion is
// the quiet twist: a search that ends in planting a new leaf.
export default function PlateSearchInsert() {
  return (
    <Plate id="p4">
      <div className="bst-rv">
        <div className="bst-kicker">
          <Plus size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 04</span> · the rule
          </span>
        </div>
        <h2 className="bst-h2">One rule, and search falls out of it</h2>
        <div className="bst-prose">
          <p>
            What turns a binary tree into a <em>search</em> tree is a single invariant, holding at
            every node: everything in the left subtree is smaller, everything in the right is
            larger. Search is then the guessing game — compare, go left or right — and each
            comparison <em>throws away an entire subtree</em>.
          </p>
          <p>
            Insertion is the quiet twist. Walk down as if searching; the moment you fall off into an
            empty slot, that slot is exactly where the key belongs, so you plant it there as a new
            leaf. The finished shape is a fossil record of the order the keys arrived in — remember
            that, because it&apos;s about to matter.
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <InsertSearchLab />
      </div>
    </Plate>
  );
}
