import Hero from './sections/Hero.jsx';
import Problem from './sections/Problem.jsx';
import Idea from './sections/Idea.jsx';
import Stops from './sections/Stops.jsx';
import Payoff from './sections/Payoff.jsx';
import Cost from './sections/Cost.jsx';
import Radix from './sections/Radix.jsx';
import Family from './sections/Family.jsx';
import Uses from './sections/Uses.jsx';
import Coda from './sections/Coda.jsx';
import './trie.css';

/* ════════════════════════════════════════════════════════════════
   TRIE — a route map for words.
   Aesthetic: cartographer's atlas. Sea-glass paper, pine ink,
   route colours, vermilion "word ends here" signal.

   Composition root. The trie engine (buildTrie / buildRadix /
   layoutTrie / layoutRadix) lives in ./engine; reusable visuals
   (TrieMap, Reveal, SectionHead, Callout, MapLegend) + shared
   helpers (WORDS / tracePath / subtreeIds / completionsOf) live in
   ./components; the four labs live in ./labs; the nine sections
   plus Hero live in ./sections. This shell just wires them.
   ════════════════════════════════════════════════════════════════ */
export default function TrieLesson() {
  return (
    <div className="trie-root">
      <div className="trie-wrap">
        <Hero />
        <Problem />
        <Idea />
        <Stops />
        <Payoff />
        <Cost />
        <Radix />
        <Family />
        <Uses />
        <Coda />
      </div>
    </div>
  );
}
