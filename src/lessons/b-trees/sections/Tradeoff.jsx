import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import MirrorPanel from '../labs/MirrorPanel.jsx';

// §VII — the decision. The in-place split's price (random-write amplification)
// is exactly what buys unbeatable reads — the same tradeoff at opposite ends.
// Renders the B-tree vs LSM mirror panel.
export default function Tradeoff() {
  return (
    <Section roman="VII" kicker="The decision" title="A B-tree, or its mirror image">
      <Reveal base="bt-rev">
        <p className="bt-p">
          That in-place split has a price. A single unlucky insert into a full leaf rewrites two
          leaf pages and dirties the parent, each at its own scattered home on disk &mdash;
          precisely the <span className="bt-stampc">random-write amplification</span> that LSM trees
          sprint away from. Read it the other direction: those few, shallow levels that cost a
          B-tree on writes are exactly what give it unbeatable three-or-four-seek reads. Same
          tradeoff, opposite ends &mdash; which is why a storage engineer&rsquo;s first real
          decision is often just <span className="bt-em">which of these two.</span>
        </p>
      </Reveal>
      <MirrorPanel />
    </Section>
  );
}
