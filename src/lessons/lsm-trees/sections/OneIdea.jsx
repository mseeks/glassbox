import Movement from '../components/Movement.jsx';
import Heading from '../components/Heading.jsx';
import Prose from '../components/Prose.jsx';
import BoreholeLab from '../labs/BoreholeLab.jsx';

// §I — Newest wins. The whole structure rests on one rule you can hold in
// your hand.
export default function OneIdea() {
  return (
    <Movement id="one">
      <Heading
        n="I"
        kicker="the one idea"
        title="Newest Wins"
        lede="Forget disks and trees for a moment. The whole structure rests on one rule you can hold in your hand: never change a value in place, lay a newer one on top, and to read, take the topmost."
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.05fr)',
          gap: 40,
          alignItems: 'start',
        }}
        className="g2"
      >
        <Prose dropcap>
          <p>
            Imagine a value, an account balance, say, recorded not by editing a number but by
            dropping a fresh note on top of a pile. The pile only grows. The number forty was true
            once; later it was ninety-five; now it is one hundred and twenty. All three notes are
            still in the pile, in the order they happened.
          </p>
          <p>
            To answer <em>"what is the balance?"</em> you do not search the whole pile. You take the
            top note. It is, by construction, the newest, and the newest is the truth. This is the
            single rule the entire log-structured merge-tree is built to honour at scale:
            <strong> recency is depth, and the shallowest answer wins.</strong>
          </p>
          <p>
            Even deletion obeys it. You cannot reach into the pile and pull out the old notes; that
            would mean rewriting history, the very thing we are avoiding. So a delete is just
            another note laid on top, one that reads <em>"nothing here."</em> We call it a{' '}
            <em>tombstone</em>. The old values survive beneath it, shadowed but not erased, a fact
            that will cost us later, in §VII.
          </p>
          <div className="pull">
            Recency is depth.
            <br />
            The <span className="accent">shallowest</span> answer wins.
          </div>
        </Prose>
        <BoreholeLab />
      </div>
    </Movement>
  );
}
