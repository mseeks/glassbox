import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import Callout from '../components/Callout.jsx';

// §IX — the one idea to carry away, then where to go next. The synthesis box
// names what a B-tree *is*; the numbered list points at three real directions
// (concurrency, write-optimized variants, deletion merge). Pure prose, no lab.
const NEXT = [
  [
    'i',
    'Concurrency',
    'Many threads splitting and merging one tree without corrupting it. The trick is latch crabbing: you release a parent’s lock only once you’re sure the child won’t split into it.',
  ],
  [
    'ii',
    'Write-optimized variants',
    'Bε-trees and fractal trees buffer writes inside the nodes, clawing back the LSM-tree’s write advantage without giving up the B-tree’s reads.',
  ],
  [
    'iii',
    'Deletion, in full',
    'The symmetric move to splitting: when a node falls below half-full, it borrows a key from a sibling, or pulls one down from the parent and merges. Trees shrink from the top, too.',
  ],
];

export default function Onward() {
  return (
    <Section roman="IX" kicker="Onward" title="Where this goes next">
      <Reveal base="bt-rev">
        <div className="bt-coda">
          <p className="bt-kicker">The one idea</p>
          <p className="bt-p bt-coda-lead">
            A B-tree is one decision held to its limit:{' '}
            <span className="bt-em">fill a node until it fills a disk page, then split</span>. Match
            the branching factor to the hardware, and everything else follows &mdash; the few short
            hops to any record, the ordered leaves that make a range a single walk, the tree that
            stays balanced no matter the order things arrive. One forklift trip per node, and you
            always load it full.
          </p>
        </div>
      </Reveal>

      <Reveal base="bt-rev">
        <p className="bt-kicker bt-coda-next-label">Where to go next</p>
        <div className="bt-next">
          {NEXT.map(([n, t, d]) => (
            <div className="bt-next-item" key={n}>
              <span className="bt-next-n">{n}</span>
              <div>
                <span className="bt-next-t">{t}</span>
                <p className="bt-next-d">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Callout title="Why most inserts widen but don't deepen">
        Back in the split lab, only the key that overflowed a{' '}
        <span className="bt-em">full root</span> ever added a floor. Every other insert split a leaf
        and sent its median up, but the root still had room to absorb it &mdash; so the tree grew{' '}
        <span className="bt-em">wider</span>, not <span className="bt-em">taller</span>. A B-tree
        gains height only at the top, and only when the top itself is full.
      </Callout>
    </Section>
  );
}
