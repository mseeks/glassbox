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
        ask more than "is this here?" You will ask "what starts like this?", "what comes next in
        order?", "what's the longest match?" It buys those answers by keeping what a hash throws
        away: the sequence, made visible as a shared path.
      </Reveal>
      <Reveal as="p">
        The one sentence to carry off:{' '}
        <strong>
          store words as routes through a shared map, mark where each one ends, and prefix questions
          turn from searches into short walks.
        </strong>
      </Reveal>
      <Reveal as="p" style={{ marginTop: 8 }}>
        If you keep walking from here, the natural next steps are the compressed radix trie in full,
        then the adaptive radix tree that makes it fast on real hardware, and finally the succinct
        tries that shrink it to almost nothing.
      </Reveal>
      <Reveal>
        <hr className="rule" style={{ margin: '34px 0 18px' }} />
        <p style={{ fontSize: 13, color: 'var(--ink-dim)', margin: '0 0 50px' }} className="mono">
          Drawn as an atlas of words · every route, station, and count above is computed from a live
          trie of nine words.
        </p>
      </Reveal>
    </section>
  );
}
