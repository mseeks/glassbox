import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import NodeAnatomy from '../labs/NodeAnatomy.jsx';

// §II — anatomy. What lives inside a node: sorted keys, N+1 gaps, one child
// pointer per gap. Keys are signposts, not data. Renders the node-anatomy lab.
export default function Anatomy() {
  return (
    <Section roman="II" kicker="Anatomy" title="What lives inside a node">
      <Reveal base="bt-rev">
        <p className="bt-p">
          Picture one node: sorted keys, say 17, 42, and 88, with the gaps between them.{' '}
          <strong>N keys make N+1 gaps</strong>. Each gap owns a single child pointer. The keys
          themselves aren&rsquo;t the data. They&rsquo;re <span className="bt-blue">signposts</span>
          , telling you which drawer to open next, like a phone book&rsquo;s thumb tabs but with
          hundreds of tabs per page instead of twenty-six.
        </p>
      </Reveal>
      <NodeAnatomy />
    </Section>
  );
}
