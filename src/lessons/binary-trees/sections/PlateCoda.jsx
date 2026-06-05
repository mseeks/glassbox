import { ChevronRight } from 'lucide-react';
import Plate from '../components/Plate.jsx';

// Plate 09 — the through-line, the loose end (deletion), and where to go next.
export default function PlateCoda() {
  return (
    <Plate id="p9">
      <div className="bst-rv">
        <div className="bst-kicker">
          <ChevronRight size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 09</span> · the through-line
          </span>
        </div>
        <h2 className="bst-h2">One question, asked well</h2>
        <div className="bst-prose">
          <p>
            Strip everything back and a binary tree is a single bet:{' '}
            <em>what can I test at each node so that one comparison throws away the most data?</em>{' '}
            For a search tree the test is &ldquo;smaller or larger&rdquo;; the payoff is a path no
            longer than the tree is tall; the catch is keeping it short. That tension — fast lookup,
            cheap change, and a shape that stays balanced — is the seed of an entire family of
            structures.
          </p>
          <p>
            One loose end worth naming: <span className="term">deletion</span>. Removing a leaf is
            trivial, and a node with one child just splices past itself — but removing a node with
            two children takes a small, elegant move: replace it with its{' '}
            <em>in-order successor</em>, the smallest key in its right subtree, the one value that
            can fill the gap without breaking the order on either side.
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <div
          className="bst-foot"
          style={{
            marginTop: 26,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: 'var(--blue-deep)',
          }}
        >
          where to go next
        </div>
        <div className="bst-next">
          <div className="bst-next-item">
            <h4>Red-black &amp; AVL trees, in full</h4>
            <p>
              The exact rebalancing cases and the rotation machinery in motion — the resolution to
              the balance cliffhanger here.
            </p>
          </div>
          <div className="bst-next-item">
            <h4>Heaps &amp; heapsort</h4>
            <p>
              Take the array trick further: the same sift operations give an in-place O(n log n)
              sort, and the priority queue behind Dijkstra and event simulation.
            </p>
          </div>
          <div className="bst-next-item">
            <h4>Deletion, properly</h4>
            <p>
              The three cases and the in-order-successor swap — the symmetric partner to the
              insertion you built here.
            </p>
          </div>
        </div>
      </div>
      <div className="bst-rv">
        <div className="bst-rule" />
        <p className="bst-foot" style={{ margin: '22px 0 60px', lineHeight: 1.7 }}>
          Colophon · A structural study of the binary tree in ten plates. Every tree, search,
          traversal, rotation, and heap is drawn by a real binary-search-tree and min-heap running
          live in the page — no figures are faked. Set in Syne, Newsreader, and JetBrains Mono on
          drafting vellum.
        </p>
      </div>
    </Plate>
  );
}
