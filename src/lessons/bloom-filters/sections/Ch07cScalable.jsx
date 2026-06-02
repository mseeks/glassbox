import { Chapter } from '../components/Chapter.jsx';

export function Ch07cScalable() {
  return (
    <Chapter num="07c" title="Scalable Bloom Filter" anchor="ch-07c">
      <p>
        The fix for unknown <code>n</code>. Chain a sequence of standard BFs with geometrically
        tightening FPR targets — each new filter has a fraction of its predecessor's FPR (typically
        half).
      </p>
      <p>
        Insertions go to the newest filter; queries check <em>all</em> of them. The total false
        positive rate converges to a tunable bound, no matter how many items you eventually insert.
        You give up determinism on query cost — every query touches every filter in the chain — but
        you keep your FPR ceiling.
      </p>
    </Chapter>
  );
}
