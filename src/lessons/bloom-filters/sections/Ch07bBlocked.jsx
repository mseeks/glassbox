import { Chapter } from '../components/Chapter.jsx';

export function Ch07bBlocked() {
  return (
    <Chapter num="07b" title="Blocked Bloom Filter" anchor="ch-07b">
      <p>
        Restructure the array into blocks the size of a cache line — typically 64 bytes, 512 bits. A
        first hash picks a block; the <code>k</code> "real" hashes set bits{' '}
        <em>only within that one block</em>.
      </p>
      <p>
        Result: <strong>one cache miss per query</strong>, not <code>k</code>. The FPR for the same
        memory is slightly worse — each block is its own tiny filter with its own load-factor
        variance — but in practice throughput is multiples higher because we no longer scatter
        memory accesses.
      </p>
    </Chapter>
  );
}
