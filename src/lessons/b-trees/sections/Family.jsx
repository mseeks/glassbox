import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import FamilyGuide from '../labs/FamilyGuide.jsx';

// §VIII — the weave. One shape, seen through the other lenses in the project.
// Renders the family guide of four cross-references.
export default function Family() {
  return (
    <Section roman="VIII" kicker="The weave" title="One shape, seen through other lenses">
      <Reveal base="bt-rev">
        <p className="bt-p">
          The B-tree doesn&rsquo;t stand alone; it rhymes with nearly everything else in this
          project, and four of those threads are worth pulling here.
        </p>
      </Reveal>
      <FamilyGuide />
    </Section>
  );
}
