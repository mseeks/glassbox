import { Chapter } from '../components/Chapter.jsx';

export function Ch06TheLimits() {
  return (
    <Chapter num="06" title="The Limits" anchor="ch-06">
      <p>The five things a basic Bloom filter cannot do.</p>
      <p>
        <strong>No deletion.</strong> Setting a bit to zero would also unset bits belonging to other
        items that share that position. That introduces false negatives, the one error mode we are
        not allowed. Counting Bloom filters fix this with counters; cuckoo filters fix it with
        fingerprints; standard BFs accept the limitation.
      </p>
      <p>
        <strong>No iteration.</strong> The filter contains no keys, only bits. You cannot enumerate
        what's been inserted. If you need that, you need a real index.
      </p>
      <p>
        <strong>No exact count.</strong> You can <em>estimate</em> it from the bit-set ratio:{' '}
        <code>n ≈ −(m/k) · ln(1 − X/m)</code>, where <code>X</code> is the number of set bits. But
        the estimate has noise and loses precision at high load.
      </p>
      <p>
        <strong>No resize.</strong> <code>m</code> and <code>k</code> are baked in at construction.
        To grow, you must rebuild. And you can't rebuild from the filter itself, because the filter
        doesn't remember the inputs.
      </p>
      <p>
        <strong>Bad cache behavior.</strong> <code>k</code> random bit accesses across an{' '}
        <code>m</code>-bit array means <code>k</code> cache misses per query in the worst case. For
        filters bigger than L1, that's the dominant cost. Blocked variants fix this.
      </p>
    </Chapter>
  );
}
