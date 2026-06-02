import { Chapter } from '../components/Chapter.jsx';

export function Ch08TheCousins() {
  return (
    <Chapter num="08" title="The Cousins" anchor="ch-08">
      <p>A brief tour of structures that solve adjacent problems with the same machinery.</p>
      <p>
        <strong>HyperLogLog</strong> doesn't do membership; it counts. Given a stream, it estimates
        the number of <em>distinct</em> items seen, using ~1.5 KB of memory regardless of how many
        items have passed. The trick is recording the maximum number of leading zeros in the hash of
        any seen item — which encodes the cardinality with logarithmic precision.
      </p>
      <p>
        <strong>Count-Min Sketch</strong> estimates <em>frequencies</em> in a stream. Like a
        counting Bloom filter tuned for finding heavy hitters: which keys appear most often? Used
        heavily in network monitoring and load balancing.
      </p>
      <p>
        <strong>MinHash</strong> estimates <em>Jaccard similarity</em> between two sets — how much
        do they overlap? — without ever materializing either set in full. The basis of
        locality-sensitive hashing used in plagiarism detection, near-duplicate document search, and
        recommender systems.
      </p>
      <p>
        These structures share a family resemblance: each gives up exact answers for compact,
        bounded-error approximations, and each uses hashing as the primitive that makes the
        approximation work. The Bloom filter is the canonical member; the rest are siblings.
      </p>
    </Chapter>
  );
}
