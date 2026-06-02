import Chapter from '../components/Chapter.jsx';
import HashLab from '../labs/HashLab.jsx';

// 03 · From coins to keys — a good hash makes real items behave like coins, and
// hands you free deduplication.
export default function Chapter03() {
  return (
    <Chapter n="03" title="From coins to keys">
      <p className="lead">
        Real items aren't coins. A good <em className="k">hash</em> makes them behave like coins.
      </p>
      <p>
        Hashing has an <strong>avalanche</strong> property: flip one bit of the input and about half
        the output bits flip, unpredictably. The output looks statistically like fair coin-flips.
        That is exactly the randomness the oracle needs. No adversary is involved here, only data,
        so a fast non-cryptographic hash like MurmurHash is the right tool; there is no need to pay
        for cryptographic strength.
      </p>
      <p>
        And one property falls out for free.{' '}
        <strong>The same item always hashes to the same bits.</strong> Seeing a visitor a thousand
        times produces the identical run a thousand times, and a repeat can never raise the maximum.
        The item's identity collapses entirely into its hash. So the structure counts distinct
        things without ever storing, or even noticing, the duplicates.
      </p>
      <HashLab />
      <p>
        Type a word twice on the bench and watch the bits land in exactly the same place, run
        unchanged, the maximum untouched. No movement. That is deduplication achieved by arithmetic
        rather than bookkeeping.
      </p>
    </Chapter>
  );
}
