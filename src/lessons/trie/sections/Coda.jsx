import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';

// §IX — Walk the map once more.
export default function Coda() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead n="IX" kicker="Coda" title="Walk the map once more" />
      </Reveal>
      <Reveal as="p" className="lead">
        A trie is the structure you reach for when the <em>shape</em> of your keys matters. You will
        ask more than "is this here?" You will want to know what starts like this, what comes next
        in order, and what the longest match is, and a hash table cannot tell you any of that. A
        trie can. It buys those answers by keeping the one thing a hash throws away, the sequence,
        made visible as a shared path you can walk.
      </Reveal>
      <Reveal as="p">
        The one sentence to carry off:{' '}
        <strong>
          store words as routes through a shared map, mark where each one ends, and prefix questions
          turn from searches into short walks.
        </strong>
      </Reveal>
      <Reveal as="p" style={{ marginTop: 8 }}>
        If you keep walking from here, three roads open up. First the compressed radix trie in full.
        Then the adaptive radix tree, which makes it fast on real hardware. Last come the succinct
        tries that shrink the whole thing to almost nothing.
      </Reveal>
      <Reveal>
        <hr className="rule" style={{ margin: '34px 0 18px' }} />
        <p style={{ fontSize: 13, color: 'var(--ink-dim)', margin: '0 0 50px' }} className="mono">
          An interactive lesson · drawn as an atlas of words · every route, every station, and every
          count above is computed from a live trie of nine words.
        </p>
      </Reveal>
    </section>
  );
}
