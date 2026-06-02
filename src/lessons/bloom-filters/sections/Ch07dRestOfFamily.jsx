import { Chapter } from '../components/Chapter.jsx';

export function Ch07dRestOfFamily() {
  return (
    <Chapter num="07d" title="The rest of the family" anchor="ch-07d">
      <p>
        <strong>Partitioned BF.</strong> Each of the <code>k</code> hash functions gets its own{' '}
        <code>m/k</code>-sized slice. Each insert sets exactly one bit per slice; each query checks
        one bit per slice. Same asymptotic FPR, cleaner analysis, easier parallelization.
      </p>
      <p>
        <strong>Quotient Filter.</strong> Another fingerprint-based approach. The fingerprint splits
        into a <em>quotient</em> (used as the bucket address) and a <em>remainder</em> (stored in
        the bucket). Fingerprints with the same quotient cluster into adjacent slots — excellent
        disk locality. Supports deletion, merging, and resizing, all of which classical BFs cannot
        do. Used in some LSM tree implementations precisely because merging quotient filters aligns
        with SSTable compaction.
      </p>
      <p>
        <strong>XOR Filter and Ribbon Filter.</strong> For <em>static</em> sets known at
        construction time. Both use a linear system over GF(2) — fingerprints at certain positions
        XOR together to equal each key's expected value. Significantly smaller than a Bloom filter
        at the same FPR — XOR filters are ~25% smaller; Ribbon tighter still. Fatal limitation:
        cannot be updated after construction. Perfect for SSTables, which are themselves immutable.
        Modern RocksDB uses Ribbon filters for new SSTables.
      </p>
      <p>
        <strong>Stable BF.</strong> For streaming data where only recent items matter. On each
        insert, a small number of randomly-chosen cells are decremented. The filter reaches a steady
        state where the FPR for recently-inserted items stays bounded but ancient items get
        forgotten. Useful for click-stream deduplication, ad serving, "have we shown this user this
        thing in the last hour?"
      </p>
      <p>
        <strong>Bloomier Filter.</strong> Generalizes membership to <em>function lookup</em>. Given
        a static set with associated values, returns the correct value for keys in the set and
        arbitrary values for keys outside. Compact key-value lookup at BF cost.
      </p>
      <p>
        <strong>Learned BF.</strong> Train a small neural network to predict membership. Use the
        model as a fast first check; back it with a small standard Bloom filter that catches what
        the model is uncertain about. Empirically beats classical BFs when the set has{' '}
        <em>learnable structure</em> — a malicious URL list, for example, where the strings
        themselves carry signal. Doesn't help when the set is genuinely random.
      </p>
    </Chapter>
  );
}
