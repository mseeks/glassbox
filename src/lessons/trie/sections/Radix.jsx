import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import CompressLab from '../labs/CompressLab.jsx';

// §VI — Collapse the corridors. The first refinement: the radix trie.
export default function Radix() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead n="VI" kicker="The first refinement" title="Collapse the corridors" />
      </Reveal>
      <Reveal as="p" className="lead">
        If a stretch of track has no branches and no stations along it, there are no decisions to
        make while traversing it. So why store it as many separate steps? Glue each such run into a
        single segment labelled with the whole substring. This is the <strong>radix trie</strong>{' '}
        (also called PATRICIA), and it's the standard first move toward a trie you'd actually ship.
      </Reveal>
      <Reveal>
        <CompressLab />
      </Reveal>
      <Reveal as="p">
        Same words, same paths, same answers. There are just fewer nodes to allocate and fewer
        pointers to chase. The structure now spends nodes only where something genuinely{' '}
        <em>branches</em>, which is the only place a node was ever earning its keep.
      </Reveal>
    </section>
  );
}
