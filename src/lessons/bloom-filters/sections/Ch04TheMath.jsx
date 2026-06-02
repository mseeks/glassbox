import { Chapter } from '../components/Chapter.jsx';

export function Ch04TheMath() {
  return (
    <Chapter num="04" title="The Math" anchor="ch-04">
      <p>
        Where the ten-bits-per-element number comes from. Let <code>m</code> be bits, <code>n</code>{' '}
        items inserted, <code>k</code> hash functions. After <code>n</code> insertions of{' '}
        <code>k</code> bit-sets each (that is <code>kn</code> bit operations), the probability a
        specific bit is still zero is the probability nothing has touched it:
      </p>
      <div className="bf-formula">
        <span className="op">P</span>(bit is 0) <span className="op">=</span> (1 − 1/m)<sup>kn</sup>{' '}
        <span className="op">≈</span> <span className="lhs">e</span>
        <sup>−kn/m</sup>
      </div>
      <p>
        A false positive requires all <code>k</code> bits checked during a query to be one. Assuming
        independence (an approximation that holds well in practice):
      </p>
      <div className="bf-formula">
        <span className="lhs">FPR</span> <span className="op">≈</span> (1 − e<sup>−kn/m</sup>)
        <sup>k</sup>
      </div>
      <p>
        Now: for fixed <code>m</code> and <code>n</code>, what <code>k</code> minimizes this? Take
        the derivative, set to zero. The optimum collapses to a clean form:
      </p>
      <div className="bf-formula">
        <span className="lhs">k*</span> <span className="op">=</span> (m/n) · ln 2{' '}
        <span className="op">≈</span> 0.693 · (m/n)
        <br />
        <span className="lhs">FPR*</span> <span className="op">=</span>{' '}
        <span className="num">(1/2)</span>
        <sup>k*</sup>
        <br />
        <span className="lhs">m/n</span> <span className="op">=</span> −log₂(FPR) / ln 2
      </div>
      <p>
        The numbers to memorize. 1% FPR → <strong>9.6 bits</strong> per element (<code>k ≈ 7</code>
        ). 0.1% → 14.4 bits (<code>k ≈ 10</code>). 0.01% → 19.2 bits (<code>k ≈ 13</code>). Each
        tenfold reduction in error rate costs about another 4.8 bits per element. That is the slope
        of the trade.
      </p>
      <p>
        And note the property that makes Bloom filters strange and beautiful:{' '}
        <em>m/n doesn't depend on the size of the elements.</em> Whether you're hashing tweets or
        hashing IPv6 addresses, the bits-per-element budget is the same. The element's identity
        collapses into the hash; only the count of elements matters thereafter.
      </p>
    </Chapter>
  );
}
