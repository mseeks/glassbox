import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import BuildLab from '../labs/BuildLab.jsx';

// §II — The route is the word. Embeds BuildLab.
export default function Idea() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead n="II" kicker="The core idea" title="The route is the word" />
      </Reveal>
      <Reveal as="p" className="lead">
        Picture a network of tracks leaving a single hub. Every step is labelled with a letter. To
        spell <span className="tcode">cat</span> you ride <span className="tcode">c</span>, then{' '}
        <span className="tcode">a</span>, then <span className="tcode">t</span>, and you have
        arrived. There is nothing "stored" at the destination except the fact that you reached it.{' '}
        <em>The path you took is the word</em>.
      </Reveal>
      <Reveal as="p">
        Here is the move that makes the whole structure pay off: <span className="tcode">cat</span>{' '}
        and <span className="tcode">car</span> ride the <em>same</em> track for{' '}
        <span className="tcode">c-a</span>, and only split apart at the third step, where the one
        letter that distinguishes them finally forces the road to fork. Words that begin alike share
        their road. Store a thousand words that all start with "re-" and you pay for that stretch of
        track exactly once.
      </Reveal>
      <Reveal>
        <BuildLab />
      </Reveal>
      <Reveal as="p">
        Notice the counter: the words "cost" far fewer stored letters than were typed, and the gap
        between the two only widens with every fresh word that happens to share a beginning with one
        already on the map. Sharing prefixes isn't a clever optimisation bolted on afterwards. It
        falls out of the design for free.
      </Reveal>
    </section>
  );
}
