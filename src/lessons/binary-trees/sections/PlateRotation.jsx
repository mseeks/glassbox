import { RotateCcw } from 'lucide-react';
import Plate from '../components/Plate.jsx';
import RotationLab from '../labs/RotationLab.jsx';

// Plate 07 — rotations and self-balancing. The rotation reshapes for height
// without disturbing the in-order ordering; AVL and red-black trees bolt that on.
export default function PlateRotation() {
  return (
    <Plate id="p7">
      <div className="bst-rv">
        <div className="bst-kicker">
          <RotateCcw size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 07</span> · the fix
          </span>
        </div>
        <h2 className="bst-h2">Rebalancing without breaking the order</h2>
        <div className="bst-prose">
          <p>
            The cure is the <span className="term">rotation</span>: a small, local reshuffle that
            shortens a tall branch <em>without disturbing the in-order ordering</em>. That clause is
            the whole trick — you can restructure for height any time, and the sorted sequence the
            tree represents comes out identical.
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <RotationLab />
      </div>
      <div className="bst-rv">
        <p className="bst-prose" style={{ marginTop: 22 }}>
          Two schemes bolt this onto the search tree so it can never degenerate. You don&apos;t need
          the case-by-case math to hold the shapes:
        </p>
        <table className="bst-tbl">
          <thead>
            <tr>
              <th>scheme</th>
              <th>promise</th>
              <th>trades for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="m">AVL tree</td>
              <td>subtree heights differ by ≤ 1 at every node — strictly balanced</td>
              <td>fastest lookups; a little more rotation work on writes</td>
            </tr>
            <tr>
              <td className="m">red-black tree</td>
              <td>height stays under twice log n — looser, via node &ldquo;colors&rdquo;</td>
              <td>fewer rotations; the workhorse for write-heavy use</td>
            </tr>
          </tbody>
        </table>
        <p className="bst-prose" style={{ marginTop: 16 }}>
          The red-black tree is quietly everywhere: it backs the ordered map and set in many
          standard libraries and lives inside operating-system kernels. Reach for an ordered map and
          you are almost certainly using a self-balancing binary search tree.
        </p>
      </div>
    </Plate>
  );
}
