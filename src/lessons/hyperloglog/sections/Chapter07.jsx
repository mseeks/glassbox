import Chapter from '../components/Chapter.jsx';
import MergeLab from '../labs/MergeLab.jsx';

// 07 · Count anywhere, merge everywhere — the mergeability (element-wise max)
// that made HyperLogLog ubiquitous across analytics engines.
export default function Chapter07() {
  return (
    <Chapter n="07" title="Count anywhere, merge everywhere">
      <p className="lead">
        The property that made HyperLogLog ubiquitous isn't its size. It's that two sketches combine
        perfectly.
      </p>
      <p>
        To merge two register banks, take the <strong>larger value in each cell</strong>. That's
        all. The maximum is associative and commutative, and it is idempotent too, so merges can
        happen in any order, any number of times, with no double-counting. A visitor who lands on
        three different shards raises the same registers on each, so the merged sketch still counts
        them <em className="k">once</em>.
      </p>
      <MergeLab />
      <p>
        This is why every analytics engine reaches for it. <strong>Redis</strong> exposes it as{' '}
        <code>PFADD</code> / <code>PFCOUNT</code> / <code>PFMERGE</code>, where the "PF" is a
        tribute to Philippe Flajolet. <strong>BigQuery</strong>'s <code>APPROX_COUNT_DISTINCT</code>{' '}
        runs it. So do Presto, Spark, Druid, plus Elasticsearch underneath. Count distinct visitors
        on each server. Ship the tiny sketches to one place and merge them there, with no gigabytes
        in flight and no double counting. Unions are exact in spirit. But{' '}
        <em className="k">intersections</em> via inclusion&ndash;exclusion compound the error, which
        is where a structure like MinHash, built for overlap, takes over.
      </p>
    </Chapter>
  );
}
