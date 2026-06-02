import { Chapter } from '../components/Chapter.jsx';

export function Ch07TheVariants() {
  return (
    <Chapter num="07" title="The Variants" anchor="ch-07">
      <p>
        The basic Bloom filter is rarely the right answer in production anymore. Each variant solves
        one of its limitations, often at the cost of another. The art is knowing which trade fits
        your shape.
      </p>
      <p>
        <strong>Counting Bloom Filter.</strong> Replace each bit with a small counter — typically 4
        bits, sometimes 8. Insert increments; delete decrements. Deletion at 4× the memory cost. The
        4-bit width is calibrated so that, at the load factors a well-tuned filter actually sees,
        the probability of any counter overflowing 15 is vanishingly small. Counter overflow is a
        real failure mode at high load — once a counter saturates, you cannot decrement it correctly
        anymore.
      </p>
    </Chapter>
  );
}
