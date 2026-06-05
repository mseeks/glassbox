import { Search } from 'lucide-react';
import Plate from '../components/Plate.jsx';
import GuessLab from '../labs/GuessLab.jsx';

// Plate 02 — the guessing game, frozen into a shape. A binary search tree is the
// higher-or-lower game pre-built into a structure.
export default function PlateGuessing() {
  return (
    <Plate id="p2">
      <div className="bst-rv">
        <div className="bst-kicker">
          <Search size={14} aria-hidden="true" />
          <span>
            <span className="n">Plate 02</span> · the idea
          </span>
        </div>
        <h2 className="bst-h2">A game, frozen into a shape</h2>
        <div className="bst-prose">
          <p>
            Here is the mental image to hang everything on. In the number-guessing game, a good
            player halves the unknown with every &ldquo;higher or lower&rdquo; — about seven guesses
            to corner any number from one to a hundred. That halving <em>is</em> binary search.
          </p>
          <p>
            A <span className="term">binary search tree</span> is that game pre-built and frozen
            into a structure. Every node is one question; <em>go left</em> means lower,{' '}
            <em>go right</em> means higher. The tree doesn&apos;t store your data in a line — it
            stores the <em>procedure for finding</em> anything in it.
          </p>
        </div>
      </div>
      <div className="bst-rv">
        <GuessLab />
      </div>
      <div className="bst-rv">
        <p className="bst-prose" style={{ marginTop: 22 }}>
          Notice what the game quietly requires: you can only ask &ldquo;higher or lower&rdquo; if
          the items are <em>ordered</em>. That single assumption — a total order — is what the whole
          structure rents its power from.
        </p>
      </div>
    </Plate>
  );
}
