import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import Callout from '../components/Callout.jsx';
import SplitLab from '../labs/SplitLab.jsx';

// §V — the split, the centerpiece. The one ironclad rule: overflow splits, the
// median rises, and the tree only ever grows taller at the root. Renders the
// insert-and-split lab.
export default function Split() {
  return (
    <Section roman="V" kicker="The split" title="It grows at the root, never the leaves">
      <Reveal base="bt-rev">
        <p className="bt-p">
          One ironclad rule buys it. Every insert walks down to the right leaf and drops the key in.
          If it still fits, you&rsquo;re done. No rebalancing, nothing. If the leaf overflows, it{' '}
          <strong>splits</strong>: the median key rises into the parent, and the rest break into two
          half-full nodes. That promotion is itself an insertion into the parent, so a split can{' '}
          <span className="bt-em">cascade</span> upward.
        </p>
      </Reveal>
      <Reveal base="bt-rev">
        <p className="bt-lead">
          And here is the secret: the only moment the tree ever grows taller is when the root itself
          splits and a brand-new root is bolted on top. A B-tree never grows at the leaves. It grows
          at the root, and that one event lifts every leaf down by a level, all at once.
        </p>
      </Reveal>
      <Reveal base="bt-rev">
        <p className="bt-p">
          Think of the leaves as the floor where every tenant lives, and the root as the lobby you
          always enter through. An ordinary tree digs a sub-basement under whichever room gets
          crowded, so some tenants drift five floors down and others stay near the top. A B-tree
          forbids digging: a crowded room splits into two rooms on the{' '}
          <span className="bt-em">same</span> floor and posts a new entry in the directory upstairs.
          The building only ever gets taller by adding a fresh lobby, so every tenant stays exactly
          the same distance from the door. That equidistance isn&rsquo;t a step you perform.
          It&rsquo;s a fact you can&rsquo;t violate.
        </p>
      </Reveal>

      <SplitLab />

      <Callout title="Deletion is the same machine, run backward">
        Remove a key and if a node falls below half full it <span className="bt-em">borrows</span> a
        key from a fat sibling, or <span className="bt-em">merges</span> with a lean one and pulls a
        key down from the parent. That can cascade and, at the very top, collapse the root, making
        the whole tree one level shorter.
      </Callout>
    </Section>
  );
}
