import { GitBranch, ScrollText, Feather, HardDrive } from 'lucide-react';
import { Reveal } from '../../../shared/reveal.jsx';

// §VIII — the family. Four cards that weave the B-tree into the rest of the
// project, each revealed on scroll with a staggered delay.
const FAMILY = [
  {
    icon: GitBranch,
    t: 'Merkle trees',
    b: 'Same fan-out tradeoff, different prize: there, wide branching is a mild cost (more siblings per proof); here, height is the whole bill, so we fatten nodes ruthlessly.',
  },
  {
    icon: ScrollText,
    t: 'Tries & radix trees',
    b: 'The other ordered index. A B-tree splits on count when a page fills, while a trie splits on shared prefix, and adaptive radix trees even fatten their nodes to fit a cache line. Same instinct, one level up.',
  },
  {
    icon: Feather,
    t: 'Bloom & cuckoo filters',
    b: 'They live inside these very engines: a tiny in-memory filter that says "definitely not here," letting an LSM skip a page read the B-tree would never have made.',
  },
  {
    icon: HardDrive,
    t: 'The memory hierarchy',
    b: 'One principle underneath it all: respect the unit of transfer. Pack a CPU cache line, then fill a disk page, and the structure that honors its block size is the one that wins. Always.',
  },
];

export default function FamilyGuide() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
        gap: 12,
        marginTop: 12,
      }}
    >
      {FAMILY.map((f, i) => (
        <Reveal
          key={i}
          base="bt-rev"
          delay={(i * 70) / 1000}
          className="bt-card"
          style={{ padding: '16px 16px 15px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <f.icon size={17} style={{ color: 'var(--oak-2)' }} />
            <span className="bt-display" style={{ fontWeight: 600, fontSize: 16 }}>
              {f.t}
            </span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>{f.b}</div>
        </Reveal>
      ))}
    </div>
  );
}
