import { Chapter } from '../components/Chapter.jsx';

export function Ch04bImplementationNote() {
  return (
    <Chapter num="04b" title="An implementation note" anchor="ch-04b">
      <p>
        You don't actually compute <code>k</code> separately-coded hash functions in production.
        Kirsch and Mitzenmacher (2006) showed that <em>two</em> are enough — derive the rest as{' '}
        <code>g_i(x) = h₁(x) + i · h₂(x) mod m</code>, for <code>i</code> from 0 to{' '}
        <code>k − 1</code>.
      </p>
      <p>
        The construction works because, even though the <code>g_i</code> are correlated, the
        correlations don't show up in the FPR analysis. Two real hashes, <code>k</code> cheap
        arithmetic operations, the same FPR as if you had <code>k</code> independent hashes. Nearly
        every real implementation does this — including the one powering the labs above.
      </p>
    </Chapter>
  );
}
