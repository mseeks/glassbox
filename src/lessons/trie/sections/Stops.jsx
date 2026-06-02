import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import SearchLab from '../labs/SearchLab.jsx';

// §III — A junction is not a destination. Embeds SearchLab.
export default function Stops() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead n="III" kicker="The terminal mark" title="A junction is not a destination" />
      </Reveal>
      <Reveal as="p" className="lead">
        Searching is now almost too simple: follow the track, letter by letter. But walking the path
        is only half the answer. You also have to know whether you've{' '}
        <em>arrived somewhere real</em>.
      </Reveal>
      <Reveal as="p">
        Consider <span className="tcode">car</span>, <span className="tcode">card</span>,{' '}
        <span className="tcode">care</span>, <span className="tcode">cart</span>. The point you
        reach after <span className="tcode">car</span> is a genuine word <em>and</em> a junction
        that keeps going to three others. So a node needs one extra bit, a mark that says "a word
        ends here," and that mark is the whole difference between a path that merely exists and a
        path that spells a real word. Reaching a node tells you the route is there. The mark tells
        you a word ends on it. Three different things can happen when you trace a query, and the gap
        between two of them is exactly what that mark is for.
      </Reveal>
      <Reveal>
        <SearchLab />
      </Reveal>
    </section>
  );
}
