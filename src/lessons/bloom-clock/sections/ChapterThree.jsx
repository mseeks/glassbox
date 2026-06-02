import { ChapterTitle, Prose, PullQuote, Section } from '../components/atoms.jsx';

export const ChapterThree = () => (
  <Section id="ch3" narrow>
    <ChapterTitle
      number="III"
      eyebrow="THE TRADE"
      title="Give up exactness, keep one direction"
      sub="The single idea that makes the Bloom clock possible."
    />
    <Prose dropcap>
      <p>
        Here is the move. Instead of one slot per node, allocate a fixed-size array of counters.
        Call its size <em>m</em>, where <em>m</em> is chosen once and never changes. It might be 64.
        It might be 256. It is decoupled, completely, from the size of the cluster.
      </p>
      <p>
        How do we record events in this array if there's no slot for each node? With the same trick
        a Bloom filter uses for set membership: hash the node's identity into <em>k</em> positions
        in the array, and increment those. Multiple nodes may share positions. Their increments mix.
        We are not, in fact, tracking who did what. We're tracking <em>how much has been done</em>,
        spread across <em>m</em> bins by <em>k</em> hash functions.
      </p>
      <p>
        This sounds like throwing information away. It is. The whole point is what survives. When
        you merge two such arrays by taking the pointwise max, exactly the merge a vector clock
        uses, and compare them component-wise, one miraculous property remains intact:{' '}
        <em>if A really did happen before B, then B's array dominates A's in every position</em>.
      </p>
      <p>
        That property is a mathematical certainty. It comes for free from the pointwise-max merge.
        And it gives us a one-sided error structure: the Bloom clock can be confidently{' '}
        <em>wrong about happens-before</em>
        (saying "A might have caused B" when they're actually concurrent), but it can{' '}
        <em>never miss a real concurrency</em>. Same trade as a Bloom filter. One error direction is
        exact, the other is probabilistic.
      </p>
    </Prose>

    <PullQuote accent="#b794f4">
      Fixed size. Probabilistic in one direction.
      <br />
      Exact in the other.
    </PullQuote>

    <Prose>
      <p>
        The rest of this masterclass is what falls out of that single decision. How the construction
        works in detail. What the merge does. What comparison returns and how to read its verdicts.
        Why one error direction is exact while the other isn't. How the probabilistic side decays
        with use, and what to do about it. Where this clock sits among its siblings, and when it's
        the right tool to reach for.
      </p>
    </Prose>
  </Section>
);
