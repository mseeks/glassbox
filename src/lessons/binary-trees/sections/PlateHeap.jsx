import { Layers } from 'lucide-react';
import Plate from '../components/Plate.jsx';
import HeapLab from '../labs/HeapLab.jsx';

// Plate 08 — heaps and the array trick. Swap the invariant and one logical shape
// lives two ways: linked nodes (flexible, scattered) or a packed array (rigid,
// contiguous, fast).
export default function PlateHeap() {
  return (
    <Plate id="p8">
      <div className="bst-rv">
        <div className="bst-kicker">
          <Layers size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 08</span> · beyond search
          </span>
        </div>
        <h2 className="bst-h2">The same shape, a different body</h2>
        <div className="bst-prose">
          <p>
            Not every binary tree is a search tree. Swap the invariant — every parent smaller than
            its children — and you get a <span className="term">heap</span>: it doesn&apos;t sort,
            but the smallest item is always on top, which is exactly what a priority queue wants.
            And because a heap is a <em>complete</em> tree, you can drop the pointers entirely and
            store it in a flat array, the structure living purely in index arithmetic.
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <HeapLab />
      </div>
      <div className="bst-rv">
        <p className="bst-prose" style={{ marginTop: 22 }}>
          So one logical shape lives two ways: as linked nodes it&apos;s flexible but scattered
          across memory; as a packed array it&apos;s rigid but contiguous and fast. The
          representation is an engineering choice with real consequences.
        </p>
      </div>
    </Plate>
  );
}
