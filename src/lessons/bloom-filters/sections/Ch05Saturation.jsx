import { Chapter } from '../components/Chapter.jsx';

export function Ch05Saturation() {
  return (
    <Chapter num="05" title="Saturation" anchor="ch-05">
      <p>
        A Bloom filter is sized for a specific <code>n</code>. Insert that many items at the optimal{' '}
        <code>k</code> and you hit your target FPR. Insert fewer and you do better than promised.
        Insert <em>more</em> and the FPR doesn't degrade gracefully.
      </p>
      <p>
        It climbs, then it sprints, then it asymptotes near 100%. Past a certain load, the filter
        says <em className="bf-mark-amber">yes</em> to almost everything; it has saturated, and at
        that point it is <em>worse than no filter at all</em>. You pay the bits, you do the hashes,
        and you skip nothing. All cost, no skip.
      </p>
      <p>
        This brittleness is why sizing matters, and why several variants in the next chapter exist:
        scalable filters that grow with the load, stable filters that forget, counting filters that
        allow shrinking.
      </p>
    </Chapter>
  );
}
