import { Ruler } from 'lucide-react';
import Plate from '../components/Plate.jsx';
import AnatomyLab from '../labs/AnatomyLab.jsx';
import MagicLab from '../labs/MagicLab.jsx';

// Plate 03 — anatomy and the source of the magic: a small recursive vocabulary,
// and the log₂ n relationship that is the entire source of the speed.
export default function PlateAnatomy() {
  return (
    <Plate id="p3">
      <div className="bst-rv">
        <div className="bst-kicker">
          <Ruler size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 03</span> · the shape
          </span>
        </div>
        <h2 className="bst-h2">Anatomy, and the source of the magic</h2>
        <div className="bst-prose">
          <p>
            The vocabulary is small. The top node is the <span className="term">root</span>; a node
            with no children is a <span className="term">leaf</span>; the links are{' '}
            <span className="term">edges</span>; the longest path from root to leaf is the
            tree&apos;s <span className="term">height</span>. And the definition is recursive — a
            tree is a node plus a left tree and a right tree — so every node is itself the root of a
            smaller tree.
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <AnatomyLab />
      </div>
      <div className="bst-rv">
        <MagicLab />
      </div>
    </Plate>
  );
}
