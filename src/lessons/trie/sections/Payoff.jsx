import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Callout from '../components/Callout.jsx';
import PrefixLab from '../labs/PrefixLab.jsx';

// §IV — Three things you now get almost for free. Embeds PrefixLab.
export default function Payoff() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead n="IV" kicker="The payoff" title="Three things you now get almost for free" />
      </Reveal>
      <Reveal as="p" className="lead">
        <strong>One: prefix search.</strong> Travel to the node for a prefix, and every word that
        starts with it is sitting in the region below you. Autocomplete stops being a search and
        becomes a short walk plus "read off everything downstream."
      </Reveal>
      <Reveal>
        <PrefixLab />
      </Reveal>
      <Reveal as="p">
        <strong>Two: sorted order, at no extra cost.</strong> Visit each junction's outgoing tracks
        in alphabetical order as you walk the whole map, and the words come out perfectly sorted.
        You never ran a sort; the alphabetised tracks <em>are</em> the ordering.
      </Reveal>
      <Reveal as="p">
        <strong>Three: longest-prefix match.</strong> Walk down as far as the track allows,
        remembering the last word-station you passed. That last station is the longest stored word
        that begins your query. It is precisely the question an internet router asks of its routing
        table millions of times a second.
      </Reveal>
      <Reveal>
        <Callout title="the cost of a lookup">
          Following a word of length <span className="tcode">L</span> takes{' '}
          <span className="tcode">L</span> steps. Crucially, that's true whether the map holds ten
          words or ten million. A trie's lookup time depends on the length of the <em>word</em>, not
          on how many words you've stored. No hashing the whole key, no slot collisions to untangle.
        </Callout>
      </Reveal>
    </section>
  );
}
