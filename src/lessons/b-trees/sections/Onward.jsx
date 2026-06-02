import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import Callout from '../components/Callout.jsx';

// §IX — where this goes next. Three directions (concurrency, write-optimized
// B-trees, deletion merge) and the answer to the question posed by the split
// lab. Pure prose, no lab.
export default function Onward() {
  return (
    <Section roman="IX" kicker="Onward" title="Where this goes next">
      <Reveal base="bt-rev">
        <p className="bt-p">
          Three directions from here. <strong>Concurrency:</strong> how do many threads split and
          merge one tree without corrupting it &mdash; a technique called{' '}
          <span className="bt-em">latch crabbing</span>, where you release a parent&rsquo;s lock
          only once you&rsquo;re sure the child won&rsquo;t split into it.{' '}
          <strong>Write-optimized B-trees</strong> (B&#949;-trees and fractal trees) buffer writes
          inside the nodes to claw back the LSM&rsquo;s advantage without giving up the reads. And
          the <strong>deletion merge</strong> in full, if you want the symmetric move made concrete.
        </p>
      </Reveal>
      <Callout title="The question from before">
        Why did filing 80 make the tree <span className="bt-em">wider</span> but not{' '}
        <span className="bt-em">taller</span>? Because only a full root, splitting, can add a floor.
        Filing 80 split a leaf and sent a key up &mdash; but the root still had room to absorb it.
        The tree grows at the top, and only when the top itself is full.
      </Callout>
    </Section>
  );
}
