import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ScaleLab from '../labs/ScaleLab.jsx';

// §6 — Why proofs stay tiny. Named Mathematics (not Math) so the import in
// the lesson root doesn't shadow the global Math object.
export default function Mathematics() {
  return (
    <section className="mk-section">
      <SectionHeader id="math" kicker="The Mathematics" title="Why proofs stay tiny" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          The magic word is <em>logarithm</em>. Each level of the tree halves the number of nodes,
          so a tree over <code>N</code> leaves is only{' '}
          <span className="mk-code-inline">⌈log₂ N⌉</span> levels tall. A proof needs exactly one
          sibling per level. Its length is the height of the tree, not its width.
        </p>
        <p>
          Double the dataset and the proof grows by a <em>single</em> hash. One hash. That is the
          entire reason Merkle trees scale: proof cost is tied to the height of the structure, which
          creeps up one level at a time, while the data itself grows out along the width.
        </p>
      </Reveal>

      <Reveal base="mk-reveal">
        <ScaleLab />
      </Reveal>

      <Reveal base="mk-reveal" className="mk-prose" style={{ marginTop: 20 }}>
        <p>
          One assumption hides inside "log N": the tree must stay <em>balanced</em>. A lopsided
          tree, with new leaves chained off one side, degrades proofs toward <code>N</code>. So real
          systems keep balance by construction. That choice is the seed of several variants we'll
          meet shortly.
        </p>
      </Reveal>
    </section>
  );
}
