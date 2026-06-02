import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { buildTree } from '../engine/index.js';
import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Plate from '../components/Plate.jsx';
import MerkleTreeSVG from '../components/MerkleTreeSVG.jsx';

// §11 — One shape, applied everywhere. A small sealed tree, then where to go next.
export default function Closing() {
  const data = useMemo(() => ['√', '∴', '§', '✦'], []);
  const levels = useMemo(() => buildTree(data), [data]);
  return (
    <section className="mk-section" style={{ paddingBottom: 90 }}>
      <SectionHeader id="closing" kicker="The Through-Line" title="One shape, applied everywhere" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          A Merkle tree is a single idea seen at every scale of the same fractal:{' '}
          <em>commit once at the top, prove anything below with a path.</em> Hash the data with
          structure, and the fingerprint that says "nothing changed" becomes the witness that says
          "this piece belongs."
        </p>
        <p>
          Everything followed from that. Tamper-evidence, because change is forced upward. Tiny
          proofs, because the tree's height is its logarithm. Cheap reconciliation, because
          mismatches localize. And one quiet rule that keeps it all honest: give your hash inputs
          types, so a leaf can never masquerade as a node.
        </p>
      </Reveal>

      <Reveal base="mk-reveal" style={{ margin: '10px auto 30px', maxWidth: 360 }}>
        <Plate style={{ padding: '24px 14px 12px' }}>
          <MerkleTreeSVG
            levels={levels}
            width={320}
            levelGap={78}
            rootSeal="ok"
            labelOf={(i) => data[i]}
            stateOf={(L) => (L === levels.length - 1 ? 'recompute' : 'idle')}
          />
        </Plate>
      </Reveal>

      <Reveal base="mk-reveal" className="mk-prose">
        <h3 className="mk-h3" style={{ marginBottom: 12 }}>
          Where to go next
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            [
              'Sparse Merkle Trees, in depth',
              'the elegant trick of proving a key is absent, and how authenticated maps are built.',
            ],
            [
              'Verkle trees & polynomial commitments',
              "the post-Merkle commitment schemes behind Ethereum's stateless future.",
            ],
            [
              'Merkle Mountain Ranges',
              'append-only logs and consistency proofs between snapshots in detail.',
            ],
            [
              'ZK-friendly hashes (Poseidon, Rescue)',
              'why SHA-256 is costly inside proof circuits, and the arithmetic hashes designed to replace it.',
            ],
            [
              'Authenticated data structures',
              'the general theory that Merkle trees are one instance of.',
            ],
          ].map(([t, d]) => (
            <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
              <ChevronRight
                size={14}
                style={{ color: 'var(--patina)', flexShrink: 0, position: 'relative', top: 3 }}
              />
              <div>
                <span style={{ color: 'var(--gold-bright)' }}>{t}</span>{' '}
                <span style={{ color: 'var(--paper-dim)' }}>— {d}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal base="mk-reveal">
        <div
          className="mk-mono"
          style={{
            textAlign: 'center',
            marginTop: 50,
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'var(--paper-faint)',
            textTransform: 'uppercase',
          }}
        >
          ◆ sealed under one root ◆
        </div>
      </Reveal>
    </section>
  );
}
