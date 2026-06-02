import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import Callout from '../components/Callout.jsx';
import FanoutLab from '../labs/FanoutLab.jsx';

// §I — the problem. Why a balanced binary tree is catastrophic on disk, and
// the one hardware fact (a page fetch is the expensive thing) that the whole
// B-tree is built around. Renders the fan-out lab.
export default function Problem() {
  return (
    <Section roman="I" kicker="The problem" title="A billion keys, kept in order">
      <Reveal base="bt-rev">
        <p className="bt-lead">
          Forget databases for a moment. You have a billion keys, and you need two things from them:
          look one up fast, and walk them <span className="bt-em">in order</span> &mdash; every name
          between Garcia and Gomez. That second requirement is the whole game.
        </p>
      </Reveal>
      <Reveal base="bt-rev">
        <p className="bt-p">
          A hash table wins the first and loses the second outright: it shreds order into noise, so
          &ldquo;the next key after this one&rdquo; is meaningless. So you reach for a balanced
          binary search tree &mdash; sorted, logarithmic lookups, in-order traversal for free. Story
          over? Not once the data lives on disk.
        </p>
      </Reveal>
      <Reveal base="bt-rev">
        <p className="bt-p">
          On disk, the unit of cost isn&rsquo;t comparing two keys &mdash; it&rsquo;s fetching a{' '}
          <strong>page</strong>. Ask the disk for a single byte and it hands back a whole page,{' '}
          <strong>four to sixteen kilobytes</strong>, because the expensive part was the trip, not
          the bytes. Picture a warehouse forklift: the run out to the shelf takes about five
          milliseconds whether you grab one box or a full pallet. The trip dominates everything.
        </p>
      </Reveal>
      <Reveal base="bt-rev">
        <p className="bt-p">
          Now price the binary tree under that model. A billion keys, balanced, is roughly{' '}
          <strong>thirty levels</strong> deep, each living at some unpredictable address &mdash;
          about thirty forklift trips per lookup. At a few milliseconds each, that&rsquo;s a tenth
          of a second to find one key. Catastrophic. The tree is paying one disk seek per level, and
          it has far too many levels.
        </p>
      </Reveal>
      <Callout title="The one hardware fact">
        A page fetch is the expensive thing. The entire B-tree is built to make each one count
        enormously &mdash; drag the branching factor below and watch thirty levels collapse into
        three.
      </Callout>

      <FanoutLab />

      <Reveal base="bt-rev">
        <p className="bt-p">
          A binary node holds one key and two pointers &mdash; a few bytes &mdash; and then pays a
          full page fetch to read them. A forklift trip for a nearly empty pallet. So stuff the node
          until it fills the page: at about sixteen bytes per key-and-pointer, a four-kilobyte page
          holds a couple hundred keys and fans out a couple hundred ways.{' '}
          <strong>That single decision is the entire B-tree.</strong>
        </p>
      </Reveal>
      <Reveal base="bt-rev">
        <p className="bt-p">
          It never got a smarter algorithm than the binary tree &mdash; same comparisons, same
          logarithmic complexity. It just chose a <span className="bt-em">base</span> for that
          logarithm to match the hardware, collapsing thirty levels into three or four. The{' '}
          <span className="bt-stampc">B</span> most likely stands for{' '}
          <span className="bt-em">balanced</span> &mdash; from Bayer and McCreight in 1970, who
          coyly never said so.
        </p>
      </Reveal>
    </Section>
  );
}
