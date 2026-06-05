import { Chapter } from '../components/Chapter.jsx';

export function Ch10WhenNotTo() {
  return (
    <Chapter num="10" title="When Not To Reach For One" anchor="ch-10">
      <p>The four signals that a Bloom filter is the wrong tool.</p>
      <p>
        <strong>Small n.</strong> Below a thousand or so elements, the constants dwarf the
        asymptotic savings. Use a hash set.
      </p>
      <p>
        <strong>Need deletion.</strong> Reach for a cuckoo or quotient filter. Counting BFs work but
        pay 4×.
      </p>
      <p>
        <strong>Need enumeration or accurate counting.</strong> Bloom filters structurally cannot do
        this. You need a real index, perhaps backed by a Bloom filter for the fast-skip path.
      </p>
      <p>
        <strong>Static set, known in advance.</strong> A perfect hash function, an XOR filter, or a
        Ribbon filter beats Bloom filters on space. Use them when you can.
      </p>
    </Chapter>
  );
}
