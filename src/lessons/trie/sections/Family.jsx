import { Reveal } from '../../../shared/reveal.jsx';
import LessonLink from '../../../shared/LessonLink.jsx';
import SectionHead from '../components/SectionHead.jsx';

// §VII — A field guide to the family of trie variants.
export default function Family() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead n="VII" kicker="The wider family" title="A field guide" />
      </Reveal>
      <Reveal as="p">
        The plain trie is the seed; production systems reshape it to fight the space-and-cache cost
        while keeping the prefix superpowers.
      </Reveal>
      <Reveal>
        <div className="guide">
          <div className="gcard">
            <div className="gt">Radix / PATRICIA trie</div>
            <div className="gtag">path-compressed</div>
            <p>
              Single-child corridors merge into multi-letter segments. The everyday workhorse. It is
              the structure inside many IP routing tables.
            </p>
          </div>
          <div className="gcard">
            <div className="gt">Ternary search trie</div>
            <div className="gtag">pointer-thrifty</div>
            <p>
              Each node keeps just three links (less, equal, greater), like a{' '}
              <LessonLink to="binary-trees">binary search tree</LessonLink> married to a trie. Far
              less memory than a slot-per-letter node, at a little extra depth.
            </p>
          </div>
          <div className="gcard">
            <div className="gt">DAWG</div>
            <div className="gtag">shared suffixes too</div>
            <p>
              A directed acyclic word graph merges shared <em>endings</em> as well as beginnings, so
              "running" and "jumping" can share one "-ing." Tiny, but read-only.
            </p>
          </div>
          <div className="gcard">
            <div className="gt">Adaptive radix tree (ART)</div>
            <div className="gtag">cache-aware</div>
            <p>
              Nodes come in sizes (4, 16, 48, 256 children) and grow as fan-out demands, staying
              dense and cache-friendly. A favourite for in-memory database indexes.
            </p>
          </div>
          <div className="gcard">
            <div className="gt">Succinct trie</div>
            <div className="gtag">near the theoretical floor</div>
            <p>
              The whole structure squeezed into a compact bitstring, approaching the minimum bits
              information theory allows. It works as a tiny on-disk filter that can still answer
              range questions.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
