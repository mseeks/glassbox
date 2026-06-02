import { ChapterTitle, Code, Prose, Section } from '../components/atoms.jsx';
import { ConstructionLab } from '../labs/ConstructionLab.jsx';

export const ChapterFour = () => (
  <Section id="ch4">
    <ChapterTitle
      number="IV"
      eyebrow="CONSTRUCTION"
      title="What the clock is, mechanically"
      sub="Three operations. That's the entire data structure."
    />
    <div style={{ maxWidth: 760 }}>
      <Prose dropcap>
        <p>
          A Bloom clock is two things and three operations. The two things: an array of <em>m</em>{' '}
          integer counters (all zero to start), and <em>k</em>
          independent hash functions that map any node identity to a position in the array. The
          three operations:
        </p>
        <p>
          <strong>Record an event.</strong> When node X has a local event, compute the k hash
          positions for X's identity and increment each of those counters by one. Notice there is no
          "X's slot." Node identity is smeared across k positions by the hashes.
        </p>
        <p>
          <strong>Merge.</strong> When node X receives a clock B from elsewhere (a message, a gossip
          payload), update each of X's own counters to the maximum of itself and B's corresponding
          counter. Then record the receive as a local event.
        </p>
        <p>
          <strong>Compare.</strong> Given two clocks A and B, compare them position-by-position.
          We'll do this in the next chapter — for now, just build intuition by playing with the
          construction below.
        </p>
      </Prose>
    </div>

    <div style={{ marginTop: 40 }}>
      <ConstructionLab />
    </div>

    <div style={{ maxWidth: 760, marginTop: 40 }}>
      <Prose>
        <p>
          A few details worth pausing on. The hash functions must be independent — k functions that
          always return the same position would just be one function doing extra work. In practice
          we use one or two well-mixed base hashes and combine them with different seeds, or use the
          double-hashing trick (<Code>h_i(x) = a(x) + i · b(x)</Code>) which is provably good enough
          for this use case.
        </p>
        <p>
          The counters are <em>integers</em>, not bits — this is the key structural difference from
          a Bloom filter. A Bloom filter sets bits to 1; a Bloom clock <em>increments</em>. The
          counters grow without bound (until we age them, in a later chapter). That growth is what
          carries causal information forward.
        </p>
        <p>
          And the merge is the same merge a vector clock uses: pointwise max. This is not
          coincidence. It's the move that makes the structure compositional — you can merge in any
          order, merge the same clock twice, merge a clock with itself, and the result is
          well-defined. The merge is associative, commutative, and idempotent. That makes the Bloom
          clock a <em>semilattice</em>, which is the algebraic shape that powers everything from
          CRDTs to MVCC snapshot reads.
        </p>
      </Prose>
    </div>
  </Section>
);
