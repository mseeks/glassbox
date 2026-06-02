import { Reveal } from '../../../shared/reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import TreeBuilder from '../labs/TreeBuilder.jsx';

// §3 — Construction: hash upward, two at a time. Auto-playing tree-builder
// animation between two passages of prose.
export default function Construction() {
  return (
    <section className="mk-section">
      <SectionHeader id="build" kicker="Construction" title="Hash upward, two at a time" />
      <Reveal base="mk-reveal" className="mk-prose">
        <p className="lead">
          The recipe has three lines. Hash each item into a <em>leaf</em>. Pair adjacent leaves and
          hash the pair into a parent. Repeat, halving the count each level, until one node remains:
          the <em>root</em>.
        </p>
      </Reveal>

      <Reveal base="mk-reveal">
        <TreeBuilder />
      </Reveal>

      <Reveal base="mk-reveal" className="mk-prose" style={{ marginTop: 22 }}>
        <p>
          Eight transactions become four parents, then two, then one. For <code>N</code> leaves you
          get a tree of depth <span className="mk-code-inline">⌈log₂ N⌉</span>. The root is a single
          fingerprint that depends on every byte of every leaf, so the smallest edit anywhere below
          is forced all the way up to the top, with nowhere to hide along the way. Change anything.
          The root shifts. That is exactly the property we exploit next.
        </p>
        <div className="mk-marginalia">
          A subtle production detail: when a level has an odd number of nodes, the lone node is
          paired with a copy of itself so the tree stays balanced. Different systems handle this
          differently; the principle is unchanged.
        </div>
      </Reveal>
    </section>
  );
}
