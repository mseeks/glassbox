import { Reveal } from '../../../shared/reveal.jsx';
import SectionHead from '../components/SectionHead.jsx';

// §V — What the map costs to keep. Pure prose; the honest trade-offs.
export default function Cost() {
  return (
    <section className="section">
      <Reveal>
        <SectionHead n="V" kicker="Honest trade-offs" title="What the map costs to keep" />
      </Reveal>
      <Reveal as="p" className="lead">
        Tries are not free, and a good engineer names the price up front.
      </Reveal>
      <Reveal as="p">
        <strong>Space and pointers.</strong> Every junction needs a way to find each of its outgoing
        tracks. Done naively, with a fixed slot for every possible letter at every node, most slots
        sit empty. The wasted space dwarfs the words themselves. The art of implementing tries is
        mostly the art of storing a node's children compactly.
      </Reveal>
      <Reveal as="p">
        <strong>Scattered memory.</strong> Each step down the map is a jump to another node that may
        live anywhere in memory. A modern processor loves reading neighbouring bytes and hates
        chasing pointers to random addresses. So a long word can cost a string of cache misses, one
        per letter. A flat hash table, for all it can't do, often touches memory far more kindly.
      </Reveal>
      <Reveal as="p">
        <strong>Pointless single-child chains.</strong> Store one long word like{' '}
        <span className="tcode">internationalisation</span> and you get a tower of junctions, each
        leading to exactly one next junction: a corridor with no doors. That's pure overhead, and it
        points straight at the fix.
      </Reveal>
    </section>
  );
}
