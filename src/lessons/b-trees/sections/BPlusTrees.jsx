import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import RangeLab from '../labs/RangeLab.jsx';

// §VI — the variant that ships. B+ trees keep all data in the leaves and thread
// them into a linked list, so a range scan locates once then walks. Renders the
// range-scan lab.
export default function BPlusTrees() {
  return (
    <Section roman="VI" kicker="The variant that ships" title="B+ trees and the range scan">
      <Reveal base="bt-rev">
        <p className="bt-p">
          Real databases ship a twist: the <strong>B+ tree</strong>. Keep all the actual data in the
          leaves, leaving the internal nodes as pure signposts, then thread the leaves together in a
          linked list. Now a range scan stops climbing the tree: you locate the leaf where the range
          begins, then simply walk the chain along the linked leaves all the way to the end of the
          range. One descent, then a walk.
        </p>
      </Reveal>
      <RangeLab />
    </Section>
  );
}
