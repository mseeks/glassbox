import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ProofLab from '../labs/ProofLab.jsx';

// §5 — The killer feature: an inclusion proof the size of a whisper.
export default function Proof() {
  return (
    <section className="mk-section">
      <SectionHeader id="proof" kicker="The Killer Feature" title="A proof the size of a whisper" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          Here is the move that makes Merkle trees everywhere. To convince someone that one item is
          in the tree, when all they trust is the root, you don't send the dataset. You send the
          item plus a short <em>authentication path</em>: one sibling hash per level.
        </p>
        <p>
          Pick any leaf below. The <span style={{ color: 'var(--gold-bright)' }}>gold</span> nodes
          are the siblings handed to the verifier; the{' '}
          <span style={{ color: 'var(--patina)' }}>green</span> path is what they recompute,
          climbing one level at a time until they reach a root of their own. Does it match the
          trusted root? Then the item is proven. They never touched anything else in the tree.
        </p>
      </Reveal>

      <Reveal base="mk-reveal">
        <ProofLab />
      </Reveal>

      <Reveal base="mk-reveal" className="mk-prose" style={{ marginTop: 22 }}>
        <p>
          Notice what the verifier never saw: the other seven transactions. They learned that
          <em> their</em> item is in a tree of eight, holding only three hashes and the root. The
          dataset could have a million leaves and the proof would still be twenty hashes. This is
          the logarithm at work. It is why a light wallet, a transparency log, or a
          content-addressed store can verify membership without ever downloading the world.
        </p>
        <div className="mk-marginalia">
          The asymmetry to feel: the verifier does a handful of cheap hashes. To <em>forge</em> a
          proof, an attacker would have to find a hash collision, which is computationally
          infeasible. Cheap to verify, astronomically expensive to fake. That gap is the whole
          security model.
        </div>
      </Reveal>
    </section>
  );
}
