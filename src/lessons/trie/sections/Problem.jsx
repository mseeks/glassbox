import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';
import Callout from '../components/Callout.jsx';

// §I — The question a plain dictionary can't answer. Pure prose; sets up
// why the structure (a trie) is needed at all.
export default function Problem() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead
          n="I"
          kicker="The motivation"
          title="The question a plain dictionary can't answer"
        />
      </Reveal>
      <Reveal as="p" className="lead">
        Suppose you must store a lot of words and answer questions about them. The obvious tool is a{' '}
        <strong>hash table</strong>. It scatters each word into a slot computed from its letters,
        giving near-instant "is this exact word present?"
      </Reveal>
      <Reveal as="p">
        That scattering is the whole point, and also the whole problem. A good hash{' '}
        <em>deliberately</em> destroys any relationship between words:{' '}
        <span className="tcode">car</span>, <span className="tcode">card</span>, and{' '}
        <span className="tcode">cat</span> land in three unrelated slots with nothing connecting
        them. Perfect when all you ask is "present or not." Useless the moment you ask anything
        about <em>shape</em>:
      </Reveal>
      <Reveal>
        <div style={{ margin: '4px 0 20px', paddingLeft: 18, borderLeft: '3px solid var(--clay)' }}>
          <p style={{ margin: '0 0 9px' }}>
            <strong>
              "Give me every word starting with <span className="tcode">car</span>."
            </strong>{' '}
            That is type-ahead and search suggestions.
          </p>
          <p style={{ margin: '0 0 9px' }}>
            <strong>"List the words in alphabetical order."</strong>
          </p>
          <p style={{ margin: 0 }}>
            <strong>"What's the longest stored word that begins this string?"</strong> This is how a
            router decides where to send <span className="tcode">10.0.5.7</span>.
          </p>
        </div>
      </Reveal>
      <Reveal as="p">
        A hash table answers none of these without inspecting everything, because it threw away the
        structure that would help. A <strong>trie</strong> (a few useful terms below) is what you
        build when you refuse to throw that structure away. You treat a word not as one opaque blob
        to be hashed, but as a <em>sequence of letters to be walked</em>.
      </Reveal>
      <Reveal>
        <Callout title="four words for the map">
          A <strong>prefix</strong> is any starting stretch of a word (
          <span className="tcode">c</span>, <span className="tcode">ca</span>,{' '}
          <span className="tcode">car</span> are prefixes of "card"). A <strong>node</strong> is a
          place on the map. An <strong>edge</strong> is one labelled step between places. A node is{' '}
          <strong>terminal</strong> when a real word ends there. The root is the empty prefix, where
          every word begins.
        </Callout>
      </Reveal>
    </section>
  );
}
