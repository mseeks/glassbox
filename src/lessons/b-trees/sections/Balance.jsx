import { Reveal } from '../../../shared/reveal.jsx';
import Section from '../components/Section.jsx';
import ImbalanceVisual from '../labs/ImbalanceVisual.jsx';

// §IV — balance. Why a binary search tree wants to lean (the in-order vine),
// the two philosophies that answer it, and the B-tree's choice: make imbalance
// impossible. Renders the imbalance toggle lab.
export default function Balance() {
  return (
    <Section roman="IV" kicker="Balance" title="Why a tree wants to lean">
      <Reveal base="bt-rev">
        <p className="bt-p">
          A binary search tree has one rule: smaller keys left, larger right. Insert keys that
          arrive already sorted and every key goes right, right, right &mdash; you don&rsquo;t get a
          tree, you get a <span className="bt-stampc">vine</span>. Depth piles up on one side while
          the other stays empty; the promised bushy, shallow shape becomes a single dangling string.
          That is imbalance.
        </p>
      </Reveal>
      <ImbalanceVisual />
      <Reveal base="bt-rev">
        <p className="bt-p">
          Two philosophies answer it. The first is to <strong>repair after the fact</strong> with
          rotations: grab the leaning middle node, lift it up to be the local top, and re-hang its
          neighbors beneath. AVL and red-black trees do this on every insert &mdash; let imbalance
          happen, detect it locally, pivot it away. Reactive, logarithmic, and exactly what you want
          for an in-memory map. But here a node is a four-kilobyte page; rotating on every insert is
          the page-thrashing we&rsquo;re trying to avoid.
        </p>
      </Reveal>
      <Reveal base="bt-rev">
        <p className="bt-lead">
          The B-tree takes the other path entirely: <strong>make imbalance impossible.</strong>
        </p>
      </Reveal>
    </Section>
  );
}
