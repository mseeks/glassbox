import { Chapter } from '../components/Chapter.jsx';

export function Ch01TheQuestion() {
  return (
    <Chapter num="01" title="The Question" anchor="ch-01">
      <p>
        You have a set. It might be ten billion URLs Chrome wants to check against a malware list.
        Ten billion keys an LSM tree might or might not have on disk. Every transaction a Bitcoin
        node has ever heard about. You want to ask, of any candidate <em>x</em>, the simplest
        possible question: <em>is x in the set?</em>
      </p>
      <p>
        An exact answer is expensive. A hash table is O(1) but stores every key in full. At ten
        billion 100-byte URLs, that is a terabyte. A sorted structure is O(log n) but still
        proportional to <em>the size of the keys themselves</em>. At the scales modern systems
        operate, that bill becomes the whole story.
      </p>
      <p>
        Bloom filters answer a relaxed question. Instead of <em>"is x in the set?"</em> they answer{' '}
        <em>"is x possibly in the set?"</em> The answer comes in two flavors:
      </p>
      <p>
        <strong>Definitely not.</strong> With perfect confidence. Move on.{' '}
        <strong>Probably yes.</strong> With a tunable false positive rate. Go check the real source.
      </p>
      <p>
        The asymmetry is everything. False positives are allowed; false negatives are forbidden. And
        the cost of buying into that asymmetry is shockingly small: about ten bits per element for a
        one-percent error rate, <em>regardless</em> of how big the elements actually are. A
        two-hundred-byte URL costs the same ten bits as a four-byte integer. The size of the keys
        vanishes from the equation.
      </p>
      <div className="bf-pullquote">
        That is the trade: exact answers for compact, one-sided uncertainty. It is the entire idea.
        Everything else is craft.
      </div>
    </Chapter>
  );
}
