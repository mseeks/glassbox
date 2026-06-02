import { Chapter } from '../components/Chapter.jsx';

export function Ch02TheConstruction() {
  return (
    <Chapter num="02" title="The Construction" anchor="ch-02">
      <p>
        The whole thing fits on a postcard. Two ingredients: a bit array of <code>m</code> bits, all
        zero; and <code>k</code> hash functions, each mapping any input to a position in the range{' '}
        <code>[0, m)</code>.
      </p>
      <p>
        To <strong>insert</strong> <em>x</em>: compute the <code>k</code> hashes, set those{' '}
        <code>k</code> bits to one. That's it. You never store <em>x</em>.
      </p>
      <p>
        To <strong>query</strong> <em>y</em>: compute the same <code>k</code> hashes. If all{' '}
        <code>k</code> of those bits are one, return <em className="bf-mark-amber">probably yes</em>
        . If any is zero, return <em className="bf-mark-emerald">definitely no</em>.
      </p>
      <p>
        The certainty on the "no" side is structural. When <em>x</em> was inserted, those{' '}
        <code>k</code> bits got set to one and we never clear them — so if you ever query <em>x</em>{' '}
        later, those same bits will still be set. False negatives are physically impossible.
      </p>
      <p>
        The uncertainty on the "yes" side is also structural. Different items share hash positions.
        After enough insertions, some pattern of bits set by <em>other</em> items may coincidentally
        cover all <code>k</code> of <em>y</em>'s positions, even though <em>y</em> was never
        inserted. That coincidence is the false positive. It cannot be eliminated; it can only be
        made rare.
      </p>
    </Chapter>
  );
}
