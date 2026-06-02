import { KeyRound, Binary, Layers, Scale } from 'lucide-react';
import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Plate from '../components/Plate.jsx';

const VARIANTS = [
  {
    icon: KeyRound,
    name: 'Sparse Merkle Tree',
    tag: 'proves absence',
    body: 'A tree over an enormous key space (say, 2²⁵⁶ slots) that is mostly empty. Because every empty subtree collapses to one cached hash, the whole vast emptiness costs almost nothing to commit to, and that is what lets you prove a key is NOT present. Absence, provably. That is a non-membership proof, not just a proof that the key exists. Vital for revocation lists and account states.',
  },
  {
    icon: Binary,
    name: 'Merkle Patricia Trie',
    tag: 'Ethereum state',
    body: "A Merkle tree married to a radix trie. The structure follows the key's digits, so it is at once an indexed map and a commitment. Ethereum leans on this. It commits its entire world state, every balance and every contract, to one such root per block.",
  },
  {
    icon: Layers,
    name: 'Merkle Mountain Range',
    tag: 'append-only',
    body: 'A forest of perfect trees that only ever grows on the right, needing no rebalancing on insert. Appends stay cheap. Better still, it gives consistency proofs: proof that one log is a strict extension of an earlier snapshot. Used in transparency logs and some chains.',
  },
  {
    icon: Scale,
    name: 'Verkle Tree',
    tag: 'the frontier',
    body: "Replaces each node's hash with a vector (polynomial) commitment. You no longer ship every sibling per level, so witnesses shrink dramatically. Ethereum is migrating to Verkle to make stateless clients practical. The price? Heavier cryptography.",
  },
];

// §9 — Specialized descendants of the plain binary tree.
export default function Variants() {
  return (
    <section className="mk-section">
      <SectionHeader id="variants" kicker="The Family" title="Specialized descendants" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          The plain binary tree is the seed. From it, real systems grow specialized forms that bend
          the same idea toward whatever a particular workload demands. They prove absence, index by
          key, append forever, or shrink the proofs themselves.
        </p>
      </Reveal>
      <Reveal base="mk-reveal">
        <div className="mk-grid-cards">
          {VARIANTS.map((v) => {
            const Ic = v.icon;
            return (
              <Plate key={v.name} style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Ic size={18} style={{ color: 'var(--patina)' }} />
                  <h3 className="mk-h3" style={{ margin: 0 }}>
                    {v.name}
                  </h3>
                </div>
                <span
                  className="mk-tag"
                  style={{
                    marginBottom: 12,
                    display: 'inline-block',
                    color: 'var(--gold)',
                    borderColor: 'var(--gold)',
                  }}
                >
                  {v.tag}
                </span>
                <p
                  style={{ margin: 0, fontSize: 15.5, color: 'var(--paper-dim)', lineHeight: 1.5 }}
                >
                  {v.body}
                </p>
              </Plate>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
